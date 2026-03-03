import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../../shared/ui/card";
import { Button } from "../../shared/ui/button";
import { Input } from "../../shared/ui/input";
import { Label } from "../../shared/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../shared/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../shared/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../shared/ui/select";
import { Badge } from "../../shared/ui/badge";
import { Textarea } from "../../shared/ui/textarea";
import { Plus, ChevronLeft, ChevronRight, Clock, User, Trash2, Edit, CalendarIcon, X, Search, Filter, List, Calendar, XCircle } from "lucide-react";
import { toast } from "sonner";

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface Service {
  id: string;
  name: string;
  category: string;
  duration: number;
  price: number;
}

interface Employee {
  id: string;
  name: string;
  specialty: string;
  color: string;
}

interface Client {
  id: number;
  name: string;
  phone: string;
}

interface AppointmentService {
  serviceId: string;
  serviceName: string;
  employeeId: string;
  employeeName: string;
  duration: number;
  startTime: string;
}

interface Appointment {
  id: number;
  clientName: string;
  clientPhone: string;
  date: Date;
  services: AppointmentService[];
  totalDuration: number;
  startTime: string;
  endTime: string;
  status: "pending" | "cancelled" | "completed";
  notes?: string;
}

interface AppointmentsModuleProps {
  userRole: "admin" | "employee" | "client";
}

// ─── Constantes ──────────────────────────────────────────────────────────────

const API_BASE = "http://localhost:3001";

const TIME_SLOTS = [
  "08:00","08:30","09:00","09:30","10:00","10:30",
  "11:00","11:30","12:00","12:30","13:00","13:30",
  "14:00","14:30","15:00","15:30","16:00","16:30",
  "17:00","17:30","18:00","18:30",
];

const WEEK_DAYS = ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];

const TODAY = new Date();

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function calculateEndTime(startTime: string, durationMinutes: number): string {
  const [h, m] = startTime.split(":").map(Number);
  const total = h * 60 + m + durationMinutes;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function mapApiToAppointment(item: any): Appointment {
  const startTime: string = (item.Horario ?? "00:00").slice(0, 5);

  const totalDuration: number = Array.isArray(item.servicios) && item.servicios.length > 0
    ? item.servicios.reduce((sum: number, s: any) => sum + (s.duration ?? 60), 0)
    : 60;

  const endTime = calculateEndTime(startTime, totalDuration);

  let cursor = startTime;
  const services: AppointmentService[] = Array.isArray(item.servicios) && item.servicios.length > 0
    ? item.servicios.map((s: any) => {
        const svc: AppointmentService = {
          serviceId:    String(s.serviceId   ?? ""),
          serviceName:  s.serviceName  ?? "Servicio",
          employeeId:   String(s.employeeId  ?? ""),
          employeeName: s.employeeName ?? "Empleado",
          duration:     s.duration     ?? 60,
          startTime:    cursor,
        };
        cursor = calculateEndTime(cursor, svc.duration);
        return svc;
      })
    : [{
        serviceId:    "",
        serviceName:  "Sin servicio",
        employeeId:   String(item.empleado_id ?? ""),
        employeeName: item.empleado_nombre ?? "Empleado",
        duration:     60,
        startTime,
      }];

  const estadoRaw = (item.Estado ?? "Pendiente").toLowerCase();
  const status: Appointment["status"] =
    estadoRaw === "cancelada"  || estadoRaw === "cancelled"  ? "cancelled"  :
    estadoRaw === "completada" || estadoRaw === "completed"  ? "completed"  :
    "pending";

  const [y, mo, d] = (item.Fecha ?? "2000-01-01").split("-").map(Number);
  const date = new Date(y, mo - 1, d);

  return {
    id:           item.PK_id_cita,
    clientName:   item.cliente_nombre   ?? "Sin cliente",
    clientPhone:  item.cliente_telefono ?? "",
    date,
    startTime,
    endTime,
    status,
    services,
    totalDuration,
    notes: item.Notas ?? "",
  };
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function AppointmentsModule({ userRole }: AppointmentsModuleProps) {

  const [services,     setServices]     = useState<Service[]>([]);
  const [employees,    setEmployees]    = useState<Employee[]>([]);
  const [clients,      setClients]      = useState<Client[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    async function fetchAll() {
      try {
        const [sRes, eRes, cRes, aRes] = await Promise.all([
          fetch(`${API_BASE}/services`),
          fetch(`${API_BASE}/employees`),
          fetch(`${API_BASE}/clients`),
          fetch(`${API_BASE}/appointments`),
        ]);
        const [sData, eData, cData, aData] = await Promise.all([
          sRes.json(), eRes.json(), cRes.json(), aRes.json(),
        ]);
        setServices(sData);
        setEmployees(eData);
        setClients(cData);
        setAppointments(aData.map(mapApiToAppointment));
      } catch (err) {
        console.error("Error al cargar datos:", err);
        toast.error("Error al conectar con el servidor");
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  const [currentWeekStart, setCurrentWeekStart] = useState(() => getMonday(TODAY));
  const [viewMode,          setViewMode]          = useState<"calendar" | "list">("calendar");
  const [searchTerm,        setSearchTerm]        = useState("");
  const [filterStatus,      setFilterStatus]      = useState("all");
  const [isDialogOpen,      setIsDialogOpen]      = useState(false);
  const [editingAppointment,  setEditingAppointment]  = useState<Appointment | null>(null);
  const [viewingAppointment,  setViewingAppointment]  = useState<Appointment | null>(null);
  const [deleteDialogOpen,    setDeleteDialogOpen]    = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<number | null>(null);
  const [cancelDialogOpen,    setCancelDialogOpen]    = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<number | null>(null);

  const emptyForm = {
    clientId: "", clientName: "", clientPhone: "",
    date: TODAY, startTime: "", notes: "",
  };
  const [formData,         setFormData]         = useState(emptyForm);
  const [selectedServices, setSelectedServices] = useState<AppointmentService[]>([]);
  const [currentService,   setCurrentService]   = useState({ serviceId: "", employeeId: "" });

  // ── Navegación semana ──
  const getWeekDates = () =>
    Array.from({ length: 7 }, (_, i) => {
      const d = new Date(currentWeekStart);
      d.setDate(d.getDate() + i);
      return d;
    });

  const goToPreviousWeek = () => {
    const d = new Date(currentWeekStart); d.setDate(d.getDate() - 7); setCurrentWeekStart(d);
  };
  const goToNextWeek = () => {
    const d = new Date(currentWeekStart); d.setDate(d.getDate() + 7); setCurrentWeekStart(d);
  };
  const goToToday = () => setCurrentWeekStart(getMonday(TODAY));
  const isToday   = (date: Date) => date.toDateString() === TODAY.toDateString();
  const isPastDate = (date: Date) => {
    const hoy = new Date(); hoy.setHours(0,0,0,0);
    const d   = new Date(date); d.setHours(0,0,0,0);
    return d < hoy;
  };

  const getStatusColor = (status: string) => ({
    pending:   "bg-amber-100 text-amber-700",
    cancelled: "bg-red-100 text-red-700",
    completed: "bg-blue-100 text-blue-700",
  }[status] ?? "bg-amber-100 text-amber-700");

  const getStatusLabel = (status: string) => ({
    pending:   "Pendiente",
    cancelled: "Cancelada",
    completed: "Completada",
  }[status] ?? status);

  // Devuelve todos los empleados — puedes filtrar por especialidad si lo necesitas
  const getEmployeesByCategory = (_category: string) => employees;

  // ── Servicios del formulario ──
  const handleAddService = () => {
    if (!currentService.serviceId || !currentService.employeeId) {
      toast.error("Selecciona un servicio y un empleado"); return;
    }
    const service  = services.find(s => s.id  === currentService.serviceId);
    const employee = employees.find(e => e.id === currentService.employeeId);
    if (!service || !employee) return;

    const serviceStartTime = selectedServices.length > 0
      ? calculateEndTime(
          selectedServices[selectedServices.length - 1].startTime,
          selectedServices[selectedServices.length - 1].duration
        )
      : formData.startTime;

    setSelectedServices(prev => [...prev, {
      serviceId:   service.id,
      serviceName: service.name,
      employeeId:  employee.id,
      employeeName: employee.name,
      duration:    service.duration,
      startTime:   serviceStartTime,
    }]);
    setCurrentService({ serviceId: "", employeeId: "" });
    toast.success("Servicio agregado");
  };

  const handleRemoveService = (index: number) => {
    const next = selectedServices.filter((_, i) => i !== index).map((s, i, arr) => ({
      ...s,
      startTime: i === 0
        ? formData.startTime
        : calculateEndTime(arr[i-1].startTime, arr[i-1].duration),
    }));
    setSelectedServices(next);
  };

  // ── CRUD ──
  const reloadAppointments = async () => {
    const res  = await fetch(`${API_BASE}/appointments`);
    const data = await res.json();
    setAppointments(data.map(mapApiToAppointment));
  };

  const handleCreateOrUpdate = async () => {
    if (!formData.clientId || !formData.startTime || selectedServices.length === 0) {
      toast.error("Selecciona un cliente, hora y al menos un servicio"); return;
    }
    if (selectedServices.some(s => !s.employeeId)) {
      toast.error("Todos los servicios deben tener un empleado asignado"); return;
    }

    const hoy = new Date(); hoy.setHours(0,0,0,0);
    const fechaCita = new Date(formData.date); fechaCita.setHours(0,0,0,0);
    if (fechaCita < hoy) {
      toast.error("No puedes crear citas en fechas pasadas"); return;
    }

    const payload = {
      cliente:   Number(formData.clientId),
      fecha:     formData.date.toISOString().split("T")[0],
      hora:      formData.startTime,
      notas:     formData.notes || null,
      servicios: selectedServices.map(s => ({
        servicio:         Number(s.serviceId),
        empleado_usuario: Number(s.employeeId), // PK_id_empleado — el backend busca fk_id_usuario internamente
        precio:           null,
        detalle:          s.serviceName,
      })),
    };

    try {
      // FIX: rutas sin /api/ — el router está montado en /appointments directamente
      const method = editingAppointment ? "PUT" : "POST";
      const url    = editingAppointment
        ? `${API_BASE}/appointments/${editingAppointment.id}`
        : `${API_BASE}/appointments`;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al guardar");
      }

      toast.success(editingAppointment ? "Cita actualizada" : "Cita creada exitosamente");
      await reloadAppointments();
      resetForm();
    } catch (err: any) {
      toast.error(err.message ?? "Error al guardar la cita");
    }
  };

  const handleDelete = async () => {
    if (!appointmentToDelete) return;
    try {
      // FIX: ruta sin /api/
      await fetch(`${API_BASE}/appointments/${appointmentToDelete}`, { method: "DELETE" });
      setAppointments(prev => prev.filter(a => a.id !== appointmentToDelete));
      toast.success("Cita eliminada");
    } catch {
      toast.error("Error al eliminar la cita");
    } finally {
      setDeleteDialogOpen(false);
      setAppointmentToDelete(null);
    }
  };

  const handleCancelAppointment = async () => {
    if (!appointmentToCancel) return;
    try {
      // FIX: ruta sin /api/
      await fetch(`${API_BASE}/appointments/${appointmentToCancel}/cancel`, { method: "PATCH" });
      setAppointments(prev =>
        prev.map(a => a.id === appointmentToCancel ? { ...a, status: "cancelled" } : a)
      );
      toast.success("Cita cancelada");
    } catch {
      toast.error("Error al cancelar la cita");
    } finally {
      setCancelDialogOpen(false);
      setAppointmentToCancel(null);
    }
  };

  const handleUpdateStatus = async (appointmentId: number, status: Appointment["status"]) => {
    try {
      // FIX: ruta sin /api/
      await fetch(`${API_BASE}/appointments/${appointmentId}/status`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ status }),
      });
      setAppointments(prev => prev.map(a => a.id === appointmentId ? { ...a, status } : a));
      if (viewingAppointment?.id === appointmentId) {
        setViewingAppointment(prev => prev ? { ...prev, status } : prev);
      }
      toast.success(`Estado actualizado a ${getStatusLabel(status)}`);
    } catch {
      toast.error("Error al actualizar el estado");
    }
  };

  const resetForm = () => {
    setIsDialogOpen(false);
    setEditingAppointment(null);
    setFormData(emptyForm);
    setSelectedServices([]);
    setCurrentService({ serviceId: "", employeeId: "" });
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    const client = clients.find(c => c.name === appointment.clientName);
    setFormData({
      clientId:    client ? String(client.id) : "",
      clientName:  appointment.clientName,
      clientPhone: appointment.clientPhone,
      date:        appointment.date,
      startTime:   appointment.startTime,
      notes:       appointment.notes ?? "",
    });
    setSelectedServices(appointment.services);
    setIsDialogOpen(true);
  };

  const handleClientChange = (clientId: string) => {
    const client = clients.find(c => String(c.id) === clientId);
    if (client) {
      setFormData(prev => ({ ...prev, clientId, clientName: client.name, clientPhone: client.phone }));
    }
  };

  // ── Calendario ──
  const getAppointmentsForCell = (date: Date, time: string) => {
    return appointments.filter(apt => {
      if (apt.date.toDateString() !== date.toDateString()) return false;
      const [aH, aM] = apt.startTime.split(":").map(Number);
      const [eH, eM] = apt.endTime.split(":").map(Number);
      const [cH, cM] = time.split(":").map(Number);
      const aptStart = aH * 60 + aM;
      const aptEnd   = eH * 60 + eM;
      const cell     = cH * 60 + cM;
      return cell >= aptStart && cell < aptEnd;
    });
  };

  const getAppointmentCellSpan = (apt: Appointment) => {
    const [sH, sM] = apt.startTime.split(":").map(Number);
    const [eH, eM] = apt.endTime.split(":").map(Number);
    return Math.ceil(((eH * 60 + eM) - (sH * 60 + sM)) / 30);
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchSearch = apt.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === "all" || apt.status === filterStatus;
    return matchSearch && matchStatus;
  });

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-gray-500">Cargando citas...</div>;
  }

  return (
    <div className="space-y-4">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-[#78D1BD]" />
            <h1 className="text-gray-900">Gestión de Citas</h1>
          </div>
          <p className="text-sm text-gray-600 mt-0.5">
            {viewMode === "calendar"
              ? "Haz clic en cualquier hora disponible para crear una cita"
              : "Listado completo de todas las citas registradas"}
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex rounded-lg border border-gray-200 bg-white p-1">
            {(["calendar", "list"] as const).map(mode => (
              <button key={mode} onClick={() => setViewMode(mode)}
                className={`inline-flex items-center justify-center gap-1.5 rounded px-2.5 py-1 text-xs transition-all ${
                  viewMode === mode
                    ? "bg-gradient-to-r from-[#78D1BD] to-[#5FBFAA] text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}>
                {mode === "calendar" ? <Calendar className="w-3.5 h-3.5" /> : <List className="w-3.5 h-3.5" />}
                {mode === "calendar" ? "Calendario" : "Lista"}
              </button>
            ))}
          </div>
          <button
            className="inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 bg-gradient-to-r from-[#A78BFA] to-[#9370DB] hover:from-[#9870E8] hover:to-[#8260CB] text-white text-sm shadow-sm transition-all"
            onClick={() => { resetForm(); setIsDialogOpen(true); }}
          >
            <Plus className="w-3.5 h-3.5" />Nueva Cita
          </button>
        </div>
      </div>

      {/* ── Vista Lista ── */}
      {viewMode === "list" && (
        <>
          <Card className="border-gray-200 shadow-sm">
            <CardContent className="p-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <Input placeholder="Buscar por cliente..." value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-8 h-8 text-sm rounded-lg border-gray-200" />
                </div>
                <div className="flex gap-2 items-center">
                  <Filter className="w-3.5 h-3.5 text-gray-400" />
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32 h-8 text-sm rounded-lg border-gray-200">
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="pending">Pendientes</SelectItem>
                      <SelectItem value="completed">Completadas</SelectItem>
                      <SelectItem value="cancelled">Canceladas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="hidden lg:grid lg:grid-cols-[80px_1.5fr_1.5fr_1.2fr_100px_1.8fr_120px_140px] gap-4 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 text-xs text-gray-600">
            <div>Código</div><div>Cliente</div><div>Empleado</div>
            <div>Fecha</div><div>Hora</div><div>Servicios</div>
            <div>Estado</div><div className="text-right">Acciones</div>
          </div>

          <div className="space-y-1">
            {filteredAppointments.length === 0 ? (
              <Card className="border-gray-200">
                <CardContent className="p-8 text-center">
                  <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">No se encontraron citas</p>
                  <p className="text-sm text-gray-500 mt-1">Intenta ajustar los filtros</p>
                </CardContent>
              </Card>
            ) : filteredAppointments.map(apt => (
              <div key={apt.id} className="bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-all">
                <div className="grid grid-cols-1 lg:grid-cols-[80px_1.5fr_1.5fr_1.2fr_100px_1.8fr_120px_140px] gap-2 lg:gap-4 p-2.5 lg:p-4 items-start lg:items-center">
                  <span className="text-sm text-gray-900">#{String(apt.id).padStart(4,"0")}</span>
                  <div>
                    <p className="text-sm text-gray-900 truncate">{apt.clientName}</p>
                    <p className="text-xs text-gray-500 truncate">{apt.clientPhone}</p>
                  </div>
                  <p className="text-sm text-gray-700 truncate">{apt.services[0]?.employeeName ?? "N/A"}</p>
                  <p className="text-sm text-gray-700">
                    {apt.date.toLocaleDateString("es-ES", { day:"2-digit", month:"2-digit", year:"numeric" })}
                  </p>
                  <p className="text-sm text-gray-700">{apt.startTime}</p>
                  <div>
                    {apt.services.slice(0,2).map((s,i) => (
                      <p key={i} className="text-sm text-gray-700 truncate">{s.serviceName}</p>
                    ))}
                    {apt.services.length > 2 && <p className="text-xs text-gray-500">+{apt.services.length - 2} más</p>}
                  </div>
                  <Badge className={`${getStatusColor(apt.status)} text-[11px] px-2 py-0.5 whitespace-nowrap`}>
                    {getStatusLabel(apt.status)}
                  </Badge>
                  <div className="flex items-center justify-start lg:justify-end gap-1.5">
                    <button onClick={() => setViewingAppointment(apt)}
                      className="p-1.5 rounded-lg text-[#60A5FA] hover:bg-[#60A5FA]/10" title="Ver detalles">
                      <Edit className="w-4 h-4" />
                    </button>
                    {userRole === "admin" && (
                      <>
                        <button onClick={() => handleEdit(apt)}
                          className="p-1.5 rounded-lg text-[#FBBF24] hover:bg-[#FBBF24]/10" title="Editar">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { setAppointmentToCancel(apt.id); setCancelDialogOpen(true); }}
                          disabled={apt.status === "cancelled"}
                          className={`p-1.5 rounded-lg transition-all ${apt.status === "cancelled" ? "text-gray-300 cursor-not-allowed" : "text-[#F87171] hover:bg-[#F87171]/10"}`}
                          title="Cancelar">
                          <XCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Vista Calendario ── */}
      {viewMode === "calendar" && (
        <>
          <Card className="border-gray-200 shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <button onClick={goToPreviousWeek} className="p-2 hover:bg-gray-100 rounded-lg">
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div className="flex items-center gap-3">
                  <h3 className="text-gray-900">
                    {getWeekDates()[0].toLocaleDateString("es-ES", { day:"numeric", month:"long" })} -{" "}
                    {getWeekDates()[6].toLocaleDateString("es-ES", { day:"numeric", month:"long", year:"numeric" })}
                  </h3>
                  <Button variant="outline" size="sm" onClick={goToToday} className="border-gray-300 rounded-lg h-8 text-sm">
                    Hoy
                  </Button>
                </div>
                <button onClick={goToNextWeek} className="p-2 hover:bg-gray-100 rounded-lg">
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-xs text-gray-600">Estados:</span>
                {[
                  { color: "#F59E0B", label: "Pendiente" },
                  { color: "#23f83f", label: "Completada" },
                  { color: "#EF4444", label: "Cancelada" },
                ].map(({ color, label }) => (
                  <div key={label} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded border-l-4" style={{ borderLeftColor: color, backgroundColor: color + "20" }} />
                    <span className="text-xs text-gray-700">{label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <div className="min-w-[900px]">
                <div className="grid grid-cols-8 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-10">
                  <div className="p-3 border-r border-gray-200 text-gray-900">Hora</div>
                  {getWeekDates().map((date, idx) => (
                    <div key={idx} className={`p-3 border-r border-gray-200 last:border-r-0 text-center ${
                      isToday(date) ? "bg-[#78D1BD]/10" : isPastDate(date) ? "bg-gray-100" : ""
                    }`}>
                      <div className="text-sm text-gray-600">{WEEK_DAYS[idx]}</div>
                      <div className={`mt-0.5 ${isToday(date) ? "text-[#78D1BD]" : "text-gray-900"}`}>{date.getDate()}</div>
                    </div>
                  ))}
                </div>

                {TIME_SLOTS.map(time => (
                  <div key={time} className="grid grid-cols-8 border-b border-gray-200 last:border-b-0">
                    <div className="p-2 border-r border-gray-200 bg-gray-50/50 text-sm text-gray-600">{time}</div>
                    {getWeekDates().map((date, dIdx) => {
                      const cellApts = getAppointmentsForCell(date, time);
                      const firstApt = cellApts.find(a => a.startTime === time);
                      const isOccupied = cellApts.length > 0;
                      const statusBg:     Record<string,string> = { pending:"#F59E0B20", cancelled:"#EF444420", completed:"#3B82F620" };
                      const statusBorder: Record<string,string> = { pending:"#F59E0B",   cancelled:"#EF4444",   completed:"#3B82F6"   };

                      return (
                        <div key={dIdx}
                          className={`border-r border-gray-200 last:border-r-0 relative min-h-[50px] ${
                            isToday(date) ? "bg-[#78D1BD]/5" : isPastDate(date) ? "bg-gray-100" : ""
                          } ${!isOccupied && !isPastDate(date) ? "hover:bg-[#A78BFA]/10 cursor-pointer transition-colors group" : ""} ${
                            isPastDate(date) ? "cursor-not-allowed" : ""
                          }`}
                          style={{ height:"50px" }}
                          onClick={() => {
                            if (!isOccupied && !isPastDate(date)) {
                              setFormData({ ...emptyForm, date, startTime: time });
                              setEditingAppointment(null);
                              setSelectedServices([]);
                              setIsDialogOpen(true);
                            }
                          }}
                        >
                          {!isOccupied && (
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                              <Plus className="w-5 h-5 text-[#A78BFA]" />
                            </div>
                          )}
                          {firstApt && (
                            <div
                              className="absolute inset-x-1 rounded-lg p-2 shadow-sm border-l-4 cursor-pointer hover:shadow-md transition-all"
                              style={{
                                height: `${getAppointmentCellSpan(firstApt) * 50 - 4}px`,
                                backgroundColor: statusBg[firstApt.status],
                                borderLeftColor: statusBorder[firstApt.status],
                              }}
                              onClick={e => { e.stopPropagation(); setViewingAppointment(firstApt); }}
                            >
                              <div className="flex flex-col h-full">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs text-gray-900 truncate">{firstApt.clientName}</span>
                                  <Badge className={`${getStatusColor(firstApt.status)} text-[10px] px-1.5 py-0 h-4`}>
                                    {getStatusLabel(firstApt.status)}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-1 text-[10px] text-gray-600 mb-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{firstApt.startTime} - {firstApt.endTime}</span>
                                </div>
                                <div className="flex-1 overflow-y-auto space-y-1">
                                  {firstApt.services.map((s,i) => (
                                    <div key={i} className="text-[10px] text-gray-700 flex items-start gap-1">
                                      <span className="w-1 h-1 rounded-full bg-gray-400 mt-1 flex-shrink-0" />
                                      <span className="truncate">{s.serviceName}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </>
      )}

      {/* ── Dialog: Ver detalles ── */}
      <Dialog open={!!viewingAppointment} onOpenChange={() => setViewingAppointment(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-[#78D1BD]" />Detalles de la Cita
            </DialogTitle>
            <DialogDescription>Información completa de la cita programada</DialogDescription>
          </DialogHeader>
          {viewingAppointment && (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                <h3 className="text-gray-900 mb-1">Cliente</h3>
                <p className="text-sm text-gray-700">{viewingAppointment.clientName}</p>
                <p className="text-xs text-gray-600 mt-0.5">{viewingAppointment.clientPhone}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-600">Fecha</p>
                  <p className="text-sm text-gray-900 capitalize">
                    {viewingAppointment.date.toLocaleDateString("es-ES", { weekday:"long", day:"numeric", month:"long", year:"numeric" })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Horario</p>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#78D1BD]" />
                    <p className="text-sm text-gray-900">{viewingAppointment.startTime} - {viewingAppointment.endTime}</p>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-2">Servicios</p>
                <div className="space-y-2">
                  {viewingAppointment.services.map((s,i) => {
                    const emp = employees.find(e => e.id === s.employeeId);
                    return (
                      <div key={i} className="p-3 rounded-lg border-l-4 bg-gray-50" style={{ borderLeftColor: emp?.color ?? "#ccc" }}>
                        <div className="flex justify-between mb-1">
                          <p className="text-sm text-gray-900">{s.serviceName}</p>
                          <span className="text-xs text-gray-600">{s.duration} min</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                          <User className="w-3 h-3" /><span>{s.employeeName}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-2">Estado</p>
                <div className="flex gap-2 flex-wrap">
                  {(["pending","completed","cancelled"] as const).map(s => (
                    <button key={s}
                      onClick={() => handleUpdateStatus(viewingAppointment.id, s)}
                      className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                        viewingAppointment.status === s
                          ? getStatusColor(s) + " ring-2 ring-offset-2"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}>
                      {getStatusLabel(s)}
                    </button>
                  ))}
                </div>
              </div>
              {viewingAppointment.notes && (
                <div>
                  <p className="text-xs text-gray-600 mb-1">Notas</p>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-gray-900">{viewingAppointment.notes}</p>
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
                {userRole === "admin" && (
                  <Button variant="outline"
                    onClick={() => { setAppointmentToDelete(viewingAppointment.id); setDeleteDialogOpen(true); setViewingAppointment(null); }}
                    className="border-[#F87171] text-[#F87171] hover:bg-[#F87171]/10">
                    <Trash2 className="w-4 h-4 mr-2" />Eliminar
                  </Button>
                )}
                <Button variant="outline"
                  onClick={() => { handleEdit(viewingAppointment); setViewingAppointment(null); }}
                  className="border-[#FBBF24] text-[#FBBF24] hover:bg-[#FBBF24]/10">
                  <Edit className="w-4 h-4 mr-2" />Editar
                </Button>
                <Button onClick={() => setViewingAppointment(null)}
                  className="bg-gradient-to-r from-[#78D1BD] to-[#5FBFAA] text-white">
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Dialog: Crear / Editar ── */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-[#A78BFA]" />
              {editingAppointment ? "Editar Cita" : "Nueva Cita"}
            </DialogTitle>
            <DialogDescription>
              {editingAppointment ? "Actualiza la información de la cita" : "Programa una nueva cita"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {formData.date && formData.startTime && !editingAppointment && (
              <div className="p-3 rounded-lg bg-gradient-to-r from-[#A78BFA]/10 to-[#78D1BD]/10 border border-[#A78BFA]/30">
                <div className="flex items-center gap-2 text-sm text-gray-900">
                  <CalendarIcon className="w-4 h-4 text-[#A78BFA]" />
                  <span className="capitalize">{formData.date.toLocaleDateString("es-ES", { weekday:"long", day:"numeric", month:"long" })}</span>
                  <span className="text-gray-400">•</span>
                  <Clock className="w-4 h-4 text-[#78D1BD]" />
                  <span>{formData.startTime}</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Cliente *</Label>
              <Select value={formData.clientId} onValueChange={handleClientChange}>
                <SelectTrigger><SelectValue placeholder="Selecciona un cliente" /></SelectTrigger>
                <SelectContent>
                  {clients.map(c => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      <div className="flex flex-col">
                        <span>{c.name}</span>
                        <span className="text-xs text-gray-500">{c.phone}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fecha *</Label>
                <Input type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={formData.date.toISOString().split("T")[0]}
                  onChange={e => setFormData(prev => ({ ...prev, date: new Date(e.target.value + "T00:00:00") }))} />
              </div>
              <div className="space-y-2">
                <Label>Hora de Inicio *</Label>
                <Select value={formData.startTime} onValueChange={v => setFormData(prev => ({ ...prev, startTime: v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecciona hora" /></SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-gray-900">Agregar Servicios</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Servicio</Label>
                  <Select value={currentService.serviceId}
                    onValueChange={v => setCurrentService({ serviceId: v, employeeId: "" })}>
                    <SelectTrigger><SelectValue placeholder="Selecciona servicio" /></SelectTrigger>
                    <SelectContent>
                      {services.map(s => (
                        <SelectItem key={s.id} value={s.id}>
                          <div className="flex flex-col">
                            <span>{s.name}</span>
                            <span className="text-xs text-gray-500">{s.category} • {s.duration} min</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Empleado</Label>
                  <Select value={currentService.employeeId}
                    onValueChange={v => setCurrentService(prev => ({ ...prev, employeeId: v }))}
                    disabled={!currentService.serviceId}>
                    <SelectTrigger><SelectValue placeholder="Selecciona empleado" /></SelectTrigger>
                    <SelectContent>
                      {employees.length === 0 ? (
                        <SelectItem value="empty" disabled>No hay empleados disponibles</SelectItem>
                      ) : (
                        getEmployeesByCategory(
                          services.find(s => s.id === currentService.serviceId)?.category ?? ""
                        ).map(e => (
                          <SelectItem key={e.id} value={e.id}>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: e.color }} />
                              <span>{e.name}</span>
                              {e.specialty && <span className="text-xs text-gray-400">• {e.specialty}</span>}
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="button" onClick={handleAddService} variant="outline"
                className="w-full border-[#78D1BD] text-[#78D1BD] hover:bg-[#78D1BD]/10"
                disabled={!formData.startTime}>
                <Plus className="w-4 h-4 mr-2" />Agregar Servicio
              </Button>

              {selectedServices.length > 0 && (
                <div className="space-y-2 mt-3">
                  <p className="text-xs text-gray-600">Servicios agregados:</p>
                  {selectedServices.map((s,i) => {
                    const emp = employees.find(e => e.id === s.employeeId);
                    return (
                      <div key={i} className="flex items-center justify-between p-3 bg-white rounded-lg border-l-4"
                        style={{ borderLeftColor: emp?.color ?? "#ccc" }}>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{s.serviceName}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
                            <span className="flex items-center gap-1"><User className="w-3 h-3" />{s.employeeName}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{s.startTime} - {calculateEndTime(s.startTime, s.duration)} ({s.duration} min)</span>
                          </div>
                        </div>
                        <button onClick={() => handleRemoveService(i)} className="p-1 hover:bg-red-50 rounded text-[#F87171]">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                  <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-700">
                      Duración total: {selectedServices.reduce((sum,s) => sum + s.duration, 0)} min
                      {formData.startTime && ` • Finaliza: ${calculateEndTime(formData.startTime, selectedServices.reduce((sum,s) => sum + s.duration, 0))}`}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Notas (opcional)</Label>
              <Textarea value={formData.notes}
                onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Preferencias del cliente, alergias, etc." rows={3} />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button variant="outline" onClick={resetForm}>Cancelar</Button>
              <Button onClick={handleCreateOrUpdate}
                className="bg-gradient-to-r from-[#78D1BD] to-[#5FBFAA] hover:from-[#6BCAB7] hover:to-[#4FB5A1] text-white">
                {editingAppointment ? "Actualizar" : "Crear"} Cita
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Dialog: Confirmar eliminación ── */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-[#F87171]" />¿Eliminar Cita?
            </AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-[#F87171] hover:bg-[#EF4444]">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Dialog: Confirmar cancelación ── */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-[#F87171]" />¿Cancelar Cita?
            </AlertDialogTitle>
            <AlertDialogDescription>El estado cambiará a "Cancelada".</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, mantener</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelAppointment} className="bg-[#F87171] hover:bg-[#EF4444]">Sí, cancelar cita</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
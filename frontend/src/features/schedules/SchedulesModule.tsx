import { Key, ReactNode, useState, useEffect } from "react";
import { Card, CardContent } from "../../shared/ui/card";
import { Button } from "../../shared/ui/button";
import { Label } from "../../shared/ui/label";
import { Input } from "../../shared/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../shared/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../shared/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../shared/ui/select";
import { Badge } from "../../shared/ui/badge";
import { Checkbox } from "../../shared/ui/checkbox";
import { Plus, Clock, Calendar as CalendarIcon, User, Search, X, ChevronLeft, ChevronRight, Eye, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

const API_BASE = "http://localhost:3001";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Employee {
  id: string;
  name: string;
  specialty: string;
}

interface DaySchedule {
  id?: number;
  dayIndex: number;
  fecha?: string;
  startTime: string;
  endTime: string;
}

interface WeeklySchedule {
  id: string; // empleadoId_lunesISO
  employeeId: string;
  employeeName: string;
  employeeSpecialty: string;
  weekStartDate: string; // ISO "2026-02-16"
  daySchedules: DaySchedule[];
  isActive: boolean;
}

interface SchedulesModuleProps {
  userRole: "admin" | "employee" | "client";
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const WEEK_DAYS: { id: number; label: string; short: string }[] = [
  { id: 0, label: "Lunes",      short: "Lun" },
  { id: 1, label: "Martes",     short: "Mar" },
  { id: 2, label: "Miércoles",  short: "Mié" },
  { id: 3, label: "Jueves",     short: "Jue" },
  { id: 4, label: "Viernes",    short: "Vie" },
  { id: 5, label: "Sábado",     short: "Sáb" },
  { id: 6, label: "Domingo",    short: "Dom" },
];

const TIME_SLOTS = [
  "06:00","07:00","08:00","09:00","10:00","11:00","12:00",
  "13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00","22:00",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getMondayOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekDays(monday: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function dateToISO(date: Date): string {
  return date.toISOString().split("T")[0];
}

function formatWeekRange(weekStartStr: string): string {
  const monday = new Date(weekStartStr + "T00:00:00");
  const days   = getWeekDays(monday);
  const end    = days[6];
  return `${days[0].getDate()} ${days[0].toLocaleDateString("es-ES", { month: "short" })} - ${end.getDate()} ${end.toLocaleDateString("es-ES", { month: "short", year: "numeric" })}`;
}

function calculateDuration(startTime: string, endTime: string): string {
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  const mins = (eh * 60 + em) - (sh * 60 + sm);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}min` : `${h} horas`;
}

function getDayBadgeColor(dayIndex: number): string {
  const colors = [
    "bg-[#78D1BD]/20 text-[#78D1BD] border-[#78D1BD]/30",
    "bg-[#60A5FA]/20 text-[#60A5FA] border-[#60A5FA]/30",
    "bg-[#FBBF24]/20 text-[#FBBF24] border-[#FBBF24]/30",
    "bg-[#F87171]/20 text-[#F87171] border-[#F87171]/30",
    "bg-[#A78BFA]/20 text-[#A78BFA] border-[#A78BFA]/30",
    "bg-[#78D1BD]/20 text-[#78D1BD] border-[#78D1BD]/30",
    "bg-[#60A5FA]/20 text-[#60A5FA] border-[#60A5FA]/30",
  ];
  return colors[dayIndex] ?? "bg-gray-200 text-gray-700";
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function SchedulesModule({ userRole }: SchedulesModuleProps) {
  const [employees,  setEmployees]  = useState<Employee[]>([]);
  const [schedules,  setSchedules]  = useState<WeeklySchedule[]>([]);
  const [loading,    setLoading]    = useState(true);

  const [searchTerm,      setSearchTerm]      = useState("");
  const [filterEmployee,  setFilterEmployee]  = useState("all");

  const [isDialogOpen,     setIsDialogOpen]     = useState(false);
  const [editingSchedule,  setEditingSchedule]  = useState<WeeklySchedule | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<WeeklySchedule | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [viewingSchedule,  setViewingSchedule]  = useState<WeeklySchedule | null>(null);

  const [formWeekStart, setFormWeekStart] = useState(getMondayOfWeek(new Date()));
  const [formData, setFormData] = useState({ employeeId: "", daySchedules: [] as DaySchedule[] });

  // ── Carga inicial ──────────────────────────────────────────────────────────
  useEffect(() => {
    async function fetchAll() {
      try {
        const [empRes, schRes] = await Promise.all([
          fetch(`${API_BASE}/employees`),
          fetch(`${API_BASE}/schedules`),
        ]);
        const [empData, schData] = await Promise.all([empRes.json(), schRes.json()]);
        setEmployees(empData);
        setSchedules(schData);
      } catch (err) {
        console.error(err);
        toast.error("Error al conectar con el servidor");
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  const reloadSchedules = async () => {
    const res  = await fetch(`${API_BASE}/schedules`);
    const data = await res.json();
    setSchedules(data);
  };

  // ── Filtros ────────────────────────────────────────────────────────────────
  const filteredSchedules = schedules.filter(s => {
    const matchSearch  = s.employeeName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchEmp     = filterEmployee === "all" || s.employeeId === filterEmployee;
    return matchSearch && matchEmp;
  });

  // ── Formulario ────────────────────────────────────────────────────────────
  const formWeekDays = getWeekDays(formWeekStart);

  const goToPreviousWeek = () => {
    const d = new Date(formWeekStart);
    d.setDate(d.getDate() - 7);
    setFormWeekStart(d);
  };

  const goToNextWeek = () => {
    const d = new Date(formWeekStart);
    d.setDate(d.getDate() + 7);
    setFormWeekStart(d);
  };

  const toggleDay = (dayIndex: number) => {
    const exists = formData.daySchedules.some(ds => ds.dayIndex === dayIndex);
    if (exists) {
      setFormData(prev => ({ ...prev, daySchedules: prev.daySchedules.filter(ds => ds.dayIndex !== dayIndex) }));
    } else {
      setFormData(prev => ({ ...prev, daySchedules: [...prev.daySchedules, { dayIndex, startTime: "", endTime: "" }] }));
    }
  };

  const updateDaySchedule = (dayIndex: number, field: "startTime" | "endTime", value: string) => {
    setFormData(prev => ({
      ...prev,
      daySchedules: prev.daySchedules.map(ds => ds.dayIndex === dayIndex ? { ...ds, [field]: value } : ds),
    }));
  };

  const resetForm = () => {
    setIsDialogOpen(false);
    setEditingSchedule(null);
    setFormWeekStart(getMondayOfWeek(new Date()));
    setFormData({ employeeId: "", daySchedules: [] });
  };

  const handleEdit = (schedule: WeeklySchedule) => {
    setEditingSchedule(schedule);
    setFormWeekStart(new Date(schedule.weekStartDate + "T00:00:00"));
    setFormData({
      employeeId:   schedule.employeeId,
      daySchedules: schedule.daySchedules.map(ds => ({ ...ds })),
    });
    setIsDialogOpen(true);
  };

  // ── CRUD ──────────────────────────────────────────────────────────────────
  const handleCreateOrUpdate = async () => {
    if (!formData.employeeId || formData.daySchedules.length === 0) {
      toast.error("Selecciona un empleado y al menos un día");
      return;
    }
    for (const ds of formData.daySchedules) {
      if (!ds.startTime || !ds.endTime) {
        toast.error(`Completa los horarios de ${WEEK_DAYS[ds.dayIndex]?.label}`);
        return;
      }
      if (ds.startTime >= ds.endTime) {
        toast.error(`La hora inicio debe ser menor a la hora fin en ${WEEK_DAYS[ds.dayIndex]?.label}`);
        return;
      }
    }

    const weekStartISO = dateToISO(formWeekStart);

    try {
      if (editingSchedule) {
        // PUT — reemplaza la semana
        const res = await fetch(`${API_BASE}/schedules/${formData.employeeId}/${weekStartISO}`, {
          method:  "PUT",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ daySchedules: formData.daySchedules }),
        });
        if (!res.ok) throw new Error((await res.json()).error ?? "Error al actualizar");
        toast.success("Horario actualizado");
      } else {
        // POST — crea nueva semana
        const res = await fetch(`${API_BASE}/schedules`, {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({
            employeeId:    formData.employeeId,
            weekStartDate: weekStartISO,
            daySchedules:  formData.daySchedules,
          }),
        });
        if (!res.ok) throw new Error((await res.json()).error ?? "Error al crear");
        toast.success("Horario creado");
      }
      await reloadSchedules();
      resetForm();
    } catch (err: any) {
      toast.error(err.message ?? "Error al guardar");
    }
  };

  const handleDelete = async () => {
    if (!scheduleToDelete) return;
    try {
      const res = await fetch(
        `${API_BASE}/schedules/${scheduleToDelete.employeeId}/${scheduleToDelete.weekStartDate}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error((await res.json()).error ?? "Error al eliminar");
      toast.success("Horario eliminado");
      await reloadSchedules();
    } catch (err: any) {
      toast.error(err.message ?? "Error al eliminar");
    } finally {
      setDeleteDialogOpen(false);
      setScheduleToDelete(null);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-500">Cargando horarios...</div>
  );

  return (
    <div className="space-y-4">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-[#78D1BD]" />
            <h1 className="text-gray-900">Horarios Semanales</h1>
          </div>
          <p className="text-sm text-gray-600 mt-0.5">Gestión de turnos y disponibilidad del personal</p>
        </div>
        {userRole === "admin" && (
          <button
            className="inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 bg-gradient-to-r from-[#A78BFA] to-[#9370DB] hover:from-[#9870E8] hover:to-[#8260CB] text-white text-sm shadow-sm transition-all"
            onClick={() => { resetForm(); setIsDialogOpen(true); }}
          >
            <Plus className="w-3.5 h-3.5" />
            Nuevo Horario
          </button>
        )}
      </div>

      {/* ── Filtros ── */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-8 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Buscar por empleado..."
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                className="pl-9 h-9 rounded-lg border-gray-200" />
            </div>
            <div className="md:col-span-3">
              <Select value={filterEmployee} onValueChange={setFilterEmployee}>
                <SelectTrigger className="h-9 rounded-lg border-gray-200">
                  <SelectValue placeholder="Todos los empleados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los empleados</SelectItem>
                  {employees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-1">
              <Button variant="outline" size="sm" onClick={() => { setSearchTerm(""); setFilterEmployee("all"); }}
                className="h-9 w-full rounded-lg border-gray-200"
                disabled={!searchTerm && filterEmployee === "all"}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Tabla ── */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-0">
          {filteredSchedules.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <CalendarIcon className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-gray-500">
                {searchTerm || filterEmployee !== "all"
                  ? "No se encontraron horarios con los filtros aplicados"
                  : "No hay horarios registrados"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/50">
                    <th className="text-left px-4 py-3 text-sm text-gray-700">Empleado</th>
                    <th className="text-left px-4 py-3 text-sm text-gray-700">Semana</th>
                    <th className="text-left px-4 py-3 text-sm text-gray-700">Horarios por Día</th>
                    {userRole === "admin" && (
                      <th className="text-center px-4 py-3 text-sm text-gray-700 w-32">Acciones</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredSchedules.map(schedule => {
                    const weekDays = getWeekDays(new Date(schedule.weekStartDate + "T00:00:00"));
                    return (
                      <tr key={schedule.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-[#78D1BD] flex-shrink-0" />
                            <div>
                              <p className="text-sm text-gray-900">{schedule.employeeName}</p>
                              <p className="text-xs text-gray-500">{schedule.employeeSpecialty}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-900">{formatWeekRange(schedule.weekStartDate)}</p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="space-y-1.5">
                            {schedule.daySchedules
                              .sort((a, b) => a.dayIndex - b.dayIndex)
                              .map(ds => {
                                const day  = WEEK_DAYS[ds.dayIndex];
                                const date = weekDays[ds.dayIndex];
                                return (
                                  <div key={ds.dayIndex} className="flex items-center gap-2 text-sm">
                                    <Badge variant="secondary" className={`text-xs ${getDayBadgeColor(ds.dayIndex)}`}>
                                      {day?.short}
                                    </Badge>
                                    <span className="text-xs text-gray-500">
                                      {date?.getDate()}/{(date?.getMonth() ?? 0) + 1}
                                    </span>
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-3 h-3 text-[#60A5FA]" />
                                      <span className="text-gray-900">{ds.startTime}</span>
                                      <span className="text-gray-400">→</span>
                                      <span className="text-gray-900">{ds.endTime}</span>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        </td>
                        {userRole === "admin" && (
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-1">
                              <Button variant="ghost" size="icon"
                                onClick={() => { setViewingSchedule(schedule); setDetailDialogOpen(true); }}
                                className="h-8 w-8 hover:bg-[#78D1BD]/10 hover:text-[#78D1BD]">
                                <Eye className="w-3.5 h-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon"
                                onClick={() => handleEdit(schedule)}
                                className="h-8 w-8 hover:bg-[#60A5FA]/10 hover:text-[#60A5FA]">
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon"
                                onClick={() => { setScheduleToDelete(schedule); setDeleteDialogOpen(true); }}
                                className="h-8 w-8 hover:bg-[#F87171]/10 hover:text-[#F87171]">
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Ver Detalle ── */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-[#78D1BD]" />Detalle del Horario
            </DialogTitle>
            <DialogDescription>Información completa del horario semanal</DialogDescription>
          </DialogHeader>
          {viewingSchedule && (() => {
            const weekDays = getWeekDays(new Date(viewingSchedule.weekStartDate + "T00:00:00"));
            return (
              <div className="space-y-4">
                <Card className="border-gray-200 bg-gradient-to-br from-[#78D1BD]/5 to-[#60A5FA]/5">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#78D1BD] to-[#60A5FA] flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-gray-900">{viewingSchedule.employeeName}</p>
                      <p className="text-sm text-gray-500">{viewingSchedule.employeeSpecialty}</p>
                    </div>
                  </CardContent>
                </Card>
                <div className="grid grid-cols-2 gap-4">
                  <Card className="border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <CalendarIcon className="w-4 h-4 text-[#60A5FA]" />
                        <p className="text-xs text-gray-600">Semana</p>
                      </div>
                      <p className="text-sm text-gray-900">{formatWeekRange(viewingSchedule.weekStartDate)}</p>
                    </CardContent>
                  </Card>
                  <Card className="border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-[#FBBF24]" />
                        <p className="text-xs text-gray-600">Total días</p>
                      </div>
                      <p className="text-sm text-gray-900">{viewingSchedule.daySchedules.length} días</p>
                    </CardContent>
                  </Card>
                </div>
                <div className="space-y-2">
                  {viewingSchedule.daySchedules
                    .sort((a, b) => a.dayIndex - b.dayIndex)
                    .map(ds => {
                      const day  = WEEK_DAYS[ds.dayIndex];
                      const date = weekDays[ds.dayIndex];
                      return (
                        <div key={ds.dayIndex} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200">
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary" className={getDayBadgeColor(ds.dayIndex)}>{day?.label}</Badge>
                            <div>
                              <p className="text-sm text-gray-900">
                                {date?.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
                              </p>
                              <p className="text-xs text-gray-500">{calculateDuration(ds.startTime, ds.endTime)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-md border border-gray-200">
                            <Clock className="w-3.5 h-3.5 text-[#60A5FA]" />
                            <span className="text-sm text-gray-900">{ds.startTime}</span>
                            <span className="text-gray-400">→</span>
                            <span className="text-sm text-gray-900">{ds.endTime}</span>
                          </div>
                        </div>
                      );
                    })}
                </div>
                <div className="flex justify-end pt-4 border-t border-gray-200">
                  <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>Cerrar</Button>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* ── Crear / Editar ── */}
      <Dialog open={isDialogOpen} onOpenChange={open => { if (!open) resetForm(); setIsDialogOpen(open); }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingSchedule ? "Editar Horario" : "Nuevo Horario"}</DialogTitle>
            <DialogDescription>
              {editingSchedule ? "Actualiza el horario semanal" : "Define horarios personalizados para cada día"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">

            {/* Empleado */}
            <div className="space-y-2">
              <Label>Empleado *</Label>
              <Select value={formData.employeeId || "placeholder"}
                onValueChange={v => { if (v !== "placeholder") setFormData(prev => ({ ...prev, employeeId: v })); }}>
                <SelectTrigger><SelectValue placeholder="Seleccionar empleado" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="placeholder" disabled>Seleccionar empleado</SelectItem>
                  {employees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.name} {emp.specialty && `— ${emp.specialty}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Semana */}
            <div className="space-y-2">
              <Label>Semana *</Label>
              <Card className="border-gray-200">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <button type="button" onClick={goToPreviousWeek}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <p className="text-sm text-gray-900">{formatWeekRange(dateToISO(formWeekStart))}</p>
                    <button type="button" onClick={goToNextWeek}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Días */}
            <div className="space-y-2">
              <Label>Días y Horarios *</Label>
              <Card className="border-gray-200">
                <CardContent className="p-4 space-y-3">
                  {WEEK_DAYS.map((day, index) => {
                    const dateOfDay  = formWeekDays[index];
                    const isSelected = formData.daySchedules.some(ds => ds.dayIndex === index);
                    const ds         = formData.daySchedules.find(d => d.dayIndex === index);
                    return (
                      <div key={day.id} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Checkbox id={`day-${day.id}`} checked={isSelected}
                            onCheckedChange={() => toggleDay(index)} />
                          <label htmlFor={`day-${day.id}`}
                            className="text-sm text-gray-900 cursor-pointer select-none flex items-center gap-2">
                            <Badge variant="secondary" className={`text-xs ${getDayBadgeColor(index)}`}>
                              {day.label}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {dateOfDay.getDate()}/{dateOfDay.getMonth() + 1}/{dateOfDay.getFullYear()}
                            </span>
                          </label>
                        </div>
                        {isSelected && ds && (
                          <div className="ml-6 grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="space-y-1.5">
                              <Label className="text-xs text-gray-600">Hora Inicio</Label>
                              <Select value={ds.startTime}
                                onValueChange={v => updateDaySchedule(index, "startTime", v)}>
                                <SelectTrigger className="h-8"><SelectValue placeholder="--:--" /></SelectTrigger>
                                <SelectContent>
                                  {TIME_SLOTS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs text-gray-600">Hora Fin</Label>
                              <Select value={ds.endTime}
                                onValueChange={v => updateDaySchedule(index, "endTime", v)}>
                                <SelectTrigger className="h-8"><SelectValue placeholder="--:--" /></SelectTrigger>
                                <SelectContent>
                                  {TIME_SLOTS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            {/* Resumen */}
            {formData.daySchedules.length > 0 && (
              <div className="p-3 bg-[#78D1BD]/5 border border-[#78D1BD]/20 rounded-lg">
                <p className="text-xs text-gray-600 mb-2">Resumen:</p>
                <div className="flex flex-wrap gap-1.5">
                  {formData.daySchedules
                    .sort((a, b) => a.dayIndex - b.dayIndex)
                    .map(ds => (
                      <Badge key={ds.dayIndex} variant="secondary" className="text-xs bg-white">
                        {WEEK_DAYS[ds.dayIndex]?.short}: {ds.startTime || "--:--"} - {ds.endTime || "--:--"}
                      </Badge>
                    ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button variant="outline" onClick={resetForm}>Cancelar</Button>
              <Button onClick={handleCreateOrUpdate}
                className="bg-gradient-to-r from-[#78D1BD] to-[#5FBFAA] hover:from-[#6BCAB7] hover:to-[#4FB5A1] text-white">
                {editingSchedule ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Confirmar Eliminación ── */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#F87171]" />¿Eliminar Horario?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminarán todos los turnos de {scheduleToDelete?.employeeName} para la semana {scheduleToDelete ? formatWeekRange(scheduleToDelete.weekStartDate) : ""}. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-[#F87171] hover:bg-[#EF4444]">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
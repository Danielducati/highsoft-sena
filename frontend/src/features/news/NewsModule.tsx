import { useState, useEffect } from "react";
import { Card, CardContent } from "../../shared/ui/card";
import { Button } from "../../shared/ui/button";
import { Input } from "../../shared/ui/input";
import { Label } from "../../shared/ui/label";
import { Textarea } from "../../shared/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../shared/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../shared/ui/select";
import { Badge } from "../../shared/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../shared/ui/alert-dialog";
import { Plus, Search, Filter, Clock, AlertCircle, FileText, UserX, Edit, Trash2, Eye, RefreshCw, AlertTriangle, Calendar as CalendarIcon } from "lucide-react";
import { toast } from "sonner";

const API_BASE = "http://localhost:3001";

interface Employee {
  id: string;
  name: string;
  specialty: string;
}

interface EmployeeNews {
  id: number;
  employeeName: string;
  employeeId: string;
  type: "incapacidad" | "retraso" | "permiso" | "percance" | "ausencia" | "otro";
  date: string;
  fechaFinal?: string;
  startTime?: string;
  endTime?: string;
  description: string;
  status: "pendiente" | "aprobada" | "rechazada" | "resuelta";
  createdAt: string;
}

interface NewsModuleProps {
  userRole: "admin" | "employee" | "client";
}

const NEWS_TYPES = [
  { value: "incapacidad", label: "Incapacidad", icon: UserX,         color: "text-red-600"    },
  { value: "retraso",     label: "Retraso",      icon: Clock,         color: "text-yellow-600" },
  { value: "permiso",     label: "Permiso",       icon: FileText,      color: "text-blue-600"   },
  { value: "percance",    label: "Percance",      icon: AlertTriangle, color: "text-orange-600" },
  { value: "ausencia",    label: "Ausencia",      icon: AlertCircle,   color: "text-purple-600" },
  { value: "otro",        label: "Otro",          icon: FileText,      color: "text-gray-600"   },
];

const EMPTY_FORM = {
  employeeId:   "",
  employeeName: "",
  type:         "retraso" as EmployeeNews["type"],
  date:         "",
  fechaFinal:   "",
  startTime:    "",
  endTime:      "",
  description:  "",
  status:       "pendiente" as EmployeeNews["status"],
};

function getTypeConfig(type: string) {
  return NEWS_TYPES.find(t => t.value === type) ?? NEWS_TYPES[5];
}

function getTypeColor(type: string) {
  const map: Record<string, string> = {
    incapacidad: "bg-red-100 text-red-700 border-red-200",
    retraso:     "bg-yellow-100 text-yellow-700 border-yellow-200",
    permiso:     "bg-blue-100 text-blue-700 border-blue-200",
    percance:    "bg-orange-100 text-orange-700 border-orange-200",
    ausencia:    "bg-purple-100 text-purple-700 border-purple-200",
    otro:        "bg-gray-100 text-gray-700 border-gray-200",
  };
  return map[type] ?? map.otro;
}

function getStatusColor(status: string) {
  const map: Record<string, string> = {
    pendiente: "bg-amber-100 text-amber-700",
    aprobada:  "bg-emerald-100 text-emerald-700",
    rechazada: "bg-red-100 text-red-700",
    resuelta:  "bg-blue-100 text-blue-700",
  };
  return map[status] ?? map.pendiente;
}

function getStatusLabel(status: string) {
  const map: Record<string, string> = {
    pendiente: "Pendiente",
    aprobada:  "Aprobada",
    rechazada: "Rechazada",
    resuelta:  "Resuelta",
  };
  return map[status] ?? status;
}

function formatDate(dateStr: string) {
  if (!dateStr) return "-";
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-ES", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

export function NewsModule({ userRole }: NewsModuleProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);

  // TEMPORAL - borra esto después
  useEffect(() => {
    console.log("Employees state:", employees);
  }, [employees]);

  const [newsList,  setNewsList]  = useState<EmployeeNews[]>([]);
  const [loading,   setLoading]   = useState(true);

  const [searchTerm,   setSearchTerm]   = useState("");
  const [filterType,   setFilterType]   = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage,  setCurrentPage]  = useState(1);
  const itemsPerPage = 5;

  const [isDialogOpen,       setIsDialogOpen]      = useState(false);
  const [editingNews,        setEditingNews]        = useState<EmployeeNews | null>(null);
  const [viewingNews,        setViewingNews]        = useState<EmployeeNews | null>(null);
  const [deleteDialogOpen,   setDeleteDialogOpen]   = useState(false);
  const [newsToDelete,       setNewsToDelete]       = useState<number | null>(null);
  const [statusDialogOpen,   setStatusDialogOpen]   = useState(false);
  const [newsToChangeStatus, setNewsToChangeStatus] = useState<EmployeeNews | null>(null);
  const [newStatus,          setNewStatus]          = useState<EmployeeNews["status"]>("pendiente");

  const [formData, setFormData] = useState(EMPTY_FORM);

  // ── Carga inicial ──────────────────────────────────────────────────────────
  useEffect(() => {
    async function fetchAll() {
      try {
        const [empRes, newsRes] = await Promise.all([
          fetch(`${API_BASE}/employees`),
          fetch(`${API_BASE}/news`),
        ]);
        const [empData, newsData] = await Promise.all([empRes.json(), newsRes.json()]);
        setEmployees(empData);
        setNewsList(newsData);
      } catch (err) {
        console.error(err);
        toast.error("Error al conectar con el servidor");
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  const reloadNews = async () => {
    const res  = await fetch(`${API_BASE}/news`);
    const data = await res.json();
    setNewsList(data);
  };

  // ── Filtros y paginación ───────────────────────────────────────────────────
  const filteredNews = newsList.filter(item => {
    const matchSearch =
      item.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType   = filterType   === "all" || item.type   === filterType;
    const matchStatus = filterStatus === "all" || item.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  const totalPages    = Math.ceil(filteredNews.length / itemsPerPage);
  const paginatedNews = filteredNews.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // ── Formulario ────────────────────────────────────────────────────────────
  const handleEmployeeChange = (empId: string) => {
    const emp = employees.find(e => String(e.id) === empId);
    if (emp) setFormData(prev => ({ ...prev, employeeId: String(emp.id), employeeName: emp.name }));
  };

  const resetForm = () => {
    setIsDialogOpen(false);
    setEditingNews(null);
    setFormData(EMPTY_FORM);
  };

  const handleEdit = (item: EmployeeNews) => {
    setEditingNews(item);
    setFormData({
      employeeId:   item.employeeId,
      employeeName: item.employeeName,
      type:         item.type,
      date:         item.date,
      fechaFinal:   item.fechaFinal ?? "",
      startTime:    item.startTime  ?? "",
      endTime:      item.endTime    ?? "",
      description:  item.description,
      status:       item.status,
    });
    setIsDialogOpen(true);
  };

  // ── CRUD ──────────────────────────────────────────────────────────────────
  const handleCreateOrUpdate = async () => {
    if (!formData.employeeId || !formData.date || !formData.description) {
      toast.error("Empleado, fecha y descripción son obligatorios");
      return;
    }

    const payload = {
      employeeId:  formData.employeeId,
      type:        formData.type,
      date:        formData.date,
      fechaFinal:  formData.fechaFinal || null,
      startTime:   formData.startTime  || null,
      endTime:     formData.endTime    || null,
      description: formData.description,
      status:      formData.status,
    };

    try {
      const method = editingNews ? "PUT" : "POST";
      const url    = editingNews
        ? `${API_BASE}/news/${editingNews.id}`
        : `${API_BASE}/news`;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error((await res.json()).error ?? "Error al guardar");

      toast.success(editingNews ? "Novedad actualizada" : "Novedad creada");
      await reloadNews();
      resetForm();
    } catch (err: any) {
      toast.error(err.message ?? "Error al guardar");
    }
  };

  const handleDelete = async () => {
    if (!newsToDelete) return;
    try {
      await fetch(`${API_BASE}/news/${newsToDelete}`, { method: "DELETE" });
      setNewsList(prev => prev.filter(n => n.id !== newsToDelete));
      toast.success("Novedad eliminada");
    } catch {
      toast.error("Error al eliminar");
    } finally {
      setDeleteDialogOpen(false);
      setNewsToDelete(null);
    }
  };

  const handleStatusChange = async (id: number, status: EmployeeNews["status"]) => {
    try {
      await fetch(`${API_BASE}/news/${id}/status`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ status }),
      });
      setNewsList(prev => prev.map(n => n.id === id ? { ...n, status } : n));
      toast.success("Estado actualizado");
    } catch {
      toast.error("Error al actualizar estado");
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-500">Cargando novedades...</div>
  );

  return (
    <div className="space-y-4">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-[#F87171]" />
            <h1 className="text-gray-900">Novedades de Empleados</h1>
          </div>
          <p className="text-sm text-gray-600 mt-0.5">Gestión de incapacidades, retrasos, permisos y percances</p>
        </div>
        {(userRole === "admin" || userRole === "employee") && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <button
                className="inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 bg-gradient-to-r from-[#A78BFA] to-[#9370DB] hover:from-[#9870E8] hover:to-[#8260CB] text-white text-sm shadow-sm transition-all"
                onClick={() => { setEditingNews(null); setFormData(EMPTY_FORM); }}
              >
                <Plus className="w-3.5 h-3.5" />
                Nueva Novedad
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingNews ? "Editar Novedad" : "Registrar Nueva Novedad"}</DialogTitle>
                <DialogDescription>
                  {editingNews ? "Actualiza la información de la novedad" : "Completa los detalles de la novedad"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">


                {/* Empleado */}
                <div className="space-y-2">
                  <Label>Empleado *</Label>
                  <Select
                    value={formData.employeeId || "placeholder"}
                    onValueChange={v => {
                      if (v === "placeholder") return;
                      handleEmployeeChange(v);
                    }}
                  >
                    <SelectTrigger><SelectValue placeholder="Selecciona un empleado" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="placeholder" disabled>Selecciona un empleado</SelectItem>
                      {employees.map(emp => (
                        <SelectItem key={emp.id} value={String(emp.id)}>
                          {emp.name} {emp.specialty && `— ${emp.specialty}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tipo y fecha inicio */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo de Novedad *</Label>
                    <Select value={formData.type} onValueChange={(v: any) => setFormData(prev => ({ ...prev, type: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {NEWS_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Fecha Inicio *</Label>
                    <Input type="date" value={formData.date}
                      onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))} />
                  </div>
                </div>

                {/* Fecha final y estado */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Fecha Final</Label>
                    <Input type="date" value={formData.fechaFinal}
                      onChange={e => setFormData(prev => ({ ...prev, fechaFinal: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Estado *</Label>
                    <Select value={formData.status} onValueChange={(v: any) => setFormData(prev => ({ ...prev, status: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pendiente">Pendiente</SelectItem>
                        <SelectItem value="aprobada">Aprobada</SelectItem>
                        <SelectItem value="rechazada">Rechazada</SelectItem>
                        <SelectItem value="resuelta">Resuelta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Horas */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Hora de Inicio</Label>
                    <Input type="time" value={formData.startTime}
                      onChange={e => setFormData(prev => ({ ...prev, startTime: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Hora Final</Label>
                    <Input type="time" value={formData.endTime}
                      onChange={e => setFormData(prev => ({ ...prev, endTime: e.target.value }))} />
                  </div>
                </div>

                {/* Descripción */}
                <div className="space-y-2">
                  <Label>Descripción *</Label>
                  <Textarea rows={4} value={formData.description}
                    onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe la situación con el mayor detalle posible..." />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button variant="outline" onClick={resetForm}>Cancelar</Button>
                  <Button onClick={handleCreateOrUpdate}
                    className="bg-gradient-to-r from-[#78D1BD] to-[#5FBFAA] hover:from-[#6BCAB7] hover:to-[#4FB5A1] text-white">
                    {editingNews ? "Actualizar" : "Crear"} Novedad
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* ── Filtros ── */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <Input placeholder="Buscar por nombre o descripción..."
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="pl-8 h-8 text-sm rounded-lg border-gray-200" />
            </div>
            <div className="flex gap-2 items-center">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <Select value={filterType} onValueChange={v => { setFilterType(v); setCurrentPage(1); }}>
                <SelectTrigger className="w-36 h-8 text-sm rounded-lg border-gray-200">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  {NEWS_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={v => { setFilterStatus(v); setCurrentPage(1); }}>
                <SelectTrigger className="w-36 h-8 text-sm rounded-lg border-gray-200">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="aprobada">Aprobada</SelectItem>
                  <SelectItem value="rechazada">Rechazada</SelectItem>
                  <SelectItem value="resuelta">Resuelta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Tabla ── */}
      <Card className="border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-gray-900 text-sm">Empleado</th>
                <th className="px-4 py-3 text-left text-gray-900 text-sm">Tipo</th>
                <th className="px-4 py-3 text-left text-gray-900 text-sm">Fecha Inicio</th>
                <th className="px-4 py-3 text-left text-gray-900 text-sm">Fecha Final</th>
                <th className="px-4 py-3 text-left text-gray-900 text-sm">Hora</th>
                <th className="px-4 py-3 text-left text-gray-900 text-sm">Estado</th>
                <th className="px-4 py-3 text-center text-gray-900 text-sm">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedNews.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600">No se encontraron novedades</p>
                    <p className="text-sm text-gray-500 mt-1">Intenta ajustar los filtros</p>
                  </td>
                </tr>
              ) : paginatedNews.map(item => {
                const cfg      = getTypeConfig(item.type);
                const TypeIcon = cfg.icon;
                return (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <TypeIcon className={`w-4 h-4 flex-shrink-0 ${cfg.color}`} />
                        <p className="text-sm text-gray-900">{item.employeeName}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={`${getTypeColor(item.type)} text-xs px-2.5 py-0.5`}>
                        {cfg.label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <CalendarIcon className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-sm text-gray-700">{formatDate(item.date)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <CalendarIcon className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-sm text-gray-700">{formatDate(item.fechaFinal ?? "")}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {item.startTime || item.endTime ? (
                        <div className="flex flex-col gap-0.5 text-sm text-gray-700">
                          {item.startTime && <span>{item.startTime}</span>}
                          {item.endTime   && <span className="text-gray-400">{item.endTime}</span>}
                        </div>
                      ) : <span className="text-xs text-gray-400">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={`${getStatusColor(item.status)} text-xs px-2.5 py-0.5`}>
                        {getStatusLabel(item.status)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <button onClick={() => setViewingNews(item)}
                          className="p-1.5 hover:bg-[#60A5FA]/10 rounded-lg text-[#60A5FA] transition-all" title="Ver">
                          <Eye className="w-4 h-4" />
                        </button>
                        {(userRole === "admin" || userRole === "employee") && (
                          <>
                            <button onClick={() => { setNewsToChangeStatus(item); setNewStatus(item.status); setStatusDialogOpen(true); }}
                              className="p-1.5 hover:bg-[#A78BFA]/10 rounded-lg text-[#A78BFA] transition-all" title="Cambiar estado">
                              <RefreshCw className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleEdit(item)}
                              className="p-1.5 hover:bg-[#FBBF24]/10 rounded-lg text-[#FBBF24] transition-all" title="Editar">
                              <Edit className="w-4 h-4" />
                            </button>
                            {userRole === "admin" && (
                              <button onClick={() => { setNewsToDelete(item.id); setDeleteDialogOpen(true); }}
                                className="p-1.5 hover:bg-[#F87171]/10 rounded-lg text-[#F87171] transition-all" title="Eliminar">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Paginación ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-3 py-2 bg-white border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-600">
            Mostrando {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredNews.length)} de {filteredNews.length}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-8 text-sm">Anterior</Button>
            <span className="text-sm text-gray-600">Página {currentPage} de {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="h-8 text-sm">Siguiente</Button>
          </div>
        </div>
      )}

      {/* ── Ver detalle ── */}
      <Dialog open={!!viewingNews} onOpenChange={() => setViewingNews(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-[#A78BFA]" />
              Detalles de la Novedad
            </DialogTitle>
            <DialogDescription>Información completa de la novedad registrada</DialogDescription>
          </DialogHeader>
          {viewingNews && (() => {
            const cfg      = getTypeConfig(viewingNews.type);
            const TypeIcon = cfg.icon;
            return (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex items-start gap-3">
                  <TypeIcon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${cfg.color}`} />
                  <h3 className="text-gray-900">{viewingNews.employeeName}</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Tipo</p>
                    <Badge variant="outline" className={`${getTypeColor(viewingNews.type)} text-xs px-2 py-1`}>{cfg.label}</Badge>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Estado</p>
                    <Badge className={`${getStatusColor(viewingNews.status)} text-xs px-2 py-1`}>{getStatusLabel(viewingNews.status)}</Badge>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Fecha Inicio</p>
                    <p className="text-sm text-gray-900">{formatDate(viewingNews.date)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Fecha Final</p>
                    <p className="text-sm text-gray-900">{formatDate(viewingNews.fechaFinal ?? "")}</p>
                  </div>
                  {(viewingNews.startTime || viewingNews.endTime) && (
                    <>
                      <div>
                        <p className="text-xs text-gray-600">Hora Inicio</p>
                        <p className="text-sm text-gray-900">{viewingNews.startTime || "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Hora Final</p>
                        <p className="text-sm text-gray-900">{viewingNews.endTime || "—"}</p>
                      </div>
                    </>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Descripción</p>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{viewingNews.description}</p>
                  </div>
                </div>
                <div className="flex justify-end pt-4 border-t border-gray-200">
                  <Button onClick={() => setViewingNews(null)}
                    className="bg-gradient-to-r from-[#78D1BD] to-[#5FBFAA] text-white">Cerrar</Button>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* ── Confirmar eliminación ── */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-[#F87171]" />¿Eliminar Novedad?
            </AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-[#F87171] hover:bg-[#EF4444]">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Cambiar estado ── */}
      <AlertDialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-[#A78BFA]" />Cambiar Estado
            </AlertDialogTitle>
            <AlertDialogDescription>Selecciona el nuevo estado para esta novedad.</AlertDialogDescription>
          </AlertDialogHeader>
          {newsToChangeStatus && (
            <div className="space-y-4 py-4">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-900">{newsToChangeStatus.employeeName}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {getTypeConfig(newsToChangeStatus.type).label} — {formatDate(newsToChangeStatus.date)}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-600">Estado Actual</Label>
                  <Badge className={`${getStatusColor(newsToChangeStatus.status)} text-xs px-2.5 py-1 mt-1 block w-fit`}>
                    {getStatusLabel(newsToChangeStatus.status)}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-600">Nuevo Estado</Label>
                  <Select value={newStatus} onValueChange={(v: any) => setNewStatus(v)}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendiente">Pendiente</SelectItem>
                      <SelectItem value="aprobada">Aprobada</SelectItem>
                      <SelectItem value="rechazada">Rechazada</SelectItem>
                      <SelectItem value="resuelta">Resuelta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (newsToChangeStatus) await handleStatusChange(newsToChangeStatus.id, newStatus);
                setStatusDialogOpen(false);
                setNewsToChangeStatus(null);
              }}
              className="bg-gradient-to-r from-[#A78BFA] to-[#9370DB]"
            >
              Cambiar Estado
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
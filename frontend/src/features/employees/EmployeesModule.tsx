import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "../../shared/ui/card";
import { Button } from "../../shared/ui/button";
import { Input } from "../../shared/ui/input";
import { Label } from "../../shared/ui/label";
import { Switch } from "../../shared/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../shared/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../shared/ui/select";
import { Badge } from "../../shared/ui/badge";
import { Plus, Pencil, Trash2, Search, Eye, Users, Filter, Briefcase, ImageIcon, X, Upload, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ImageWithFallback } from "../guidelines/figma/ImageWithFallback";
import { Avatar, AvatarFallback } from "../../shared/ui/avatar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../shared/ui/alert-dialog";

const API_URL = "http://localhost:3001";

interface Employee {
  id: number;
  nombre: string;
  apellido: string;
  tipo_documento?: string;
  numero_documento?: string;
  correo?: string;
  telefono?: string;
  ciudad?: string;
  especialidad?: string;
  direccion?: string;
  foto_perfil?: string;
  Estado: string;
  // campos computados para el UI
  name: string;
  email: string;
  phone: string;
  specialty: string;
  image: string;
  isActive: boolean;
}

interface EmployeesModuleProps {
  userRole: 'admin' | 'employee' | 'client';
}

// Mapa de especialidad → id_rol
const ROL_MAP: Record<string, number> = {
  "Barbero": 2,
  "Estilista": 3,
  "Manicurista": 4,
  "Cosmetologa": 5,
  "Masajista": 6,
};

export function EmployeesModule({ userRole }: EmployeesModuleProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterSpecialty, setFilterSpecialty] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const [isEmployeeDialogOpen, setIsEmployeeDialogOpen] = useState(false);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const [employeeForm, setEmployeeForm] = useState({
    firstName: "",
    lastName: "",
    documentType: "",
    document: "",
    email: "",
    phone: "",
    city: "",
    address: "",
    specialty: "",
    contrasena: "",
    image: "",
  });

  const getToken = () => localStorage.getItem("token");

  // ==========================================
  // CARGAR EMPLEADOS
  // ==========================================
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/employees`);
      if (!response.ok) throw new Error();
      const data = await response.json();
      const mapped = data.map((e: any) => ({
        ...e,
        name: e.name || `${e.nombre || ""} ${e.apellido || ""}`.trim(),
        email: e.correo || "",
        phone: e.telefono || "",
        specialty: e.especialidad || e.specialty || "",
        image: e.foto_perfil || "",
        isActive: e.Estado === "Activo",
      }));
      setEmployees(mapped);
    } catch {
      toast.error("Error al cargar empleados");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // CREAR O ACTUALIZAR EMPLEADO
  // ==========================================
  const handleCreateOrUpdateEmployee = async () => {
    if (!employeeForm.firstName || !employeeForm.lastName || !employeeForm.email || !employeeForm.specialty) {
      toast.error("Nombre, apellido, correo y especialidad son requeridos");
      return;
    }

    setSaving(true);
    const token = getToken();

    const body = {
      nombre: employeeForm.firstName,
      apellido: employeeForm.lastName,
      tipo_documento: employeeForm.documentType || null,
      numero_documento: employeeForm.document || null,
      correo: employeeForm.email,
      telefono: employeeForm.phone || null,
      ciudad: employeeForm.city || null,
      especialidad: employeeForm.specialty,
      direccion: employeeForm.address || null,
      foto_perfil: imagePreview || null,
      contrasena: employeeForm.contrasena || "empleado123",
      id_rol: ROL_MAP[employeeForm.specialty] || 2,
      Estado: "Activo",
    };

    try {
      if (editingEmployee) {
        const response = await fetch(`${API_URL}/employees/${editingEmployee.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(body),
        });
        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || "Error al actualizar");
        }
        toast.success("Empleado actualizado exitosamente");
      } else {
        const response = await fetch(`${API_URL}/employees`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(body),
        });
        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || "Error al crear");
        }
        toast.success("Empleado creado exitosamente");
      }
      await fetchEmployees();
      resetEmployeeForm();
    } catch (error: any) {
      toast.error(error.message || "Error al guardar empleado");
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // TOGGLE ESTADO
  // ==========================================
  const handleToggleStatus = async (employee: Employee) => {
    const token = getToken();
    try {
      const response = await fetch(`${API_URL}/employees/${employee.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          nombre: employee.nombre,
          apellido: employee.apellido,
          correo: employee.correo,
          especialidad: employee.especialidad,
          Estado: employee.isActive ? "Inactivo" : "Activo",
        }),
      });
      if (!response.ok) throw new Error();
      toast.success(`Empleado ${employee.isActive ? 'desactivado' : 'activado'} exitosamente`);
      await fetchEmployees();
    } catch {
      toast.error("Error al actualizar estado");
    }
  };

  // ==========================================
  // ELIMINAR EMPLEADO
  // ==========================================
  const handleDeleteEmployee = async () => {
    if (!employeeToDelete) return;
    const token = getToken();
    try {
      const response = await fetch(`${API_URL}/employees/${employeeToDelete}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error();
      toast.success("Empleado desactivado exitosamente");
      await fetchEmployees();
    } catch {
      toast.error("Error al eliminar empleado");
    } finally {
      setDeleteDialogOpen(false);
      setEmployeeToDelete(null);
    }
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setEmployeeForm({
      firstName: employee.nombre,
      lastName: employee.apellido,
      documentType: employee.tipo_documento || "",
      document: employee.numero_documento || "",
      email: employee.correo || "",
      phone: employee.telefono || "",
      city: employee.ciudad || "",
      address: employee.direccion || "",
      specialty: employee.especialidad || "",
      contrasena: "",
      image: employee.foto_perfil || "",
    });
    setImagePreview(employee.foto_perfil || "");
    setIsEmployeeDialogOpen(true);
  };

  const resetEmployeeForm = () => {
    setIsEmployeeDialogOpen(false);
    setEditingEmployee(null);
    setEmployeeForm({ firstName: "", lastName: "", documentType: "", document: "", email: "", phone: "", city: "", address: "", specialty: "", contrasena: "", image: "" });
    setImagePreview("");
  };

  const confirmDeleteEmployee = (id: number) => {
    setEmployeeToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5000000) { toast.error("La imagen no debe superar los 5MB"); return; }
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employee.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employee.specialty || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = filterSpecialty === "all" || employee.specialty === filterSpecialty;
    const matchesStatus = filterStatus === "all" ||
      (filterStatus === "active" && employee.isActive) ||
      (filterStatus === "inactive" && !employee.isActive);
    return matchesSearch && matchesSpecialty && matchesStatus;
  });

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const paginatedEmployees = filteredEmployees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const specialties = Array.from(new Set(employees.map(e => e.specialty).filter(Boolean)));
  const activeEmployees = employees.filter(e => e.isActive).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#78D1BD]" />
            <h1 className="text-gray-900">Gestión de Empleados</h1>
          </div>
          <p className="text-sm text-gray-600 mt-0.5">
            {employees.length} empleados • {activeEmployees} activos
          </p>
        </div>
        {userRole === 'admin' && (
          <button
            onClick={() => { setEditingEmployee(null); resetEmployeeForm(); setIsEmployeeDialogOpen(true); }}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 bg-gradient-to-r from-[#A78BFA] to-[#9370DB] hover:from-[#9870E8] hover:to-[#8260CB] text-white text-sm shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Nuevo Empleado
          </button>
        )}
      </div>

      {/* Filtros */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <Input placeholder="Buscar empleados..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="pl-8 h-8 text-sm rounded-lg border-gray-200" />
            </div>
            <div className="flex gap-2 items-center">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <Select value={filterSpecialty} onValueChange={(v) => { setFilterSpecialty(v); setCurrentPage(1); }}>
                <SelectTrigger className="w-40 h-8 text-sm rounded-lg border-gray-200">
                  <SelectValue placeholder="Especialidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {specialties.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v); setCurrentPage(1); }}>
                <SelectTrigger className="w-32 h-8 text-sm rounded-lg border-gray-200">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Activos</SelectItem>
                  <SelectItem value="inactive">Inactivos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-3 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-xs text-gray-600">
        <div className="col-span-4">Nombre</div>
        <div className="col-span-3">Especialidad</div>
        <div className="col-span-2">Contacto</div>
        <div className="col-span-1">Estado</div>
        <div className="col-span-2 text-right">Acciones</div>
      </div>

      {loading ? (
        <p className="text-center text-gray-500 py-8">Cargando empleados...</p>
      ) : (
        <div className="space-y-1">
          {paginatedEmployees.map((employee) => (
            <div key={employee.id} className="bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-all">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 lg:gap-3 p-2.5 lg:p-3 items-center">
                <div className="lg:col-span-4 flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-[#78D1BD] to-[#5FBFAA] flex items-center justify-center text-white text-sm flex-shrink-0">
                    {employee.image ? (
                      <ImageWithFallback src={employee.image} alt={employee.name} className="w-full h-full object-cover" />
                    ) : (
                      employee.name.charAt(0)
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-900 truncate">{employee.name}</p>
                    <p className="text-xs text-gray-500 truncate">{employee.email}</p>
                  </div>
                </div>
                <div className="lg:col-span-3">
                  <div className="flex items-center gap-1.5">
                    <Briefcase className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    <span className="text-xs text-gray-700">{employee.specialty || "—"}</span>
                  </div>
                </div>
                <div className="lg:col-span-2">
                  <p className="text-xs text-gray-600">{employee.phone || "—"}</p>
                </div>
                <div className="lg:col-span-1">
                  {userRole === 'admin' ? (
                    <Switch checked={employee.isActive} onCheckedChange={() => handleToggleStatus(employee)} className="scale-75" />
                  ) : (
                    <Badge className={employee.isActive ? "bg-green-100 text-green-700 text-xs" : "bg-gray-100 text-gray-600 text-xs"}>
                      {employee.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  )}
                </div>
                <div className="lg:col-span-2 flex items-center justify-end gap-1">
                  {userRole === 'admin' && (
                    <>
                      <button onClick={() => setViewingEmployee(employee)} className="p-1 hover:bg-blue-50 rounded text-blue-600 transition-colors" title="Ver detalles"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => handleEditEmployee(employee)} className="p-1 hover:bg-amber-50 rounded text-amber-600 transition-colors" title="Editar"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => confirmDeleteEmployee(employee.id)} className="p-1 hover:bg-red-50 rounded text-red-600 transition-colors" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredEmployees.length === 0 && !loading && (
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-8 text-center">
            <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-900 mb-1">No se encontraron empleados</p>
            <p className="text-sm text-gray-600">Intenta ajustar los filtros de búsqueda</p>
          </CardContent>
        </Card>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-3">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Mostrando {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredEmployees.length)} de {filteredEmployees.length}
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-8 text-sm">Anterior</Button>
                <span className="text-sm text-gray-600">Página {currentPage} de {totalPages}</span>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="h-8 text-sm">Siguiente</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog: Crear/Editar Empleado */}
      <Dialog open={isEmployeeDialogOpen} onOpenChange={setIsEmployeeDialogOpen}>
        <DialogContent className="rounded-xl max-w-2xl border-gray-200 shadow-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingEmployee ? 'Editar Empleado' : 'Nuevo Empleado'}</DialogTitle>
            <DialogDescription>{editingEmployee ? 'Actualiza la información del empleado' : 'Ingresa los datos del nuevo empleado'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {/* Foto */}
            <div className="space-y-2">
              <Label>Foto de Perfil</Label>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="w-20 h-20 ring-2 ring-gray-200">
                    {imagePreview ? (
                      <ImageWithFallback src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <AvatarFallback className="bg-gray-100"><ImageIcon className="w-8 h-8 text-gray-400" /></AvatarFallback>
                    )}
                  </Avatar>
                  {imagePreview && (
                    <button onClick={() => setImagePreview("")} className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="flex-1">
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full rounded-lg border-gray-200">
                    <Upload className="w-4 h-4 mr-2" />Subir Imagen
                  </Button>
                  <p className="text-xs text-gray-500 mt-1">JPG, PNG (máx. 5MB)</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombres *</Label>
                <Input value={employeeForm.firstName} onChange={(e) => setEmployeeForm({ ...employeeForm, firstName: e.target.value })} placeholder="Ana María" className="rounded-lg border-gray-200" />
              </div>
              <div className="space-y-2">
                <Label>Apellidos *</Label>
                <Input value={employeeForm.lastName} onChange={(e) => setEmployeeForm({ ...employeeForm, lastName: e.target.value })} placeholder="García Pérez" className="rounded-lg border-gray-200" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de Documento</Label>
                <Select value={employeeForm.documentType} onValueChange={(v) => setEmployeeForm({ ...employeeForm, documentType: v })}>
                  <SelectTrigger className="rounded-lg border-gray-200"><SelectValue placeholder="Selecciona tipo" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
                    <SelectItem value="CE">Cédula de Extranjería</SelectItem>
                    <SelectItem value="PAS">Pasaporte</SelectItem>
                    <SelectItem value="TI">Tarjeta de Identidad</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Número de Documento</Label>
                <Input value={employeeForm.document} onChange={(e) => setEmployeeForm({ ...employeeForm, document: e.target.value })} placeholder="1234567890" className="rounded-lg border-gray-200" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Correo *</Label>
                <Input type="email" value={employeeForm.email} onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })} placeholder="empleado@highlifespa.com" className="rounded-lg border-gray-200" />
              </div>
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input value={employeeForm.phone} onChange={(e) => setEmployeeForm({ ...employeeForm, phone: e.target.value })} placeholder="+57 310 123 4567" className="rounded-lg border-gray-200" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ciudad</Label>
                <Input value={employeeForm.city} onChange={(e) => setEmployeeForm({ ...employeeForm, city: e.target.value })} placeholder="Medellín" className="rounded-lg border-gray-200" />
              </div>
              <div className="space-y-2">
                <Label>Especialidad *</Label>
                <Select value={employeeForm.specialty} onValueChange={(v) => setEmployeeForm({ ...employeeForm, specialty: v })}>
                  <SelectTrigger className="rounded-lg border-gray-200"><SelectValue placeholder="Selecciona especialidad" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Barbero">Barbero</SelectItem>
                    <SelectItem value="Estilista">Estilista</SelectItem>
                    <SelectItem value="Manicurista">Manicurista</SelectItem>
                    <SelectItem value="Cosmetologa">Cosmetóloga</SelectItem>
                    <SelectItem value="Masajista">Masajista</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Dirección</Label>
              <Input value={employeeForm.address} onChange={(e) => setEmployeeForm({ ...employeeForm, address: e.target.value })} placeholder="Calle 123 #45-67" className="rounded-lg border-gray-200" />
            </div>

            {!editingEmployee && (
              <div className="space-y-2">
                <Label>Contraseña inicial</Label>
                <Input type="password" value={employeeForm.contrasena} onChange={(e) => setEmployeeForm({ ...employeeForm, contrasena: e.target.value })} placeholder="empleado123 (por defecto)" className="rounded-lg border-gray-200" />
                <p className="text-xs text-gray-500">Si no ingresas una, se usará "empleado123"</p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={resetEmployeeForm} className="rounded-lg border-gray-300">Cancelar</Button>
              <Button onClick={handleCreateOrUpdateEmployee} disabled={saving} className="bg-gradient-to-r from-[#78D1BD] to-[#5FBFAA] hover:from-[#6BCAB7] hover:to-[#4FB5A1] text-white rounded-lg">
                {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Guardando...</> : (editingEmployee ? 'Actualizar' : 'Crear') + ' Empleado'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Ver Detalles */}
      <Dialog open={!!viewingEmployee} onOpenChange={() => setViewingEmployee(null)}>
        <DialogContent className="rounded-xl max-w-2xl border-gray-200 shadow-lg">
          <DialogHeader><DialogTitle>Detalles del Empleado</DialogTitle></DialogHeader>
          {viewingEmployee && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <Avatar className="w-16 h-16 ring-2 ring-gray-100">
                  {viewingEmployee.image ? (
                    <ImageWithFallback src={viewingEmployee.image} alt={viewingEmployee.name} className="w-full h-full object-cover" />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-[#78D1BD] to-[#5FBFAA] text-white text-xl">
                      {viewingEmployee.name.charAt(0)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-gray-900">{viewingEmployee.name}</h3>
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs px-2 py-0.5 mt-1">{viewingEmployee.specialty || "Sin especialidad"}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><p className="text-sm text-gray-600">Correo</p><p className="text-gray-900">{viewingEmployee.email || "—"}</p></div>
                <div className="space-y-1"><p className="text-sm text-gray-600">Teléfono</p><p className="text-gray-900">{viewingEmployee.phone || "—"}</p></div>
                <div className="space-y-1"><p className="text-sm text-gray-600">Ciudad</p><p className="text-gray-900">{viewingEmployee.ciudad || "—"}</p></div>
                <div className="space-y-1"><p className="text-sm text-gray-600">Documento</p><p className="text-gray-900">{viewingEmployee.tipo_documento} {viewingEmployee.numero_documento || "—"}</p></div>
                <div className="space-y-1"><p className="text-sm text-gray-600">Dirección</p><p className="text-gray-900">{viewingEmployee.direccion || "—"}</p></div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Estado</p>
                  <Badge className={viewingEmployee.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}>
                    {viewingEmployee.isActive ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog: Confirmar Eliminación */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2"><AlertCircle className="w-5 h-5 text-[#F87171]" />¿Desactivar Empleado?</AlertDialogTitle>
            <AlertDialogDescription>El empleado pasará a estado Inactivo y no podrá iniciar sesión.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteEmployee} className="bg-[#F87171] hover:bg-[#EF4444]">Desactivar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
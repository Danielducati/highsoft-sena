import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "../../shared/ui/card";
import { Button } from "../../shared/ui/button";
import { Input } from "../../shared/ui/input";
import { Label } from "../../shared/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../shared/ui/dialog";
import { Badge } from "../../shared/ui/badge";
import { Avatar, AvatarFallback } from "../../shared/ui/avatar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../shared/ui/alert-dialog";
import { Plus, Pencil, Trash2, Search, Eye, Mail, Filter, Users as UsersIcon, Shield, AlertCircle, Upload, Image as ImageIcon, X } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../shared/ui/select";
import { Switch } from "../../shared/ui/switch";

const API_BASE = "http://localhost:3001";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface User {
  id: number;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  documentType: string;
  document: string;
  role: string;
  rolId: number;
  specialty: string;
  photo: string;
  isActive: boolean;
  createdAt: string;
  lastLogin: string;
  assignedServices: string[];
}

interface Role {
  id: number;
  nombre: string;
}

interface UsersModuleProps {
  userRole: "admin" | "employee" | "client";
}

const EMPTY_FORM = {
  firstName:    "",
  lastName:     "",
  documentType: "",
  document:     "",
  email:        "",
  phone:        "",
  role:         "",
  password:     "",
  image:        "",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getRoleBadgeColor(role: string): string {
  const map: Record<string, string> = {
    Administrador:  "bg-purple-100 text-purple-700 border-purple-200",
    Empleado:       "bg-blue-100 text-blue-700 border-blue-200",
    Recepcionista:  "bg-emerald-100 text-emerald-700 border-emerald-200",
    Terapeuta:      "bg-pink-100 text-pink-700 border-pink-200",
    Cliente:        "bg-gray-100 text-gray-700 border-gray-200",
  };
  return map[role] ?? "bg-gray-100 text-gray-700 border-gray-200";
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function UsersModule({ userRole }: UsersModuleProps) {
  const [users,   setUsers]   = useState<User[]>([]);
  const [roles,   setRoles]   = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm,   setSearchTerm]   = useState("");
  const [filterRole,   setFilterRole]   = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage,  setCurrentPage]  = useState(1);
  const itemsPerPage = 5;

  const [isDialogOpen,   setIsDialogOpen]   = useState(false);
  const [editingUser,    setEditingUser]    = useState<User | null>(null);
  const [viewingUser,    setViewingUser]    = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete,   setUserToDelete]   = useState<number | null>(null);
  const [imagePreview,   setImagePreview]   = useState("");

  const [formData, setFormData] = useState(EMPTY_FORM);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Carga inicial ──────────────────────────────────────────────────────────
  useEffect(() => {
    async function fetchAll() {
      try {
        const [usrRes, rolRes] = await Promise.all([
          fetch(`${API_BASE}/users`),
          fetch(`${API_BASE}/users/roles`),
        ]);
        const [usrData, rolData] = await Promise.all([usrRes.json(), rolRes.json()]);
        setUsers(usrData);
        setRoles(rolData);
      } catch (err) {
        console.error(err);
        toast.error("Error al conectar con el servidor");
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  const reloadUsers = async () => {
    const res  = await fetch(`${API_BASE}/users`);
    const data = await res.json();
    setUsers(data);
  };

  // ── Filtros ────────────────────────────────────────────────────────────────
  const filteredUsers = users.filter(u => {
    const matchSearch  = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.phone.includes(searchTerm);
    const matchRole    = filterRole   === "all" || u.role === filterRole;
    const matchStatus  = filterStatus === "all" ||
                         (filterStatus === "active"   && u.isActive) ||
                         (filterStatus === "inactive" && !u.isActive);
    return matchSearch && matchRole && matchStatus;
  });

  const totalPages    = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // ── Imagen ─────────────────────────────────────────────────────────────────
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5_000_000) { toast.error("La imagen no debe superar los 5MB"); return; }
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
      setFormData(prev => ({ ...prev, image: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  // ── Formulario ────────────────────────────────────────────────────────────
  const resetForm = () => {
    setIsDialogOpen(false);
    setEditingUser(null);
    setFormData(EMPTY_FORM);
    setImagePreview("");
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      firstName:    user.firstName,
      lastName:     user.lastName,
      documentType: user.documentType,
      document:     user.document,
      email:        user.email,
      phone:        user.phone,
      role:         user.role,
      password:     "",
      image:        "",
    });
    setImagePreview("");
    setIsDialogOpen(true);
  };

  // ── CRUD ──────────────────────────────────────────────────────────────────
  const handleCreateOrUpdate = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.role) {
      toast.error("Nombre, apellido, email y rol son obligatorios");
      return;
    }

    try {
      if (editingUser) {
        const res = await fetch(`${API_BASE}/users/${editingUser.id}`, {
          method:  "PUT",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify(formData),
        });
        if (!res.ok) throw new Error((await res.json()).error ?? "Error al actualizar");
        toast.success("Usuario actualizado");
      } else {
        const res = await fetch(`${API_BASE}/users`, {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify(formData),
        });
        if (!res.ok) throw new Error((await res.json()).error ?? "Error al crear");
        toast.success("Usuario creado — contraseña por defecto: Highlife2024*");
      }
      await reloadUsers();
      resetForm();
    } catch (err: any) {
      toast.error(err.message ?? "Error al guardar");
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      await fetch(`${API_BASE}/users/${user.id}/status`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ isActive: !user.isActive }),
      });
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isActive: !u.isActive } : u));
      toast.success("Estado actualizado");
    } catch {
      toast.error("Error al actualizar estado");
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    try {
      await fetch(`${API_BASE}/users/${userToDelete}`, { method: "DELETE" });
      setUsers(prev => prev.filter(u => u.id !== userToDelete));
      toast.success("Usuario eliminado");
    } catch {
      toast.error("Error al eliminar");
    } finally {
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const activeUsers = users.filter(u => u.isActive).length;

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-500">Cargando usuarios...</div>
  );

  return (
    <div className="space-y-4">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <UsersIcon className="w-5 h-5 text-[#60A5FA]" />
            <h1 className="text-gray-900">Gestión de Usuarios</h1>
          </div>
          <p className="text-sm text-gray-600 mt-0.5">{users.length} usuarios • {activeUsers} activos</p>
        </div>
        {userRole === "admin" && (
          <button
            onClick={() => { setEditingUser(null); setFormData(EMPTY_FORM); setIsDialogOpen(true); }}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 bg-gradient-to-r from-[#A78BFA] to-[#9370DB] hover:from-[#9870E8] hover:to-[#8260CB] text-white text-sm shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Nuevo Usuario
          </button>
        )}
      </div>

      {/* ── Filtros ── */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <Input placeholder="Buscar por nombre, email o teléfono..."
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="pl-8 h-8 text-sm rounded-lg border-gray-200" />
            </div>
            <div className="flex gap-2 items-center">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <Select value={filterRole} onValueChange={v => { setFilterRole(v); setCurrentPage(1); }}>
                <SelectTrigger className="w-40 h-8 text-sm rounded-lg border-gray-200">
                  <SelectValue placeholder="Rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los roles</SelectItem>
                  {roles.map(r => <SelectItem key={r.id} value={r.nombre}>{r.nombre}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={v => { setFilterStatus(v); setCurrentPage(1); }}>
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

      {/* ── Cabecera tabla ── */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-3 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-xs text-gray-600">
        <div className="col-span-3">Nombre</div>
        <div className="col-span-2">Rol</div>
        <div className="col-span-3">Correo</div>
        <div className="col-span-2">Estado</div>
        <div className="col-span-2 text-right">Acciones</div>
      </div>

      {/* ── Filas ── */}
      <div className="space-y-1">
        {paginatedUsers.length === 0 ? (
          <Card className="border-gray-200 shadow-sm">
            <CardContent className="p-8 text-center">
              <UsersIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-900 mb-1">No se encontraron usuarios</p>
              <p className="text-sm text-gray-600">Intenta ajustar los filtros</p>
            </CardContent>
          </Card>
        ) : paginatedUsers.map(user => (
          <div key={user.id} className="bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-all">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 lg:gap-3 p-2.5 lg:p-3 items-center">

              {/* Nombre */}
              <div className="lg:col-span-3 flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#78D1BD] to-[#5FBFAA] flex items-center justify-center text-white text-sm flex-shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-gray-900 truncate">{user.name}</p>
                </div>
              </div>

              {/* Rol */}
              <div className="lg:col-span-2 flex items-center gap-1.5">
                <Shield className="w-3 h-3 text-gray-400 flex-shrink-0" />
                <Badge variant="outline" className={`${getRoleBadgeColor(user.role)} text-xs px-1.5 py-0 h-4`}>
                  {user.role}
                </Badge>
              </div>

              {/* Email */}
              <div className="lg:col-span-3 min-w-0 flex items-center gap-1.5">
                <Mail className="w-3 h-3 text-gray-400 flex-shrink-0" />
                <span className="text-xs text-gray-700 truncate">{user.email}</span>
              </div>

              {/* Estado */}
              <div className="lg:col-span-2 flex items-center gap-1.5">
                {userRole === "admin" && (
                  <Switch checked={user.isActive} onCheckedChange={() => handleToggleStatus(user)} className="scale-75" />
                )}
                <Badge className={`text-xs px-2 py-0 h-5 ${user.isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>
                  {user.isActive ? "Activo" : "Inactivo"}
                </Badge>
              </div>

              {/* Acciones */}
              <div className="lg:col-span-2 flex items-center justify-end gap-1">
                {userRole === "admin" && (
                  <>
                    <button onClick={() => setViewingUser(user)}
                      className="p-1 hover:bg-blue-50 rounded text-blue-600 transition-colors" title="Ver">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleEdit(user)}
                      className="p-1 hover:bg-amber-50 rounded text-amber-600 transition-colors" title="Editar">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => { setUserToDelete(user.id); setDeleteDialogOpen(true); }}
                      className="p-1 hover:bg-red-50 rounded text-red-600 transition-colors" title="Eliminar">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Paginación ── */}
      {totalPages > 1 && (
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-3 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-sm text-gray-600">
              Mostrando {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredUsers.length)} de {filteredUsers.length}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Anterior</Button>
              <span className="text-sm text-gray-600">Página {currentPage} de {totalPages}</span>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Siguiente</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Crear / Editar ── */}
      <Dialog open={isDialogOpen} onOpenChange={open => { if (!open) resetForm(); setIsDialogOpen(open); }}>
        <DialogContent className="rounded-xl max-w-3xl max-h-[90vh] overflow-y-auto border-gray-200 shadow-lg">
          <DialogHeader>
            <DialogTitle>{editingUser ? "Editar Usuario" : "Nuevo Usuario"}</DialogTitle>
            <DialogDescription>
              {editingUser ? "Actualiza la información del usuario" : "Crea un nuevo usuario — la contraseña por defecto es Highlife2024*"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 mt-4">

            {/* Foto */}
            <div className="space-y-2">
              <Label>Foto de Perfil</Label>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="w-20 h-20 ring-2 ring-gray-200">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <AvatarFallback className="bg-gradient-to-br from-[#78D1BD] to-[#5FBFAA] text-white text-xl">
                        <ImageIcon className="w-8 h-8" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  {imagePreview && (
                    <button onClick={() => { setImagePreview(""); setFormData(p => ({ ...p, image: "" })); }}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="flex-1">
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full rounded-lg border-gray-200">
                    <Upload className="w-4 h-4 mr-2" />
                    {imagePreview ? "Cambiar Imagen" : "Subir Imagen"}
                  </Button>
                  <p className="text-xs text-gray-500 mt-1">JPG, PNG o GIF (máx. 5MB)</p>
                </div>
              </div>
            </div>

            {/* Nombre / Apellido */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre *</Label>
                <Input value={formData.firstName} onChange={e => setFormData(p => ({ ...p, firstName: e.target.value }))}
                  placeholder="Juan" className="rounded-lg border-gray-200" />
              </div>
              <div className="space-y-2">
                <Label>Apellido *</Label>
                <Input value={formData.lastName} onChange={e => setFormData(p => ({ ...p, lastName: e.target.value }))}
                  placeholder="Pérez" className="rounded-lg border-gray-200" />
              </div>
            </div>

            {/* Documento */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de Documento</Label>
                <Select value={formData.documentType || "placeholder"}
                  onValueChange={v => { if (v !== "placeholder") setFormData(p => ({ ...p, documentType: v })); }}>
                  <SelectTrigger className="rounded-lg border-gray-200"><SelectValue placeholder="Seleccionar tipo" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="placeholder" disabled>Seleccionar tipo</SelectItem>
                    <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
                    <SelectItem value="CE">Cédula de Extranjería</SelectItem>
                    <SelectItem value="TI">Tarjeta de Identidad</SelectItem>
                    <SelectItem value="PP">Pasaporte</SelectItem>
                    <SelectItem value="NIT">NIT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Número de Documento</Label>
                <Input value={formData.document} onChange={e => setFormData(p => ({ ...p, document: e.target.value }))}
                  placeholder="1234567890" className="rounded-lg border-gray-200" />
              </div>
            </div>

            {/* Teléfono / Email */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                  placeholder="+57 300 123 4567" className="rounded-lg border-gray-200" />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                  placeholder="usuario@highlife.com" className="rounded-lg border-gray-200" />
              </div>
            </div>

            {/* Rol */}
            <div className="space-y-2">
              <Label>Rol *</Label>
              <Select value={formData.role || "placeholder"}
                onValueChange={v => { if (v !== "placeholder") setFormData(p => ({ ...p, role: v })); }}>
                <SelectTrigger className="rounded-lg border-gray-200"><SelectValue placeholder="Seleccionar rol" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="placeholder" disabled>Seleccionar rol</SelectItem>
                  {roles.map(r => <SelectItem key={r.id} value={r.nombre}>{r.nombre}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={resetForm} className="rounded-lg border-gray-300">Cancelar</Button>
              <Button onClick={handleCreateOrUpdate}
                className="bg-gradient-to-r from-[#78D1BD] to-[#5FBFAA] hover:from-[#6BCAB7] hover:to-[#4FB5A1] text-white rounded-lg">
                {editingUser ? "Actualizar" : "Crear"} Usuario
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Ver Detalle ── */}
      <Dialog open={!!viewingUser} onOpenChange={() => setViewingUser(null)}>
        <DialogContent className="rounded-xl max-w-2xl border-gray-200 shadow-lg">
          <DialogHeader>
            <DialogTitle>Detalles del Usuario</DialogTitle>
          </DialogHeader>
          {viewingUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="bg-gradient-to-br from-[#78D1BD] to-[#5FBFAA] text-white text-xl">
                    {viewingUser.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-gray-900">{viewingUser.name}</p>
                  <Badge variant="outline" className={`${getRoleBadgeColor(viewingUser.role)} text-xs mt-1`}>
                    {viewingUser.role}
                  </Badge>
                </div>
                <Badge variant="outline" className={`text-xs ${viewingUser.isActive ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-100 text-gray-600"}`}>
                  {viewingUser.isActive ? "Activo" : "Inactivo"}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-sm text-gray-600">Email</p><p className="text-gray-900">{viewingUser.email}</p></div>
                <div><p className="text-sm text-gray-600">Teléfono</p><p className="text-gray-900">{viewingUser.phone || "—"}</p></div>
                <div><p className="text-sm text-gray-600">Documento</p><p className="text-gray-900">{viewingUser.documentType} {viewingUser.document || "—"}</p></div>
                {viewingUser.specialty && (
                  <div><p className="text-sm text-gray-600">Especialidad</p><p className="text-gray-900">{viewingUser.specialty}</p></div>
                )}
              </div>
              <div className="flex justify-end pt-4 border-t">
                <Button variant="outline" onClick={() => setViewingUser(null)} className="rounded-lg border-gray-300">Cerrar</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Confirmar Eliminación ── */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-[#F87171]" />¿Eliminar Usuario?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el usuario y todos sus datos asociados. No se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-[#F87171] hover:bg-[#EF4444]">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
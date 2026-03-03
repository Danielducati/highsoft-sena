import { useState } from "react";
import { Card, CardContent } from "../../../shared/ui/card";
import { Button } from "../../../shared/ui/button";
import { Input } from "../../../shared/ui/input";
import { Label } from "../../../shared/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../../shared/ui/dialog";
import { Badge } from "../../../shared/ui/badge";
import { Textarea } from "../../../shared/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../shared/ui/select";
import { Switch } from "../../../shared/ui/switch";



import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Eye,
  Filter,
  Lock,
  Key,
  Layers,
} from "lucide-react";

import { toast } from "sonner";


interface AccessPermission {
  id: number;
  name: string;
  description: string;
  module: string;
  action: string;
  isActive: boolean;
  createdAt: string;
  rolesCount: number;
}

interface AccessModuleProps {
  userRole: 'admin' | 'employee' | 'client';
}

export function AccessModule({ userRole }: AccessModuleProps) {
  const modules = [
    "Dashboard",
    "Servicios",
    "Categorías",
    "Citas",
    "Horarios",
    "Empleados",
    "Clientes",
    "Cotizaciones",
    "Ventas",
    "Usuarios",
    "Roles",
    "Reportes"
  ];

  const actions = [
    "Ver",
    "Crear",
    "Editar",
    "Eliminar",
    "Exportar",
    "Gestionar"
  ];

  const [permissions, setPermissions] = useState<AccessPermission[]>([
    {
      id: 1,
      name: "Ver Dashboard",
      description: "Permite acceder y visualizar el panel principal del sistema",
      module: "Dashboard",
      action: "Ver",
      isActive: true,
      createdAt: "2024-01-10",
      rolesCount: 4
    },
    {
      id: 2,
      name: "Crear Servicios",
      description: "Permite crear nuevos servicios en el catálogo",
      module: "Servicios",
      action: "Crear",
      isActive: true,
      createdAt: "2024-01-12",
      rolesCount: 2
    },
    {
      id: 3,
      name: "Editar Servicios",
      description: "Permite modificar servicios existentes",
      module: "Servicios",
      action: "Editar",
      isActive: true,
      createdAt: "2024-01-12",
      rolesCount: 2
    },
    {
      id: 4,
      name: "Ver Citas",
      description: "Permite visualizar las citas programadas",
      module: "Citas",
      action: "Ver",
      isActive: true,
      createdAt: "2024-01-15",
      rolesCount: 5
    },
    {
      id: 5,
      name: "Crear Citas",
      description: "Permite programar nuevas citas para clientes",
      module: "Citas",
      action: "Crear",
      isActive: true,
      createdAt: "2024-01-15",
      rolesCount: 4
    },
    {
      id: 6,
      name: "Eliminar Clientes",
      description: "Permite eliminar registros de clientes del sistema",
      module: "Clientes",
      action: "Eliminar",
      isActive: false,
      createdAt: "2024-02-01",
      rolesCount: 1
    },
    {
      id: 7,
      name: "Gestionar Usuarios",
      description: "Permite crear, editar y eliminar usuarios del sistema",
      module: "Usuarios",
      action: "Gestionar",
      isActive: true,
      createdAt: "2024-01-10",
      rolesCount: 1
    },
    {
      id: 8,
      name: "Exportar Reportes",
      description: "Permite exportar reportes en diferentes formatos",
      module: "Reportes",
      action: "Exportar",
      isActive: true,
      createdAt: "2024-02-10",
      rolesCount: 2
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterModule, setFilterModule] = useState("all");
  const [filterAction, setFilterAction] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<AccessPermission | null>(null);
  const [viewingPermission, setViewingPermission] = useState<AccessPermission | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    module: "",
    action: "",
  });

  const filteredPermissions = permissions.filter(permission => {
    const matchesSearch = permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         permission.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModule = filterModule === "all" || permission.module === filterModule;
    const matchesAction = filterAction === "all" || permission.action === filterAction;
    return matchesSearch && matchesModule && matchesAction;
  });

  const handleCreateOrUpdate = () => {
    if (!formData.name || !formData.description || !formData.module || !formData.action) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }

    if (editingPermission) {
      setPermissions(permissions.map(permission =>
        permission.id === editingPermission.id
          ? { ...permission, ...formData }
          : permission
      ));
      toast.success("Permiso actualizado exitosamente");
    } else {
      const newPermission: AccessPermission = {
        id: Math.max(...permissions.map(p => p.id), 0) + 1,
        ...formData,
        isActive: true,
        createdAt: new Date().toISOString().split('T')[0],
        rolesCount: 0
      };
      setPermissions([...permissions, newPermission]);
      toast.success("Permiso creado exitosamente");
    }

    resetForm();
  };

  const resetForm = () => {
    setIsDialogOpen(false);
    setEditingPermission(null);
    setFormData({ name: "", description: "", module: "", action: "" });
  };

  const handleDelete = (id: number) => {
    const permission = permissions.find(p => p.id === id);
    if (permission && permission.rolesCount > 0) {
      toast.error(`No se puede eliminar el permiso "${permission.name}" porque está asignado a ${permission.rolesCount} rol(es)`);
      return;
    }
    setPermissions(permissions.filter(permission => permission.id !== id));
    toast.success("Permiso eliminado exitosamente");
  };

  const handleEdit = (permission: AccessPermission) => {
    setEditingPermission(permission);
    setFormData({
      name: permission.name,
      description: permission.description,
      module: permission.module,
      action: permission.action,
    });
    setIsDialogOpen(true);
  };

  const handleToggleStatus = (id: number) => {
    setPermissions(permissions.map(permission =>
      permission.id === id ? { ...permission, isActive: !permission.isActive } : permission
    ));
    toast.success("Estado actualizado");
  };

  const getModuleColor = (module: string) => {
    const colors: Record<string, string> = {
      'Dashboard': 'bg-blue-100 text-blue-700',
      'Servicios': 'bg-purple-100 text-purple-700',
      'Categorías': 'bg-pink-100 text-pink-700',
      'Citas': 'bg-green-100 text-green-700',
      'Horarios': 'bg-cyan-100 text-cyan-700',
      'Empleados': 'bg-teal-100 text-teal-700',
      'Clientes': 'bg-indigo-100 text-indigo-700',
      'Cotizaciones': 'bg-amber-100 text-amber-700',
      'Ventas': 'bg-emerald-100 text-emerald-700',
      'Usuarios': 'bg-violet-100 text-violet-700',
      'Roles': 'bg-fuchsia-100 text-fuchsia-700',
      'Reportes': 'bg-orange-100 text-orange-700',
    };
    return colors[module] || 'bg-gray-100 text-gray-700';
  };

  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      'Ver': 'bg-blue-50 text-blue-600',
      'Crear': 'bg-green-50 text-green-600',
      'Editar': 'bg-amber-50 text-amber-600',
      'Eliminar': 'bg-red-50 text-red-600',
      'Exportar': 'bg-purple-50 text-purple-600',
      'Gestionar': 'bg-indigo-50 text-indigo-600',
    };
    return colors[action] || 'bg-gray-50 text-gray-600';
  };

  const activePermissions = permissions.filter(p => p.isActive).length;
  const totalPermissions = permissions.length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-[#60A5FA]" />
            <h1 className="text-gray-900">Gestión de Permisos</h1>
          </div>
          <p className="text-sm text-gray-600 mt-0.5">
            {totalPermissions} permisos • {activePermissions} activos
          </p>
        </div>
        {userRole === 'admin' && (
          <button
            onClick={() => {
              setEditingPermission(null);
              setFormData({ name: "", description: "", module: "", action: "" });
              setIsDialogOpen(true);
            }}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 bg-gradient-to-r from-[#A78BFA] to-[#9370DB] hover:from-[#9870E8] hover:to-[#8260CB] text-white text-sm shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Nuevo Permiso
          </button>
        )}
      </div>

      {/* Filters */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <Input
                placeholder="Buscar permisos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-8 text-sm rounded-lg border-gray-200"
              />
            </div>
            <div className="flex gap-2 items-center">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <Select value={filterModule} onValueChange={setFilterModule}>
                <SelectTrigger className="w-40 h-8 text-sm rounded-lg border-gray-200">
                  <SelectValue placeholder="Módulo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {modules.map(module => (
                    <SelectItem key={module} value={module}>{module}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterAction} onValueChange={setFilterAction}>
                <SelectTrigger className="w-32 h-8 text-sm rounded-lg border-gray-200">
                  <SelectValue placeholder="Acción" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {actions.map(action => (
                    <SelectItem key={action} value={action}>{action}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table Header - Desktop */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-3 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-xs text-gray-600">
        <div className="col-span-3">Permiso</div>
        <div className="col-span-3">Descripción</div>
        <div className="col-span-2">Módulo</div>
        <div className="col-span-1">Estado</div>
        <div className="col-span-3 text-right">Acciones</div>
      </div>

      {/* Permissions List - Table Rows */}
      <div className="space-y-1">
        {filteredPermissions.map((permission) => {
          return (
            <div key={permission.id} className="bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-all">
              {/* Main Row */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 lg:gap-3 p-2.5 lg:p-3 items-start lg:items-center">
                {/* Permiso */}
                <div className="lg:col-span-3 flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#60A5FA] to-[#3B82F6] flex items-center justify-center text-white flex-shrink-0">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-900 truncate">{permission.name}</p>
                    <Badge className={`${getActionColor(permission.action)} text-xs px-1.5 py-0 h-4 mt-0.5`}>
                      {permission.action}
                    </Badge>
                  </div>
                </div>

                {/* Descripción */}
                <div className="lg:col-span-3 min-w-0">
                  <p className="text-xs text-gray-700 line-clamp-2">{permission.description}</p>
                </div>

                {/* Módulo */}
                <div className="lg:col-span-2">
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-3 h-3 text-gray-400" />
                    <Badge className={`${getModuleColor(permission.module)} text-xs px-1.5 py-0 h-4`}>
                      {permission.module}
                    </Badge>
                  </div>
                </div>

                {/* Estado */}
                <div className="lg:col-span-1">
                  <div className="flex items-center gap-1.5">
                    {userRole === 'admin' && (
                      <Switch
                        checked={permission.isActive}
                        onCheckedChange={() => handleToggleStatus(permission.id)}
                        className="scale-75"
                      />
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="lg:col-span-3 flex items-center justify-end gap-1">
                  {userRole === 'admin' && (
                    <>
                      <button
                        onClick={() => {
                          setViewingPermission(permission);
                          setIsViewDialogOpen(true);
                        }}
                        className="p-1 hover:bg-blue-50 rounded text-blue-600 transition-colors"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(permission)}
                        className="p-1 hover:bg-amber-50 rounded text-amber-600 transition-colors"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(permission.id)}
                        className="p-1 hover:bg-red-50 rounded text-red-600 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredPermissions.length === 0 && (
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-8 text-center">
            <Key className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-900 mb-1">No se encontraron permisos</p>
            <p className="text-sm text-gray-600">Intenta ajustar los filtros de búsqueda</p>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="rounded-xl max-w-2xl border-gray-200 shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-gray-900">{editingPermission ? 'Editar Permiso' : 'Nuevo Permiso'}</DialogTitle>
            <DialogDescription className="text-gray-600">
              {editingPermission ? 'Actualiza la información del permiso' : 'Crea un nuevo permiso de acceso'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-900">Nombre del Permiso *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Ver Dashboard, Crear Servicios..."
                className="rounded-lg border-gray-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="module" className="text-gray-900">Módulo *</Label>
                <Select
                  value={formData.module}
                  onValueChange={(value: string) => setFormData({ ...formData, module: value })}
                >
                  <SelectTrigger className="rounded-lg border-gray-200">
                    <SelectValue placeholder="Seleccionar módulo" />
                  </SelectTrigger>
                  <SelectContent>
                    {modules.map((module) => (
                      <SelectItem key={module} value={module}>
                        {module}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="action" className="text-gray-900">Acción *</Label>
                <Select
                  value={formData.action}
                  onValueChange={(value: string) => setFormData({ ...formData, action: value })}
                >
                  <SelectTrigger className="rounded-lg border-gray-200">
                    <SelectValue placeholder="Seleccionar acción" />
                  </SelectTrigger>
                  <SelectContent>
                    {actions.map((action) => (
                      <SelectItem key={action} value={action}>
                        {action}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>


            <div className="space-y-2">
              <Label htmlFor="description" className="text-gray-900">Descripción *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe qué permite hacer este permiso..."
                rows={3}
                className="rounded-lg border-gray-200"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={resetForm}
                className="rounded-lg border-gray-300"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateOrUpdate}
                className="bg-gradient-to-r from-[#78D1BD] to-[#5FBFAA] hover:from-[#6BCAB7] hover:to-[#4FB5A1] text-white rounded-lg"
              >
                {editingPermission ? 'Actualizar' : 'Crear'} Permiso
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="rounded-xl max-w-2xl border-gray-200 shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Detalles del Permiso</DialogTitle>
          </DialogHeader>
          {viewingPermission && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#60A5FA] to-[#3B82F6] flex items-center justify-center shadow-sm">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-gray-900">{viewingPermission.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={`${getModuleColor(viewingPermission.module)} text-xs px-2 py-0.5`}>
                      {viewingPermission.module}
                    </Badge>
                    <Badge className={`${getActionColor(viewingPermission.action)} text-xs px-2 py-0.5`}>
                      {viewingPermission.action}
                    </Badge>
                  </div>
                </div>
                <Badge
                  className={`text-xs px-2 py-0.5 ${
                    viewingPermission.isActive
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-gray-100 text-gray-600 border-gray-200'
                  }`}
                >
                  {viewingPermission.isActive ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Descripción</p>
                  <p className="text-gray-900 mt-1">{viewingPermission.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Fecha de Creación</p>
                    <p className="text-gray-900 mt-1">
                      {new Date(viewingPermission.createdAt).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Asignado a</p>
                    <p className="text-gray-900 mt-1">
                      {viewingPermission.rolesCount} {viewingPermission.rolesCount === 1 ? 'rol' : 'roles'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsViewDialogOpen(false)}
                  className="rounded-lg border-gray-300"
                >
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
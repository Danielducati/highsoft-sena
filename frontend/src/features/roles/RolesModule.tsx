import { useState, useRef } from "react";
import { Card, CardContent } from "../../shared/ui/card";
import { Button } from "../../shared/ui/button";
import { Input } from "../../shared/ui/input";
import { Label } from "../../shared/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../shared/ui/dialog";
import { Badge } from "../../shared/ui/badge";
import { Checkbox } from "../../shared/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../shared/ui/alert-dialog";
import { Plus, Pencil, Trash2, Search, Shield, Eye, Filter, Users, Lock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "../../shared/ui/textarea";
import { Switch } from "../../shared/ui/switch";

interface Permission {
  id: string;
  name: string;
  category: string;
}

interface Role {
  id: number;
  name: string;
  description: string;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  usersCount: number;
}

interface RolesModuleProps {
  userRole: 'admin' | 'employee' | 'client';
}

export function RolesModule({ userRole }: RolesModuleProps) {
  const availablePermissions: Permission[] = [];

  const [roles, setRoles] = useState<Role[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [viewingRole, setViewingRole] = useState<Role | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissions: [] as string[],
  });

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateOrUpdate = () => {
    if (!formData.name || !formData.description) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }

    if (formData.permissions.length === 0) {
      toast.error("Debes asignar al menos un permiso al rol");
      return;
    }

    if (editingRole) {
      setRoles(roles.map(role =>
        role.id === editingRole.id
          ? { ...role, ...formData }
          : role
      ));
      toast.success("Rol actualizado exitosamente");
    } else {
      const newRole: Role = {
        id: Math.max(...roles.map(r => r.id), 0) + 1,
        ...formData,
        isActive: true,
        createdAt: new Date().toISOString().split('T')[0],
        usersCount: 0
      };
      setRoles([...roles, newRole]);
      toast.success("Rol creado exitosamente");
    }

    setIsDialogOpen(false);
    setEditingRole(null);
    setFormData({ name: "", description: "", permissions: [] });
  };

  const confirmDelete = (id: number) => {
    const role = roles.find(r => r.id === id);
    if (role && role.usersCount > 0) {
      toast.error(`No se puede eliminar el rol "${role.name}" porque tiene ${role.usersCount} usuarios asignados`);
      return;
    }
    setRoleToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (roleToDelete) {
      setRoles(roles.filter(role => role.id !== roleToDelete));
      toast.success("Rol eliminado exitosamente");
      setDeleteDialogOpen(false);
      setRoleToDelete(null);
    }
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description,
      permissions: role.permissions,
    });
    setIsDialogOpen(true);
  };

  const handleToggleStatus = (id: number) => {
    setRoles(roles.map(role =>
      role.id === id ? { ...role, isActive: !role.isActive } : role
    ));
    toast.success("Estado actualizado");
  };

  const handlePermissionToggle = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  const groupedPermissions = availablePermissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  const activeRoles = roles.filter(r => r.isActive).length;
  const totalRoles = roles.length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#A78BFA]" />
            <h1 className="text-gray-900">Gestión de Roles</h1>
          </div>
          <p className="text-sm text-gray-600 mt-0.5">
            {totalRoles} roles • {activeRoles} activos
          </p>
        </div>
        {userRole === 'admin' && (
          <button
            onClick={() => {
              setEditingRole(null);
              setFormData({ name: "", description: "", permissions: [] });
              setIsDialogOpen(true);
            }}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 bg-gradient-to-r from-[#A78BFA] to-[#9370DB] hover:from-[#9870E8] hover:to-[#8260CB] text-white text-sm shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Nuevo Rol
          </button>
        )}
      </div>

      {/* Search */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-3">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <Input
                placeholder="Buscar roles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-8 text-sm rounded-lg border-gray-200"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table Header - Desktop */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-3 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-xs text-gray-600">
        <div className="col-span-3">Rol</div>
        <div className="col-span-4">Descripción</div>
        <div className="col-span-2">Permisos</div>
        <div className="col-span-3 text-right">Acciones</div>
      </div>

      {/* Roles List - Table Rows */}
      <div className="space-y-1">
        {filteredRoles.map((role) => {
          return (
            <div key={role.id} className="bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-all">
              {/* Main Row */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 lg:gap-3 p-2.5 lg:p-3 items-start lg:items-center">
                {/* Rol */}
                <div className="lg:col-span-3 flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#A78BFA] to-[#8B5CF6] flex items-center justify-center text-white flex-shrink-0">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-900 truncate">{role.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Users className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-600">{role.usersCount} usuarios</span>
                    </div>
                  </div>
                </div>

                {/* Descripción */}
                <div className="lg:col-span-4 min-w-0">
                  <p className="text-xs text-gray-700 line-clamp-2">{role.description}</p>
                </div>

                {/* Permisos */}
                <div className="lg:col-span-2">
                  <div className="flex items-center gap-1.5">
                    <Lock className="w-3 h-3 text-gray-400" />
                    <Badge className="bg-purple-100 text-purple-700 text-xs px-1.5 py-0 h-4">
                      {role.permissions.length} permisos
                    </Badge>
                  </div>
                </div>

                {/* Actions */}
                <div className="lg:col-span-3 flex items-center justify-end gap-1">
                  {userRole === 'admin' && (
                    <>
                      <button
                        onClick={() => {
                          setViewingRole(role);
                          setIsViewDialogOpen(true);
                        }}
                        className="p-1 hover:bg-blue-50 rounded text-blue-600 transition-colors"
                        title="Ver permisos"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(role)}
                        className="p-1 hover:bg-amber-50 rounded text-amber-600 transition-colors"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => confirmDelete(role.id)}
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

      {filteredRoles.length === 0 && (
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-8 text-center">
            <Shield className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-900 mb-1">No se encontraron roles</p>
            <p className="text-sm text-gray-600">Intenta ajustar los filtros de búsqueda</p>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="rounded-xl max-w-3xl max-h-[90vh] overflow-y-auto border-gray-200 shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-gray-900">{editingRole ? 'Editar Rol' : 'Nuevo Rol'}</DialogTitle>
            <DialogDescription className="text-gray-600">
              {editingRole ? 'Actualiza la información del rol' : 'Crea un nuevo rol y asigna permisos'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 mt-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-900">Nombre del Rol *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Gerente, Recepcionista..."
                className="rounded-lg border-gray-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-gray-900">Descripción *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe las responsabilidades de este rol..."
                rows={3}
                className="rounded-lg border-gray-200"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-gray-900">Asignar Permisos *</Label>
              <div className="border border-gray-200 rounded-lg p-4 space-y-4 max-h-96 overflow-y-auto">
                {Object.entries(groupedPermissions).map(([category, permissions]) => (
                  <div key={category} className="space-y-2">
                    <h4 className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{category}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-3">
                      {permissions.map((permission) => (
                        <div key={permission.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={permission.id}
                            checked={formData.permissions.includes(permission.id)}
                            onCheckedChange={() => handlePermissionToggle(permission.id)}
                          />
                          <label
                            htmlFor={permission.id}
                            className="text-sm text-gray-700 cursor-pointer select-none"
                          >
                            {permission.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500">
                {formData.permissions.length} permiso{formData.permissions.length !== 1 ? 's' : ''} seleccionado{formData.permissions.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  setEditingRole(null);
                  setFormData({ name: "", description: "", permissions: [] });
                }}
                className="rounded-lg border-gray-300"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateOrUpdate}
                className="bg-gradient-to-r from-[#78D1BD] to-[#5FBFAA] hover:from-[#6BCAB7] hover:to-[#4FB5A1] text-white rounded-lg"
              >
                {editingRole ? 'Actualizar' : 'Crear'} Rol
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="rounded-xl max-w-2xl border-gray-200 shadow-lg max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Permisos del Rol</DialogTitle>
          </DialogHeader>
          {viewingRole && (
            <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg flex-shrink-0">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#A78BFA] to-[#8B5CF6] flex items-center justify-center shadow-sm">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-gray-900">{viewingRole.name}</h3>
                  <p className="text-sm text-gray-600">{viewingRole.description}</p>
                </div>
                <Badge
                  variant="outline"
                  className={`text-xs px-2 py-0.5 ${
                    viewingRole.isActive
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-gray-100 text-gray-600 border-gray-200'
                  }`}
                >
                  {viewingRole.isActive ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                <h4 className="text-gray-900 sticky top-0 bg-white pb-2 z-10">Lista de Permisos</h4>
                {Object.entries(groupedPermissions).map(([category, permissions]) => {
                  const categoryPermissions = permissions.filter(p =>
                    viewingRole.permissions.includes(p.id)
                  );
                  
                  if (categoryPermissions.length === 0) return null;

                  return (
                    <div key={category} className="space-y-2">
                      <h5 className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{category}</h5>
                      <div className="grid grid-cols-2 gap-2 pl-3">
                        {categoryPermissions.map((permission) => (
                          <div key={permission.id} className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                            <span className="text-sm text-gray-700">{permission.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between items-center pt-4 border-t flex-shrink-0">
                <p className="text-sm text-gray-600">
                  Total: {viewingRole.permissions.length} permisos asignados
                </p>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-[#F87171]" />
              ¿Eliminar Rol?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El rol será eliminado permanentemente del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-[#F87171] hover:bg-[#EF4444]"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

import { useState } from "react";
import { Card, CardContent } from "../../../shared/ui/card";
import { Input } from "../../../shared/ui/input";
import { Badge } from "../../../shared/ui/badge";
import { Plus, Pencil, Trash2, Search, Shield, Eye, Lock } from "lucide-react";
import { toast } from "sonner";
import { Role } from "../types";
import { useRoles } from "../hooks/useRoles";
import { groupPermissionsByCategory } from "../utils";
import { RoleFormDialog }   from "../components/RoleFormDialog";
import { RoleViewDialog }   from "../components/RoleViewDialog";
import { RoleDeleteDialog } from "../components/RoleDeleteDialog";

interface RolesModuleProps {
  userRole: "admin" | "employee" | "client";
}

export function RolesPage({ userRole }: RolesModuleProps) {
  const { roles, availablePermissions, loading, createRole, updateRole, deleteRole } = useRoles();

  const [searchTerm,       setSearchTerm]       = useState("");
  const [isDialogOpen,     setIsDialogOpen]     = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingRole,      setEditingRole]      = useState<Role | null>(null);
  const [viewingRole,      setViewingRole]      = useState<Role | null>(null);
  const [roleToDelete,     setRoleToDelete]     = useState<number | null>(null);

  const [formData, setFormData] = useState({
    nombre: "", descripcion: "", permisosIds: [] as number[],
  });

  const groupedPermissions = groupPermissionsByCategory(availablePermissions);

  const filteredRoles = roles.filter(r =>
    r.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingRole(null);
    setFormData({ nombre: "", descripcion: "", permisosIds: [] });
  };

  const handleSubmit = async () => {
  if (!formData.nombre || !formData.descripcion) {
    toast.error("Por favor completa todos los campos requeridos");
    return;
  }
  if (formData.permisosIds.length === 0) {
    toast.error("Debes asignar al menos un permiso al rol");
    return;
  }
  try {
    if (editingRole) {
      await updateRole(editingRole.id, formData);
    } else {
      await createRole(formData);
    }
    closeDialog();
  } catch (err: any) {
    toast.error(err.message ?? "Error al guardar el rol"); // ← ya muestra el mensaje del backend
  }
};

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setFormData({
      nombre:      role.nombre,
      descripcion: role.descripcion,
      permisosIds: role.permisos.map(p => Number(p.id)),
    });
    setIsDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!roleToDelete) return;
    try {
      await deleteRole(roleToDelete);
    } catch (err: any) {
      toast.error(err.message ?? "Error al eliminar el rol");
    } finally {
      setDeleteDialogOpen(false);
      setRoleToDelete(null);
    }
  };

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
            {roles.length} roles • {roles.filter(r => r.isActive).length} activos
          </p>
        </div>
        {userRole === "admin" && (
          <button
            onClick={() => { closeDialog(); setIsDialogOpen(true); }}
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
          <div className="flex-1 relative">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <Input
              placeholder="Buscar roles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-8 text-sm rounded-lg border-gray-200"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table Header */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-3 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-xs text-gray-600">
        <div className="col-span-3">Rol</div>
        <div className="col-span-4">Descripción</div>
        <div className="col-span-2">Permisos</div>
        <div className="col-span-3 text-right">Acciones</div>
      </div>

      {/* Roles List */}
      {loading ? (
        <p className="text-center text-sm text-gray-500 py-8">Cargando roles...</p>
      ) : (
        <div className="space-y-1">
          {filteredRoles.map((role) => (
            <div key={role.id} className="bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-all">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 lg:gap-3 p-2.5 lg:p-3 items-center">
                <div className="lg:col-span-3 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#A78BFA] to-[#8B5CF6] flex items-center justify-center text-white flex-shrink-0">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-900">{role.nombre}</p>
                    <Badge className={`text-xs px-1.5 py-0 h-4 ${role.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                      {role.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                </div>
                <div className="lg:col-span-4">
                  <p className="text-xs text-gray-700 line-clamp-2">{role.descripcion}</p>
                </div>
                <div className="lg:col-span-2 flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-gray-400" />
                  <Badge className="bg-purple-100 text-purple-700 text-xs px-1.5 py-0 h-4">
                    {role.permisos?.length ?? 0} permisos
                  </Badge>
                </div>
                <div className="lg:col-span-3 flex items-center justify-end gap-1">
                  {userRole === "admin" && (
                    <>
                      <button onClick={() => { setViewingRole(role); setIsViewDialogOpen(true); }} className="p-1 hover:bg-blue-50 rounded text-blue-600 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleEdit(role)} className="p-1 hover:bg-amber-50 rounded text-amber-600 transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => { setRoleToDelete(role.id); setDeleteDialogOpen(true); }} className="p-1 hover:bg-red-50 rounded text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
          {filteredRoles.length === 0 && (
            <Card className="border-gray-200 shadow-sm">
              <CardContent className="p-8 text-center">
                <Shield className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-900 mb-1">No se encontraron roles</p>
                <p className="text-sm text-gray-600">Intenta ajustar los filtros de búsqueda</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <RoleFormDialog
        open={isDialogOpen}
        onClose={closeDialog}
        onSubmit={handleSubmit}
        isEditing={!!editingRole}
        formData={formData}
        setFormData={setFormData}
        groupedPermissions={groupedPermissions}
      />
      <RoleViewDialog
        open={isViewDialogOpen}
        onClose={() => setIsViewDialogOpen(false)}
        role={viewingRole}
      />
      <RoleDeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
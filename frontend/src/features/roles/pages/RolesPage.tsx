import { Card, CardContent } from "../../../shared/ui/card";
import { Input } from "../../../shared/ui/input";
import { Badge } from "../../../shared/ui/badge";
import { Plus, Search, Shield, Users, Lock, Eye, Pencil, Trash2 } from "lucide-react";
import { RolesModuleProps } from "../types";
import { useRoles } from "../hooks/useRoles";
import { RoleFormDialog } from "../components/RoleFormDialog";
import { RoleViewDialog } from "../components/RoleViewDialog";
import { RoleDeleteDialog } from "../components/RoleDeleteDialog";

export function RolesPage({ userRole }: RolesModuleProps) {
  const {
    filteredRoles, activeRoles, roles,
    searchTerm, setSearchTerm,
    isDialogOpen, setIsDialogOpen,
    isViewDialogOpen, setIsViewDialogOpen,
    editingRole, viewingRole,
    deleteDialogOpen, setDeleteDialogOpen,
    formData, setFormData,
    handleCreateOrUpdate, handleDelete,
    confirmDelete, handleEdit, handleView,
    handlePermissionToggle, resetForm, handleNewClick,
  } = useRoles();

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
            {roles.length} roles • {activeRoles} activos
          </p>
        </div>
        {userRole === "admin" && (
          <button
            onClick={handleNewClick}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 bg-gradient-to-r from-[#A78BFA] to-[#9370DB] hover:from-[#9870E8] hover:to-[#8260CB] text-white text-sm shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Nuevo Rol
          </button>
        )}
      </div>

      {/* Búsqueda */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <Input
              placeholder="Buscar roles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-8 text-sm rounded-lg border-gray-200"
            />
          </div>
        </CardContent>
      </Card>

      {/* Header tabla Desktop */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-3 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-xs text-gray-600">
        <div className="col-span-3">Rol</div>
        <div className="col-span-4">Descripción</div>
        <div className="col-span-2">Permisos</div>
        <div className="col-span-3 text-right">Acciones</div>
      </div>

      {/* Lista */}
      <div className="space-y-1">
        {filteredRoles.map((role) => (
          <div key={role.id} className="bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-all">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 lg:gap-3 p-2.5 lg:p-3 items-start lg:items-center">
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

              <div className="lg:col-span-4 min-w-0">
                <p className="text-xs text-gray-700 line-clamp-2">{role.description}</p>
              </div>

              <div className="lg:col-span-2">
                <div className="flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-gray-400" />
                  <Badge className="bg-purple-100 text-purple-700 text-xs px-1.5 py-0 h-4">
                    {role.permissions.length} permisos
                  </Badge>
                </div>
              </div>

              <div className="lg:col-span-3 flex items-center justify-end gap-1">
                {userRole === "admin" && (
                  <>
                    <button onClick={() => handleView(role)} className="p-1 hover:bg-blue-50 rounded text-blue-600 transition-colors" title="Ver permisos">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleEdit(role)} className="p-1 hover:bg-amber-50 rounded text-amber-600 transition-colors" title="Editar">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => confirmDelete(role.id)} className="p-1 hover:bg-red-50 rounded text-red-600 transition-colors" title="Eliminar">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {filteredRoles.length === 0 && (
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-8 text-center">
            <Shield className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-900 mb-1">No se encontraron roles</p>
            <p className="text-sm text-gray-600">Intenta ajustar los filtros de búsqueda</p>
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <RoleFormDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingRole={editingRole}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleCreateOrUpdate}
        onCancel={resetForm}
        onPermissionToggle={handlePermissionToggle}
      />
      <RoleViewDialog
        isOpen={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        role={viewingRole}
      />
      <RoleDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
      />
    </div>
  );
}
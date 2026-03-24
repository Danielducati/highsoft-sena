import { Card, CardContent } from "../../../shared/ui/card";
import { Input } from "../../../shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/ui/select";
import { Plus, Search, Filter, Key } from "lucide-react";
import { AccessModuleProps } from "../types";
import { MODULES, ACTIONS } from "../constants";
import { usePermissions } from "../hooks/usePermissions";
import { PermissionRow } from "../components/PermissionRow";
import { PermissionFormDialog } from "../components/PermissionFormDialog";
import { PermissionViewDialog } from "../components/PermissionViewDialog";

export function AccessPage({ userRole }: AccessModuleProps) {
  const {
    filteredPermissions,
    permissions,
    searchTerm,
    setSearchTerm,
    filterModule,
    setFilterModule,
    filterAction,
    setFilterAction,
    isDialogOpen,
    setIsDialogOpen,
    isViewDialogOpen,
    setIsViewDialogOpen,
    editingPermission,
    viewingPermission,
    formData,
    setFormData,
    handleCreateOrUpdate,
    handleDelete,
    handleEdit,
    handleToggleStatus,
    handleViewPermission,
    handleNewPermission,
    resetForm,
  } = usePermissions();

  const activePermissions = permissions.filter((p) => p.isActive).length;

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
            {permissions.length} permisos • {activePermissions} activos
          </p>
        </div>
        {userRole === "admin" && (
          <button
            onClick={handleNewPermission}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 bg-gradient-to-r from-[#A78BFA] to-[#9370DB] hover:from-[#9870E8] hover:to-[#8260CB] text-white text-sm shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Nuevo Permiso
          </button>
        )}
      </div>

      {/* Filtros */}
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
                  {MODULES.map((module) => (
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
                  {ACTIONS.map((action) => (
                    <SelectItem key={action} value={action}>{action}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cabecera tabla */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-3 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-xs text-gray-600">
        <div className="col-span-3">Permiso</div>
        <div className="col-span-3">Descripción</div>
        <div className="col-span-2">Módulo</div>
        <div className="col-span-1">Estado</div>
        <div className="col-span-3 text-right">Acciones</div>
      </div>

      {/* Lista */}
      <div className="space-y-1">
        {filteredPermissions.map((permission) => (
          <PermissionRow
            key={permission.id}
            permission={permission}
            userRole={userRole}
            onView={handleViewPermission}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
          />
        ))}
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

      {/* Dialogs */}
      <PermissionFormDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingPermission={editingPermission}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleCreateOrUpdate}
        onCancel={resetForm}
      />

      <PermissionViewDialog
        isOpen={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        permission={viewingPermission}
      />
    </div>
  );
}

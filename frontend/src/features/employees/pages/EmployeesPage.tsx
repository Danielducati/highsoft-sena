import { Card, CardContent } from "../../../shared/ui/card";
import { Button } from "../../../shared/ui/button";
import { Input } from "../../../shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/ui/select";
import { Badge } from "../../../shared/ui/badge";
import { Switch } from "../../../shared/ui/switch";
import { Plus, Search, Filter, Users, Briefcase, Eye, Pencil, Trash2 } from "lucide-react";
import { EmployeesModuleProps } from "../types";
import { ITEMS_PER_PAGE } from "../constants";
import { useEmployees } from "../hooks/useEmployees";
import { EmployeeFormDialog } from "../components/EmployeeFormDialog";
import { EmployeeViewDialog } from "../components/EmployeeViewDialog";
import { EmployeeDeleteDialog } from "../components/EmployeeDeleteDialog";
import { ImageWithFallback } from "../../guidelines/figma/ImageWithFallback";

export function EmployeesPage({ userRole }: EmployeesModuleProps) {
  const {
    employees, loading, saving,
    searchTerm, setSearchTerm,
    filterSpecialty, setFilterSpecialty,
    filterStatus, setFilterStatus,
    isDialogOpen, setIsDialogOpen,
    viewingEmployee, setViewingEmployee,
    editingEmployee,
    deleteDialogOpen, setDeleteDialogOpen,
    formData, setFormData,
    imagePreview, setImagePreview,
    currentPage, setCurrentPage, totalPages,
    filteredEmployees, paginatedEmployees,
    specialties, activeEmployees,
    handleCreateOrUpdate, handleToggleStatus,
    handleDelete, handleEdit,
    confirmDelete, resetForm,
  } = useEmployees();

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
        {userRole === "admin" && (
          <button
            onClick={() => { resetForm(); setIsDialogOpen(true); }}
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
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <Input placeholder="Buscar empleados..." value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="pl-8 h-8 text-sm rounded-lg border-gray-200" />
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

      {/* Header tabla - Desktop */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-3 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-xs text-gray-600">
        <div className="col-span-4">Nombre</div>
        <div className="col-span-3">Especialidad</div>
        <div className="col-span-2">Contacto</div>
        <div className="col-span-1">Estado</div>
        <div className="col-span-2 text-right">Acciones</div>
      </div>

      {/* Lista */}
      {loading ? (
        <p className="text-center text-gray-500 py-8">Cargando empleados...</p>
      ) : (
        <div className="space-y-1">
          {paginatedEmployees.map((employee) => (
            <div key={employee.id} className="bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-all">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 lg:gap-3 p-2.5 lg:p-3 items-center">
                <div className="lg:col-span-4 flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-[#78D1BD] to-[#5FBFAA] flex items-center justify-center text-white text-sm flex-shrink-0">
                    {employee.image
                      ? <ImageWithFallback src={employee.image} alt={employee.name} className="w-full h-full object-cover" />
                      : employee.name.charAt(0)}
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
                  {userRole === "admin" ? (
                    <Switch checked={employee.isActive} onCheckedChange={() => handleToggleStatus(employee)} className="scale-75" />
                  ) : (
                    <Badge className={employee.isActive ? "bg-green-100 text-green-700 text-xs" : "bg-gray-100 text-gray-600 text-xs"}>
                      {employee.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  )}
                </div>

                <div className="lg:col-span-2 flex items-center justify-end gap-1">
                  {userRole === "admin" && (
                    <>
                      <button onClick={() => setViewingEmployee(employee)} className="p-1 hover:bg-blue-50 rounded text-blue-600 transition-colors" title="Ver detalles">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleEdit(employee)} className="p-1 hover:bg-amber-50 rounded text-amber-600 transition-colors" title="Editar">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => confirmDelete(employee.id)} className="p-1 hover:bg-red-50 rounded text-red-600 transition-colors" title="Eliminar">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
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
                Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredEmployees.length)} de {filteredEmployees.length}
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

      {/* Dialogs */}
      <EmployeeFormDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingEmployee={editingEmployee}
        formData={formData}
        setFormData={setFormData}
        imagePreview={imagePreview}
        setImagePreview={setImagePreview}
        saving={saving}
        onSubmit={handleCreateOrUpdate}
        onCancel={resetForm}
      />
      <EmployeeViewDialog employee={viewingEmployee} onClose={() => setViewingEmployee(null)} />
      <EmployeeDeleteDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onConfirm={handleDelete} />
    </div>
  );
}
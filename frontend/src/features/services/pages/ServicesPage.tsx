import { Card, CardContent } from "../../../shared/ui/card";
import { Button } from "../../../shared/ui/button";
import { Input } from "../../../shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/ui/select";
import { Badge } from "../../../shared/ui/badge";
import { Switch } from "../../../shared/ui/switch";
import { Search, DollarSign, Clock, AlertCircle, Eye, Pencil, Trash2 } from "lucide-react";
import { ServicesModuleProps } from "../types";
import { ITEMS_PER_PAGE } from "../constants";
import { useServices } from "../hooks/useServices";
import { ServiceFormDialog } from "../components/ServiceFormDialog";
import { ServiceViewDialog } from "../components/ServiceViewDialog";
import { ServiceDeleteDialog } from "../components/ServiceDeleteDialog";

export function ServicesPage({ userRole }: ServicesModuleProps) {
  const {
    categories, loading,
    searchTerm, setSearchTerm,
    filterCategory, setFilterCategory,
    filterStatus, setFilterStatus,
    isDialogOpen, setIsDialogOpen,
    editingService, viewingService, setViewingService,
    deleteDialogOpen, setDeleteDialogOpen,
    formData, setFormData,
    imagePreview, fileInputRef,
    currentPage, setCurrentPage,
    filteredServices, paginatedServices, totalPages, startIndex, endIndex,
    handleCreateOrUpdate, handleDelete, handleToggleStatus,
    confirmDelete, handleEdit, handleCloseDialog,
    handleImageSelect, clearImage,
  } = useServices();

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-gray-900">Gestión de Servicios</h1>
          <p className="text-gray-600">Administra el catálogo completo de servicios del spa</p>
        </div>
        <ServiceFormDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          editingService={editingService}
          formData={formData}
          setFormData={setFormData}
          imagePreview={imagePreview}
          fileInputRef={fileInputRef as React.RefObject<HTMLInputElement>}
          categories={categories}
          onSubmit={handleCreateOrUpdate}
          onCancel={handleCloseDialog}
          onNewClick={handleCloseDialog}
          onImageSelect={handleImageSelect}
          onClearImage={clearImage}
          userRole={userRole}
        />
      </div>

      {/* Filtros */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar servicios..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="pl-10 rounded-lg border-gray-200"
              />
            </div>
            <Select value={filterCategory} onValueChange={(v) => { setFilterCategory(v); setCurrentPage(1); }}>
              <SelectTrigger className="rounded-lg border-gray-200"><SelectValue placeholder="Todas las categorías" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.Nombre}>{cat.Nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v); setCurrentPage(1); }}>
              <SelectTrigger className="rounded-lg border-gray-200"><SelectValue placeholder="Estado" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="inactive">Inactivos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista */}
      {loading ? (
        <p className="text-center text-gray-500 py-8">Cargando servicios...</p>
      ) : filteredServices.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-16 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-gray-900 mb-2">No se encontraron servicios</h3>
          <p className="text-sm text-gray-600">
            {searchTerm ? "Intenta con otros términos de búsqueda" : "Comienza agregando tu primer servicio"}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {/* Header Desktop */}
          <div className="hidden lg:grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200 text-sm text-gray-600">
            <div className="col-span-4">Nombre</div>
            <div className="col-span-2">Precio</div>
            <div className="col-span-2">Duración</div>
            <div className="col-span-3">Estado</div>
            <div className="col-span-1 text-right">Acciones</div>
          </div>

          <div className="divide-y divide-gray-100">
            {paginatedServices.map((service) => (
              <div key={service.id} className="px-4 py-3 hover:bg-gray-50 transition-colors group">
                {/* Desktop */}
                <div className="hidden lg:grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-4 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#78D1BD] flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm text-gray-900 truncate">{service.name}</p>
                      <Badge variant="outline" className="text-xs mt-0.5 border-[#78D1BD]/30">{service.category}</Badge>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="flex items-center gap-1 text-sm text-gray-900">
                      <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                      <span>{service.price}</span>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="flex items-center gap-1 text-sm text-gray-700">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span>{service.duration}m</span>
                    </div>
                  </div>
                  <div className="col-span-3">
                    {userRole === "admin" ? (
                      <div className="flex items-center gap-2">
                        <Switch checked={service.isActive} onCheckedChange={() => handleToggleStatus(service)} />
                        <span className="text-xs text-gray-600">{service.isActive ? "Activo" : "Inactivo"}</span>
                      </div>
                    ) : (
                      <Badge className={service.isActive ? "bg-[#78D1BD] text-white" : "bg-gray-500 text-white"}>
                        {service.isActive ? "Activo" : "Inactivo"}
                      </Badge>
                    )}
                  </div>
                  {userRole === "admin" && (
                    <div className="col-span-1">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setViewingService(service)} className="h-8 w-8 hover:bg-[#78D1BD]/10 hover:text-[#78D1BD]"><Eye className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(service)} className="h-8 w-8 hover:bg-[#60A5FA]/10 hover:text-[#60A5FA]"><Pencil className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => confirmDelete(service.id)} className="h-8 w-8 hover:bg-[#F87171]/10 hover:text-[#F87171]"><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Mobile */}
                <div className="lg:hidden space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#78D1BD] flex-shrink-0" />
                        <p className="text-sm text-gray-900">{service.name}</p>
                      </div>
                      <Badge variant="outline" className="text-xs mt-1 border-[#78D1BD]/30">{service.category}</Badge>
                    </div>
                    {userRole === "admin" && (
                      <div className="flex gap-1 flex-shrink-0 ml-2">
                        <Button variant="ghost" size="icon" onClick={() => setViewingService(service)} className="h-8 w-8"><Eye className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(service)} className="h-8 w-8"><Pencil className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => confirmDelete(service.id)} className="h-8 w-8"><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-gray-700"><DollarSign className="w-3 h-3 text-gray-400" /><span>{service.price}</span></div>
                      <div className="flex items-center gap-1 text-gray-700"><Clock className="w-3 h-3 text-gray-400" /><span>{service.duration}m</span></div>
                    </div>
                    <Badge className={service.isActive ? "bg-[#78D1BD] text-white text-xs" : "bg-gray-500 text-white text-xs"}>
                      {service.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-3 py-2 bg-white border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-600">
            Mostrando {startIndex + 1}-{Math.min(endIndex, filteredServices.length)} de {filteredServices.length}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-8 text-sm">Anterior</Button>
            <span className="text-sm text-gray-600">Página {currentPage} de {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="h-8 text-sm">Siguiente</Button>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <ServiceViewDialog service={viewingService} onClose={() => setViewingService(null)} />
      <ServiceDeleteDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onConfirm={handleDelete} />
    </div>
  );
}
import { Card, CardContent } from "../../../shared/ui/card";
import { Button } from "../../../shared/ui/button";
import { Input } from "../../../shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/ui/select";
import { Switch } from "../../../shared/ui/switch";
import { User, Mail, Phone, Search, Filter, ShoppingBag, Eye, Edit, Trash2 } from "lucide-react";
import { ClientsModuleProps } from "../types";
import { ITEMS_PER_PAGE } from "../constants";
import { useClients } from "../hooks/useClients";
import { ClientFormDialog } from "../components/ClientFormDialog";
import { ClientViewDialog } from "../components/ClientViewDialog";
import { ClientDeleteDialog } from "../components/ClientDeleteDialog";

export function ClientsPage({ userRole }: ClientsModuleProps) {
  const {
    clients, filteredClients, paginatedClients,
    searchTerm, handleSearchChange,
    filterStatus, handleFilterChange,
    isDialogOpen, setIsDialogOpen,
    editingClient, viewingClient, setViewingClient,
    deleteDialogOpen, setDeleteDialogOpen,
    formData, setFormData,
    imagePreview, setImagePreview,
    currentPage, setCurrentPage, totalPages,
    handleCreateOrUpdate, handleDelete,
    handleEdit, handleToggleStatus,
    confirmDelete, resetForm, handleNewClick,
  } = useClients();

  const activeClients = clients.filter(c => c.isActive).length;

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-[#60A5FA]" />
            <h1 className="text-gray-900">Gestión de Clientes</h1>
          </div>
          <p className="text-sm text-gray-600 mt-0.5">
            {clients.length} clientes • {activeClients} activos
          </p>
        </div>
        <ClientFormDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          editingClient={editingClient}
          formData={formData}
          setFormData={setFormData}
          imagePreview={imagePreview}
          setImagePreview={setImagePreview}
          onSubmit={handleCreateOrUpdate}
          onCancel={resetForm}
          onNewClick={handleNewClick}
        />
      </div>

      {/* Filtros */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <Input
                placeholder="Buscar por nombre, email o teléfono..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-8 h-8 text-sm rounded-lg border-gray-200"
              />
            </div>
            <div className="flex gap-2 items-center">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <Select value={filterStatus} onValueChange={handleFilterChange}>
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
        <div className="col-span-3">Nombre</div>
        <div className="col-span-3">Contacto</div>
        <div className="col-span-2">Servicios</div>
        <div className="col-span-1">Estado</div>
        <div className="col-span-3 text-right">Acciones</div>
      </div>

      {/* Lista */}
      <div className="space-y-1">
        {paginatedClients.map((client) => (
          <div key={client.id} className="bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-all">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 lg:gap-3 p-2.5 lg:p-3 items-start lg:items-center">
              <div className="lg:col-span-3 flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#78D1BD] to-[#5FBFAA] flex items-center justify-center text-white text-sm flex-shrink-0">
                  {client.name.charAt(0)}
                </div>
                <p className="text-sm text-gray-900 truncate">{client.name}</p>
              </div>

              <div className="lg:col-span-3 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Mail className="w-3 h-3 text-gray-400 flex-shrink-0" />
                  <span className="text-xs text-gray-700 truncate">{client.email}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-gray-400 flex-shrink-0" />
                  <span className="text-xs text-gray-700">{client.phone}</span>
                </div>
              </div>

              <div className="lg:col-span-2">
                <div className="flex items-center gap-1.5">
                  <ShoppingBag className="w-3 h-3 text-gray-400" />
                  <span className="text-sm text-gray-900">{client.totalVisits} Servicios</span>
                </div>
              </div>

              <div className="lg:col-span-1">
                {userRole === "admin" && (
                  <Switch checked={client.isActive} onCheckedChange={() => handleToggleStatus(client.id)} className="scale-75" />
                )}
              </div>

              <div className="lg:col-span-3 flex items-center justify-end gap-1">
                {userRole === "admin" && (
                  <>
                    <button onClick={() => setViewingClient(client)} className="p-1 hover:bg-blue-50 rounded text-blue-600 transition-colors" title="Ver detalles">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleEdit(client)} className="p-1 hover:bg-amber-50 rounded text-amber-600 transition-colors" title="Editar">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => confirmDelete(client.id)} className="p-1 hover:bg-red-50 rounded text-red-600 transition-colors" title="Eliminar">
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
      {filteredClients.length === 0 && (
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-8 text-center">
            <User className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-900 mb-1">No se encontraron clientes</p>
            <p className="text-sm text-gray-600">Intenta ajustar los filtros de búsqueda</p>
          </CardContent>
        </Card>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-3">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
              <p className="text-sm text-gray-600">
                Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredClients.length)} de {filteredClients.length} clientes
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="rounded-lg border-gray-200 disabled:opacity-50">
                  Anterior
                </Button>
                <span className="text-sm text-gray-600 px-2">Página {currentPage} de {totalPages}</span>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="rounded-lg border-gray-200 disabled:opacity-50">
                  Siguiente
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <ClientViewDialog client={viewingClient} onClose={() => setViewingClient(null)} />
      <ClientDeleteDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onConfirm={handleDelete} />
    </div>
  );
}
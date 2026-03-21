import { Card, CardContent } from "../../../shared/ui/card";
import { Button } from "../../../shared/ui/button";
import { Input } from "../../../shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/ui/select";
import { Badge } from "../../../shared/ui/badge";
import { Search, Filter, FileText, User, DollarSign, Calendar, Eye, Edit, X } from "lucide-react";
import { QuotationsModuleProps } from "../types";
import { ITEMS_PER_PAGE, STATUS_COLORS, STATUS_LABELS, STATUS_OPTIONS } from "../constants";
import { useQuotations } from "../hooks/useQuotations";
import { QuotationFormDialog } from "../components/QuotationFormDialog";
import { QuotationViewDialog } from "../components/QuotationViewDialog";
import { QuotationCancelDialog } from "../components/QuotationCancelDialog";

export function QuotationsPage({ userRole }: QuotationsModuleProps) {
  const {
    loading,
    searchTerm, setSearchTerm,
    filterStatus, setFilterStatus,
    isDialogOpen, setIsDialogOpen,
    viewingQuotation, setViewingQuotation,
    editingQuotation,
    cancelDialogOpen, setCancelDialogOpen,
    formData, setFormData,
    clients, availableServices,
    currentPage, setCurrentPage, totalPages, startIndex,
    filteredQuotations, paginatedQuotations,
    totalAmount, pendingCount, approvedCount,
    handleCreate, handleStatusChange, handleCancel,
    confirmCancel, handleEdit, resetForm,
    addService, removeService, updateQuantity,
    calculateSubtotal, calculateTotal,
  } = useQuotations();

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#FBBF24]" />
            <h1 className="text-gray-900">Gestión de Cotizaciones</h1>
          </div>
          <p className="text-sm text-gray-600 mt-0.5">
            {pendingCount} pendientes • {approvedCount} aprobadas • ${totalAmount.toFixed(2)} total
          </p>
        </div>
        <QuotationFormDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          editingQuotation={editingQuotation}
          formData={formData}
          setFormData={setFormData}
          clients={clients}
          availableServices={availableServices}
          calculateSubtotal={calculateSubtotal}
          calculateTotal={calculateTotal}
          addService={addService}
          removeService={removeService}
          updateQuantity={updateQuantity}
          onSubmit={handleCreate}
          onCancel={resetForm}
          onNewClick={resetForm}
          userRole={userRole}
        />
      </div>

      {/* Filtros */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <Input placeholder="Buscar por cliente..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="pl-8 h-8 text-sm rounded-lg border-gray-200" />
            </div>
            <div className="flex gap-2 items-center">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v); setCurrentPage(1); }}>
                <SelectTrigger className="w-32 h-8 text-sm rounded-lg border-gray-200">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {STATUS_OPTIONS.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Header tabla Desktop */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-3 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-xs text-gray-600">
        <div className="col-span-3">Cliente</div>
        <div className="col-span-2">Servicios</div>
        <div className="col-span-2">Valor</div>
        <div className="col-span-2">Estado</div>
        <div className="col-span-2">Fecha</div>
        <div className="col-span-1 text-right">Acciones</div>
      </div>

      {/* Lista */}
      {loading ? (
        <p className="text-center text-gray-500 py-8">Cargando cotizaciones...</p>
      ) : (
        <div className="space-y-1">
          {paginatedQuotations.map((quotation) => (
            <div key={quotation.id} className="bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-all">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 lg:gap-3 p-2.5 lg:p-3 items-start lg:items-center">
                <div className="lg:col-span-3 flex items-center gap-2 min-w-0">
                  <User className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-900 truncate">{quotation.clientName}</p>
                    <p className="text-xs text-gray-500 truncate">{quotation.clientEmail}</p>
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs px-2 py-0 h-5">
                    {quotation.items?.length || 0} servicio{(quotation.items?.length || 0) !== 1 ? "s" : ""}
                  </Badge>
                </div>

                <div className="lg:col-span-2 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                  <div>
                    <span className="text-sm text-gray-900">${(quotation.total || 0).toFixed(2)}</span>
                    {quotation.discount > 0 && (
                      <p className="text-xs text-green-600">-${quotation.discount.toFixed(2)}</p>
                    )}
                  </div>
                </div>

                <div className="lg:col-span-2">
                  {userRole !== "client" ? (
                    <Select value={quotation.status} onValueChange={(v) => handleStatusChange(quotation.id, v as any)}>
                      <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map(({ value, label }) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge className={`${STATUS_COLORS[quotation.status]} text-xs px-2 py-0 h-5`}>
                      {STATUS_LABELS[quotation.status]}
                    </Badge>
                  )}
                </div>

                <div className="lg:col-span-2 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-sm text-gray-700">
                    {quotation.date
                      ? new Date(quotation.date).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" })
                      : "-"}
                  </span>
                </div>

                <div className="lg:col-span-1 flex items-center justify-end gap-1">
                  <button onClick={() => setViewingQuotation(quotation)} className="p-1 hover:bg-blue-50 rounded text-blue-600 transition-colors" title="Ver detalles">
                    <Eye className="w-4 h-4" />
                  </button>
                  {userRole !== "client" && (
                    <>
                      <button onClick={() => handleEdit(quotation)} className="p-1 hover:bg-amber-50 rounded text-amber-600 transition-colors" title="Editar">
                        <Edit className="w-4 h-4" />
                      </button>
                      {quotation.status !== "cancelled" && (
                        <button onClick={() => confirmCancel(quotation.id)} className="p-1 hover:bg-red-50 rounded text-red-600 transition-colors" title="Cancelar">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {filteredQuotations.length === 0 && !loading && (
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-8 text-center">
            <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-900 mb-1">No se encontraron cotizaciones</p>
            <p className="text-sm text-gray-600">Intenta ajustar los filtros de búsqueda</p>
          </CardContent>
        </Card>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-3 py-2 bg-white border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-600">
            Mostrando {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredQuotations.length)} de {filteredQuotations.length}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-8 text-sm">Anterior</Button>
            <span className="text-sm text-gray-600">Página {currentPage} de {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="h-8 text-sm">Siguiente</Button>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <QuotationViewDialog quotation={viewingQuotation} onClose={() => setViewingQuotation(null)} />
      <QuotationCancelDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen} onConfirm={handleCancel} />
    </div>
  );
}
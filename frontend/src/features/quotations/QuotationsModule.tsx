import { useState, useEffect } from "react";
import { Card, CardContent } from "../../shared/ui/card";
import { Button } from "../../shared/ui/button";
import { Input } from "../../shared/ui/input";
import { Label } from "../../shared/ui/label";
import { Textarea } from "../../shared/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../shared/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../shared/ui/select";
import { Badge } from "../../shared/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../shared/ui/alert-dialog";
import { Plus, Search, Filter, Eye, Edit, X, DollarSign, FileText, User, Calendar, ShoppingBag, AlertCircle, Clock } from "lucide-react";
import { toast } from "sonner";

const API_URL = "http://localhost:3001";

interface QuotationItem {
  serviceId: number;
  serviceName: string;
  price: number;
  quantity: number;
}

interface Quotation {
  FK_id_cliente: any;
  id: number;
  clientName: string;
  clientEmail: string;
  date: string;
  items: QuotationItem[];
  subtotal: number;
  discount: number;
  total: number;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'expired';
  notes: string;
  startTime?: string;
}

interface QuotationsModuleProps {
  userRole: 'admin' | 'employee' | 'client';
}

export function QuotationsModule({ userRole }: QuotationsModuleProps) {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [availableServices, setAvailableServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewingQuotation, setViewingQuotation] = useState<Quotation | null>(null);
  const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [quotationToCancel, setQuotationToCancel] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    clientId: "",
    date: new Date().toISOString().split('T')[0],
    startTime: "",
    notes: "",
    selectedServices: [] as QuotationItem[],
    discount: "0",
  });

  // ==========================================
  // CARGAR DATOS INICIALES
  // ==========================================
  useEffect(() => {
    fetchQuotations();
    fetchClients();
    fetchServices();
  }, []);

  const getToken = () => localStorage.getItem("token");

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/quotations`);
      if (!response.ok) throw new Error();
      const data = await response.json();
      setQuotations(data);
    } catch {
      toast.error("Error al cargar cotizaciones");
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await fetch(`${API_URL}/clients`);
      if (!response.ok) throw new Error();
      const data = await response.json();
      setClients(data);
    } catch {
      toast.error("Error al cargar clientes");
    }
  };

  const fetchServices = async () => {
    try {
      const response = await fetch(`${API_URL}/services`);
      if (!response.ok) throw new Error();
      const data = await response.json();
      setAvailableServices(data);
    } catch {
      toast.error("Error al cargar servicios");
    }
  };

  // ==========================================
  // CREAR O ACTUALIZAR COTIZACIÓN
  // ==========================================
  const handleCreate = async () => {
    if (!formData.clientId || formData.selectedServices.length === 0) {
      toast.error("Por favor selecciona un cliente y al menos un servicio");
      return;
    }

    const token = getToken();
    const servicios = formData.selectedServices.map(s => ({
      id_servicio: s.serviceId,
      precio: s.price,
      cantidad: s.quantity,
    }));

    try {
      if (editingQuotation) {
        const response = await fetch(`${API_URL}/quotations/${editingQuotation.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            id_cliente: parseInt(formData.clientId),
            fecha: formData.date,
            hora_inicio: formData.startTime || null,
            notas: formData.notes,
            descuento: parseFloat(formData.discount) || 0,
            servicios,
          }),
        });
        if (!response.ok) throw new Error();
        toast.success("Cotización actualizada exitosamente");
      } else {
        const response = await fetch(`${API_URL}/quotations`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            id_cliente: parseInt(formData.clientId),
            fecha: formData.date,
            hora_inicio: formData.startTime || null,
            notas: formData.notes,
            descuento: parseFloat(formData.discount) || 0,
            servicios,
          }),
        });
        if (!response.ok) throw new Error();
        toast.success("Cotización creada exitosamente");
      }

      await fetchQuotations();
      resetForm();
    } catch {
      toast.error("Error al guardar la cotización");
    }
  };

  // ==========================================
  // CAMBIAR ESTADO
  // ==========================================
  const handleStatusChange = async (id: number, newStatus: Quotation['status']) => {
    const token = getToken();
    try {
      const response = await fetch(`${API_URL}/quotations/${id}/estado`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ estado: newStatus }),
      });
      if (!response.ok) throw new Error();
      toast.success("Estado actualizado");
      await fetchQuotations();
    } catch {
      toast.error("Error al actualizar estado");
    }
  };

  // ==========================================
  // CANCELAR COTIZACIÓN
  // ==========================================
  const handleCancel = async () => {
    if (!quotationToCancel) return;
    await handleStatusChange(quotationToCancel, 'cancelled');
    setCancelDialogOpen(false);
    setQuotationToCancel(null);
  };

  const confirmCancel = (id: number) => {
    setQuotationToCancel(id);
    setCancelDialogOpen(true);
  };

  // ==========================================
  // SERVICIOS EN EL FORMULARIO
  // ==========================================
  const addService = (serviceId: number) => {
    const service = availableServices.find(s => s.id === serviceId);
    if (!service) return;

    const existingIndex = formData.selectedServices.findIndex(s => s.serviceId === serviceId);
    if (existingIndex >= 0) {
      const updated = [...formData.selectedServices];
      updated[existingIndex].quantity += 1;
      setFormData({ ...formData, selectedServices: updated });
      toast.success("Cantidad actualizada");
    } else {
      setFormData({
        ...formData,
        selectedServices: [...formData.selectedServices, {
          serviceId: service.id,
          serviceName: service.name,
          price: service.price,
          quantity: 1,
        }]
      });
      toast.success("Servicio agregado");
    }
  };

  const removeService = (serviceId: number) => {
    setFormData({
      ...formData,
      selectedServices: formData.selectedServices.filter(s => s.serviceId !== serviceId)
    });
  };

  const updateQuantity = (serviceId: number, quantity: number) => {
    setFormData({
      ...formData,
      selectedServices: formData.selectedServices.map(s =>
        s.serviceId === serviceId ? { ...s, quantity: Math.max(1, quantity) } : s
      )
    });
  };

  const calculateSubtotal = () =>
    formData.selectedServices.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = parseFloat(formData.discount) || 0;
    return subtotal - discount;
  };

  const handleEdit = (quotation: Quotation) => {
    setEditingQuotation(quotation);
    const client = clients.find(c => c.name === quotation.clientName);
    setFormData({
      clientId: client?.id?.toString() || quotation.FK_id_cliente?.toString() || "",
      date: quotation.date?.split('T')[0] || new Date().toISOString().split('T')[0],
      startTime: quotation.startTime || "",
      notes: quotation.notes || "",
      selectedServices: quotation.items || [],
      discount: quotation.discount?.toString() || "0",
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setIsDialogOpen(false);
    setEditingQuotation(null);
    setFormData({
      clientId: "",
      date: new Date().toISOString().split('T')[0],
      startTime: "",
      notes: "",
      selectedServices: [],
      discount: "0",
    });
  };

  const getStatusColor = (status: Quotation['status']) => {
    const colors = {
      pending: "bg-amber-100 text-amber-700",
      approved: "bg-emerald-100 text-emerald-700",
      rejected: "bg-red-100 text-red-700",
      cancelled: "bg-gray-100 text-gray-700",
      expired: "bg-gray-100 text-gray-700"
    };
    return colors[status];
  };

  const getStatusLabel = (status: Quotation['status']) => {
    const labels = {
      pending: "Pendiente",
      approved: "Aprobada",
      rejected: "Rechazada",
      cancelled: "Cancelada",
      expired: "Expirada"
    };
    return labels[status];
  };

  const filteredQuotations = quotations.filter(quotation => {
    const matchesSearch = quotation.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quotation.clientEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || quotation.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredQuotations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedQuotations = filteredQuotations.slice(startIndex, startIndex + itemsPerPage);
  const totalAmount = quotations.reduce((sum, q) => sum + (q.total || 0), 0);
  const pendingCount = quotations.filter(q => q.status === 'pending').length;
  const approvedCount = quotations.filter(q => q.status === 'approved').length;

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
        {userRole !== 'client' && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <button
                className="inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 bg-gradient-to-r from-[#A78BFA] to-[#9370DB] hover:from-[#9870E8] hover:to-[#8260CB] text-white text-sm shadow-sm transition-all"
                onClick={() => { setEditingQuotation(null); resetForm(); }}
              >
                <Plus className="w-3.5 h-3.5" />
                Nueva Cotización
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>{editingQuotation ? 'Editar Cotización' : 'Nueva Cotización'}</DialogTitle>
                <DialogDescription>
                  {editingQuotation ? 'Modifica los datos de la cotización' : 'Crea una cotización personalizada para el cliente'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">

                {/* Cliente */}
                <div className="space-y-2">
                  <Label>Cliente *</Label>
                  <Select value={formData.clientId} onValueChange={(val) => setFormData({ ...formData, clientId: val })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map(client => (
                        <SelectItem key={client.id || client.PK_id_cliente} value={(client.id || client.PK_id_cliente).toString()}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Fecha y Hora */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Fecha *</Label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Hora de Inicio</Label>
                    <Input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    />
                  </div>
                </div>

                {/* Servicios */}
                <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="text-gray-900">Servicios</h3>
                  <div className="space-y-2">
                    <Label>Agregar Servicio</Label>
                    <Select onValueChange={(value) => addService(parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar servicio" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableServices.map(service => (
                          <SelectItem key={service.id} value={service.id.toString()}>
                            {service.name} — ${service.price}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.selectedServices.length > 0 && (
                    <div className="space-y-2 mt-3">
                      <Label className="text-xs text-gray-600">Servicios Agregados</Label>
                      {formData.selectedServices.map((item) => (
                        <div key={item.serviceId} className="p-3 bg-white rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="text-sm text-gray-900">{item.serviceName}</p>
                              <p className="text-xs text-gray-500">${item.price} c/u</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                <Label className="text-xs text-gray-600">Cant:</Label>
                                <Input
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) => updateQuantity(item.serviceId, parseInt(e.target.value))}
                                  className="w-16 h-7 text-sm"
                                />
                              </div>
                              <span className="text-sm text-gray-900 w-20 text-right">${item.price * item.quantity}</span>
                              <Button variant="ghost" size="icon" onClick={() => removeService(item.serviceId)} className="h-7 w-7 text-red-600 hover:bg-red-50">
                                <X className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Descuento y Total */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Descuento ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.discount}
                      onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Total</Label>
                    <Input value={`$${calculateTotal().toFixed(2)}`} disabled className="text-lg" />
                  </div>
                </div>

                {/* Notas */}
                <div className="space-y-2">
                  <Label>Notas</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Notas adicionales..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button variant="outline" onClick={resetForm}>Cancelar</Button>
                  <Button
                    className="bg-gradient-to-r from-[#78D1BD] to-[#5FBFAA] hover:from-[#6BCAB7] hover:to-[#4FB5A1] text-white"
                    onClick={handleCreate}
                  >
                    {editingQuotation ? 'Guardar Cambios' : 'Crear Cotización'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filtros */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <Input
                placeholder="Buscar por cliente..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="pl-8 h-8 text-sm rounded-lg border-gray-200"
              />
            </div>
            <div className="flex gap-2 items-center">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v); setCurrentPage(1); }}>
                <SelectTrigger className="w-32 h-8 text-sm rounded-lg border-gray-200">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                  <SelectItem value="approved">Aprobadas</SelectItem>
                  <SelectItem value="rejected">Rechazadas</SelectItem>
                  <SelectItem value="cancelled">Canceladas</SelectItem>
                  <SelectItem value="expired">Expiradas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-3 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-xs text-gray-600">
        <div className="col-span-3">Cliente</div>
        <div className="col-span-2">Servicios</div>
        <div className="col-span-2">Valor</div>
        <div className="col-span-2">Estado</div>
        <div className="col-span-2">Fecha</div>
        <div className="col-span-1 text-right">Acciones</div>
      </div>

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
                    {quotation.items?.length || 0} servicio{(quotation.items?.length || 0) !== 1 ? 's' : ''}
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
                  {userRole !== 'client' ? (
                    <Select value={quotation.status} onValueChange={(value) => handleStatusChange(quotation.id, value as Quotation['status'])}>
                      <SelectTrigger className="h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pendiente</SelectItem>
                        <SelectItem value="approved">Aprobada</SelectItem>
                        <SelectItem value="rejected">Rechazada</SelectItem>
                        <SelectItem value="cancelled">Cancelada</SelectItem>
                        <SelectItem value="expired">Expirada</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge className={`${getStatusColor(quotation.status)} text-xs px-2 py-0 h-5`}>
                      {getStatusLabel(quotation.status)}
                    </Badge>
                  )}
                </div>
                <div className="lg:col-span-2 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-sm text-gray-700">
                    {quotation.date ? new Date(quotation.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'}
                  </span>
                </div>
                <div className="lg:col-span-1 flex items-center justify-end gap-1">
                  <button onClick={() => setViewingQuotation(quotation)} className="p-1 hover:bg-blue-50 rounded text-blue-600 transition-colors" title="Ver detalles">
                    <Eye className="w-4 h-4" />
                  </button>
                  {userRole !== 'client' && (
                    <>
                      <button onClick={() => handleEdit(quotation)} className="p-1 hover:bg-amber-50 rounded text-amber-600 transition-colors" title="Editar">
                        <Edit className="w-4 h-4" />
                      </button>
                      {quotation.status !== 'cancelled' && (
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
            Mostrando {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredQuotations.length)} de {filteredQuotations.length}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-8 text-sm">Anterior</Button>
            <span className="text-sm text-gray-600">Página {currentPage} de {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="h-8 text-sm">Siguiente</Button>
          </div>
        </div>
      )}

      {/* Ver Cotización */}
      {viewingQuotation && (
        <Dialog open={true} onOpenChange={() => setViewingQuotation(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Cotización #{viewingQuotation.id.toString().padStart(4, '0')}</DialogTitle>
              <DialogDescription>
                Fecha: {viewingQuotation.date ? new Date(viewingQuotation.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 pb-4 border-b">
                <div>
                  <p className="text-sm text-gray-500">Cliente</p>
                  <p className="text-gray-900">{viewingQuotation.clientName}</p>
                  <p className="text-sm text-gray-500">{viewingQuotation.clientEmail}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Estado</p>
                  <Badge className={getStatusColor(viewingQuotation.status)}>{getStatusLabel(viewingQuotation.status)}</Badge>
                </div>
              </div>
              <div>
                <h4 className="text-gray-900 mb-3">Servicios</h4>
                <div className="space-y-2">
                  {viewingQuotation.items?.map((item, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-gray-900">{item.serviceName}</p>
                          <p className="text-sm text-gray-500">Cantidad: {item.quantity}</p>
                        </div>
                        <span className="text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal:</span>
                  <span className="text-gray-900">${(viewingQuotation.subtotal || 0).toFixed(2)}</span>
                </div>
                {viewingQuotation.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Descuento:</span>
                    <span>-${viewingQuotation.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg pt-2 border-t">
                  <span className="text-gray-900">Total:</span>
                  <span className="text-gray-900">${(viewingQuotation.total || 0).toFixed(2)}</span>
                </div>
              </div>
              {viewingQuotation.notes && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Notas:</p>
                  <p className="text-gray-900">{viewingQuotation.notes}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Cancelar Cotización */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-[#F87171]" />
              ¿Cancelar Cotización?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción cambiará el estado de la cotización a "Cancelada".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Volver</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} className="bg-[#F87171] hover:bg-[#EF4444]">
              Cancelar Cotización
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

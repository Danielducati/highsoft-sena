import { useState, useEffect } from "react";
import { Card, CardContent } from "../../shared/ui/card";
import { Button } from "../../shared/ui/button";
import { Input } from "../../shared/ui/input";
import { Label } from "../../shared/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../shared/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../shared/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../shared/ui/tabs";
import { Badge } from "../../shared/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../shared/ui/alert-dialog";
import { Plus, Search, Filter, ShoppingCart, DollarSign, Calendar, User, Receipt, XCircle, CreditCard, Eye, AlertCircle, Mail, Phone, FileText, Briefcase, IdCard, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

const API_URL = "http://localhost:3001";

interface SaleItem {
  serviceId: number;
  serviceName: string;
  price: number;
  quantity: number;
}

interface Sale {
  id: number;
  Cliente: string;
  Servicio: string;
  Cantidad: number;
  Precio: number;
  Subtotal: number;
  metodo_pago: string;
  descuento: number;
  Total: number;
  Iva: number;
  Fecha: string;
  Estado: string;
}

interface Appointment {
  id: number;
  clientName: string;
  service: string;
  date: string;
  time: string;
  status: string;
  precio?: number;
  id_servicio?: number;
}

interface SalesModuleProps {
  userRole: 'admin' | 'employee' | 'client';
}

export function SalesModule({ userRole }: SalesModuleProps) {
  const [sales, setSales] = useState<Sale[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [availableServices, setAvailableServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterPayment, setFilterPayment] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [saleType, setSaleType] = useState<'appointment' | 'direct'>('direct');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const itemsPerPage = 5;

  const [formData, setFormData] = useState({
    appointmentId: null as number | null,
    clientName: "",
    apellido_cliente: "",
    telefono_cliente: "",
    selectedServices: [] as SaleItem[],
    discount: "0",
    paymentMethod: "Efectivo",
  });

  const getToken = () => localStorage.getItem("token");

  // ==========================================
  // CARGAR DATOS
  // ==========================================
  useEffect(() => {
    fetchSales();
    fetchAppointments();
    fetchServices();
  }, []);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/sales`);
      if (!response.ok) throw new Error();
      const data = await response.json();
      setSales(data);
    } catch {
      toast.error("Error al cargar ventas");
    } finally {
      setLoading(false);
    }
  };

const fetchAppointments = async () => {
  try {
    const response = await fetch(`${API_URL}/appointments`);
    if (!response.ok) throw new Error();
    const data = await response.json();

    // Solo citas Pendientes (no completadas ni canceladas)
    const activas = data.filter((a: any) => a.Estado === 'Pendiente');

    setAppointments(activas.map((a: any) => ({
      id: a.PK_id_cita,
      clientName: a.cliente_nombre || "Cliente",
      service: a.servicios?.[0]?.serviceName || "Servicio",
      date: a.Fecha,
      time: a.Horario,
      status: a.Estado,
      precio: a.servicios?.[0]?.price,
      id_servicio: a.servicios?.[0]?.serviceId,
    })));
  } catch {
    toast.error("Error al cargar citas");
  }
};

  const fetchServices = async () => {
    try {
      const response = await fetch(`${API_URL}/services`);
      if (!response.ok) throw new Error();
      const data = await response.json();
      setAvailableServices(data.filter((s: any) => s.estado === "Activo" || s.isActive));
    } catch {
      toast.error("Error al cargar servicios");
    }
  };

  // ==========================================
  // SELECCIONAR CITA
  // ==========================================
  const handleAppointmentSelect = (appointmentId: string) => {
    const appointment = appointments.find(a => a.id === parseInt(appointmentId));
    if (!appointment) return;

    const service = availableServices.find(s =>
      s.name === appointment.service ||
      appointment.service?.includes(s.name) ||
      s.name?.includes(appointment.service)
    );

    setFormData(prev => ({
      ...prev,
      appointmentId: appointment.id,
      clientName: appointment.clientName,
      selectedServices: service ? [{
        serviceId: service.id,
        serviceName: service.name,
        price: appointment.precio || service.price,
        quantity: 1
      }] : []
    }));

    toast.success(`Cita seleccionada: ${appointment.clientName}`);
  };

  // ==========================================
  // REGISTRAR VENTA
  // ==========================================
  const handleRegisterSale = async () => {
    if (saleType === 'appointment' && !formData.appointmentId) {
      toast.error("Debes seleccionar una cita");
      return;
    }
    if (saleType === 'direct' && !formData.clientName.trim()) {
      toast.error("El nombre del cliente es obligatorio");
      return;
    }
    if (saleType === 'direct' && formData.selectedServices.length === 0) {
      toast.error("Debes agregar al menos un servicio");
      return;
    }

    const token = getToken();
    setSaving(true);

    try {
      let body: any;

      if (saleType === 'appointment') {
        body = {
          tipo: "cita",
          id_cita: formData.appointmentId,
          metodo_pago: formData.paymentMethod,
          descuento: parseFloat(formData.discount) || 0,
          cantidad: formData.selectedServices[0]?.quantity || 1,
        };
      } else {
        body = {
          tipo: "directa",
          nombre_cliente: formData.clientName,
          apellido_cliente: formData.apellido_cliente || ".",
          telefono_cliente: formData.telefono_cliente || null,
          id_servicio: formData.selectedServices[0]?.serviceId,
          metodo_pago: formData.paymentMethod,
          descuento: parseFloat(formData.discount) || 0,
          cantidad: formData.selectedServices[0]?.quantity || 1,
        };
      }

      const response = await fetch(`${API_URL}/sales`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Error al registrar venta");
      }

      toast.success("Venta registrada exitosamente");
      await fetchSales();
      await fetchAppointments();
      resetForm();
    } catch (error: any) {
      toast.error(error.message || "Error al registrar venta");
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // SERVICIOS EN FORMULARIO
  // ==========================================
  const addService = (serviceId: number) => {
    const service = availableServices.find(s => s.id === serviceId);
    if (!service) return;

    const existingIndex = formData.selectedServices.findIndex(s => s.serviceId === serviceId);
    if (existingIndex >= 0) {
      const updated = [...formData.selectedServices];
      updated[existingIndex].quantity += 1;
      setFormData({ ...formData, selectedServices: updated });
    } else {
      setFormData({
        ...formData,
        selectedServices: [...formData.selectedServices, {
          serviceId: service.id,
          serviceName: service.name,
          price: service.price,
          quantity: 1
        }]
      });
    }
  };

  const updateQuantity = (serviceId: number, quantity: number) => {
    setFormData({
      ...formData,
      selectedServices: formData.selectedServices.map(s =>
        s.serviceId === serviceId ? { ...s, quantity: Math.max(1, quantity) } : s
      )
    });
  };

  const removeService = (serviceId: number) => {
    setFormData({
      ...formData,
      selectedServices: formData.selectedServices.filter(s => s.serviceId !== serviceId)
    });
  };

  const calculateSubtotal = () =>
    formData.selectedServices.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const calculateTotal = () => calculateSubtotal() - (parseFloat(formData.discount) || 0);

  const handleSaleTypeChange = (value: 'appointment' | 'direct') => {
    setSaleType(value);
    setFormData({ appointmentId: null, clientName: "", apellido_cliente: "", telefono_cliente: "", selectedServices: [], discount: "0", paymentMethod: "Efectivo" });
  };

  const resetForm = () => {
    setIsDialogOpen(false);
    setFormData({ appointmentId: null, clientName: "", apellido_cliente: "", telefono_cliente: "", selectedServices: [], discount: "0", paymentMethod: "Efectivo" });
    setSaleType('direct');
  };

  const handleCancelSale = () => {
    setDeleteDialogOpen(false);
    setSaleToDelete(null);
    toast.info("Función de anulación no implementada aún");
  };

  const filteredSales = sales.filter(sale => {
    const matchesSearch = (sale.Cliente || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPayment = filterPayment === "all" || sale.metodo_pago === filterPayment;
    return matchesSearch && matchesPayment;
  });

  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSales = filteredSales.slice(startIndex, startIndex + itemsPerPage);
  const totalRevenue = sales.reduce((sum, s) => sum + (s.Total || 0), 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-[#78D1BD]" />
            <h1 className="text-gray-900">Gestión de Ventas</h1>
          </div>
          <p className="text-sm text-gray-600 mt-0.5">
            {sales.length} ventas • ${totalRevenue.toFixed(2)} total
          </p>
        </div>
        {userRole !== 'client' && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <button className="inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 bg-gradient-to-r from-[#A78BFA] to-[#9370DB] hover:from-[#9870E8] hover:to-[#8260CB] text-white text-sm shadow-sm transition-all">
                <Plus className="w-3.5 h-3.5" />
                Registrar Venta
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh]">
              <DialogHeader>
                <DialogTitle>Registrar Nueva Venta</DialogTitle>
                <DialogDescription>Completa la información de la venta</DialogDescription>
              </DialogHeader>

              <Tabs value={saleType} onValueChange={(v) => handleSaleTypeChange(v as 'appointment' | 'direct')} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="direct">Venta Directa</TabsTrigger>
                  <TabsTrigger value="appointment">Desde Cita</TabsTrigger>
                </TabsList>

                {/* VENTA DIRECTA */}
                <TabsContent value="direct" className="space-y-4 max-h-[55vh] overflow-y-auto pr-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Nombre del Cliente *</Label>
                      <Input value={formData.clientName} onChange={(e) => setFormData({ ...formData, clientName: e.target.value })} placeholder="Nombre" />
                    </div>
                    <div className="space-y-2">
                      <Label>Apellido</Label>
                      <Input value={formData.apellido_cliente} onChange={(e) => setFormData({ ...formData, apellido_cliente: e.target.value })} placeholder="Apellido" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Teléfono</Label>
                    <Input value={formData.telefono_cliente} onChange={(e) => setFormData({ ...formData, telefono_cliente: e.target.value })} placeholder="+57 300 123 4567" />
                  </div>
                  <div className="space-y-2">
                    <Label>Agregar Servicio *</Label>
                    <Select onValueChange={(v) => addService(parseInt(v))}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar servicio" /></SelectTrigger>
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
                    <Card>
                      <CardContent className="p-3 space-y-2">
                        {formData.selectedServices.map((item) => (
                          <div key={item.serviceId} className="flex items-center justify-between text-sm">
                            <div className="flex-1">
                              <p className="text-gray-900">{item.serviceName}</p>
                              <p className="text-xs text-gray-500">${item.price} c/u</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Input type="number" min="1" value={item.quantity} onChange={(e) => updateQuantity(item.serviceId, parseInt(e.target.value))} className="w-16 h-7 text-sm" />
                              <span className="text-gray-900 w-16 text-right">${item.price * item.quantity}</span>
                              <button onClick={() => removeService(item.serviceId)} className="p-1 hover:bg-red-50 rounded text-red-600"><XCircle className="w-4 h-4" /></button>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Descuento ($)</Label>
                      <Input type="number" step="0.01" value={formData.discount} onChange={(e) => setFormData({ ...formData, discount: e.target.value })} placeholder="0.00" />
                    </div>
                    <div className="space-y-2">
                      <Label>Método de Pago *</Label>
                      <Select value={formData.paymentMethod} onValueChange={(v) => setFormData({ ...formData, paymentMethod: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Efectivo">Efectivo</SelectItem>
                          <SelectItem value="Tarjeta de Crédito">Tarjeta de Crédito</SelectItem>
                          <SelectItem value="Tarjeta de Débito">Tarjeta de Débito</SelectItem>
                          <SelectItem value="Transferencia">Transferencia</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Subtotal:</span>
                      <span>${calculateSubtotal().toFixed(2)}</span>
                    </div>
                    {parseFloat(formData.discount) > 0 && (
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Descuento:</span>
                        <span className="text-red-600">-${parseFloat(formData.discount).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-gray-200">
                      <span className="text-gray-900">Total:</span>
                      <span className="text-gray-900">${calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </TabsContent>

                {/* DESDE CITA */}
                <TabsContent value="appointment" className="space-y-4 max-h-[55vh] overflow-y-auto pr-2">
                  <div className="space-y-2">
                    <Label>Seleccionar Cita *</Label>
                    <Select value={formData.appointmentId?.toString() || ""} onValueChange={handleAppointmentSelect}>
                      <SelectTrigger><SelectValue placeholder="Buscar cita..." /></SelectTrigger>
                      <SelectContent>
                        {appointments.length === 0 ? (
                          <SelectItem value="none" disabled>No hay citas activas</SelectItem>
                        ) : (
                          appointments.map(appointment => (
                            <SelectItem key={appointment.id} value={appointment.id.toString()}>
                              <div className="flex flex-col py-1">
                                <span className="text-sm">{appointment.clientName} — {appointment.service}</span>
                                <span className="text-xs text-gray-500">{appointment.date ? new Date(appointment.date).toLocaleDateString('es-ES') : ""} {appointment.time}</span>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.appointmentId && formData.selectedServices.length > 0 && (
                    <Card>
                      <CardContent className="p-3 space-y-2">
                        {formData.selectedServices.map((item) => (
                          <div key={item.serviceId} className="flex items-center justify-between text-sm">
                            <span className="text-gray-900">{item.serviceName}</span>
                            <span className="text-gray-900">${item.price * item.quantity}</span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {formData.appointmentId && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Descuento ($)</Label>
                          <Input type="number" step="0.01" value={formData.discount} onChange={(e) => setFormData({ ...formData, discount: e.target.value })} placeholder="0.00" />
                        </div>
                        <div className="space-y-2">
                          <Label>Método de Pago *</Label>
                          <Select value={formData.paymentMethod} onValueChange={(v) => setFormData({ ...formData, paymentMethod: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Efectivo">Efectivo</SelectItem>
                              <SelectItem value="Tarjeta de Crédito">Tarjeta de Crédito</SelectItem>
                              <SelectItem value="Tarjeta de Débito">Tarjeta de Débito</SelectItem>
                              <SelectItem value="Transferencia">Transferencia</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between">
                          <span className="text-gray-900">Total estimado:</span>
                          <span className="text-gray-900">${calculateTotal().toFixed(2)}</span>
                        </div>
                      </div>
                    </>
                  )}
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={resetForm}>Cancelar</Button>
                <Button className="bg-gradient-to-r from-[#78D1BD] to-[#5FBFAA] hover:from-[#6BCAB7] hover:to-[#4FB5A1] text-white" onClick={handleRegisterSale} disabled={saving}>
                  {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Registrando...</> : "Registrar Venta"}
                </Button>
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
              <Input placeholder="Buscar por cliente..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="pl-8 h-8 text-sm rounded-lg border-gray-200" />
            </div>
            <div className="flex gap-2 items-center">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <Select value={filterPayment} onValueChange={(v) => { setFilterPayment(v); setCurrentPage(1); }}>
                <SelectTrigger className="w-36 h-8 text-sm rounded-lg border-gray-200"><SelectValue placeholder="Método pago" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Efectivo">Efectivo</SelectItem>
                  <SelectItem value="Tarjeta de Crédito">Tarjeta Crédito</SelectItem>
                  <SelectItem value="Tarjeta de Débito">Tarjeta Débito</SelectItem>
                  <SelectItem value="Transferencia">Transferencia</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-3 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-xs text-gray-600">
        <div className="col-span-2">Número</div>
        <div className="col-span-3">Cliente</div>
        <div className="col-span-2">Servicio</div>
        <div className="col-span-2">Total</div>
        <div className="col-span-2">Fecha</div>
        <div className="col-span-1 text-right">Acciones</div>
      </div>

      {loading ? (
        <p className="text-center text-gray-500 py-8">Cargando ventas...</p>
      ) : (
        <div className="space-y-1">
          {paginatedSales.map((sale, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-all">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 lg:gap-3 p-2.5 lg:p-3 items-center">
                <div className="lg:col-span-2 flex items-center gap-2">
                  <Receipt className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-sm text-gray-900">#{(index + 1).toString().padStart(4, '0')}</span>
                </div>
                <div className="lg:col-span-3 flex items-center gap-2 min-w-0">
                  <User className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-900 truncate">{sale.Cliente || "—"}</span>
                </div>
                <div className="lg:col-span-2">
                  <span className="text-xs text-gray-600 truncate">{sale.Servicio || "—"}</span>
                </div>
                <div className="lg:col-span-2 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                  <div>
                    <span className="text-sm text-gray-900">${(sale.Total || 0).toFixed(2)}</span>
                    {sale.descuento > 0 && <p className="text-xs text-green-600">-${sale.descuento.toFixed(2)}</p>}
                  </div>
                </div>
                <div className="lg:col-span-2 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-sm text-gray-700">
                    {sale.Fecha ? new Date(sale.Fecha).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : "—"}
                  </span>
                </div>
                <div className="lg:col-span-1 flex items-center justify-end gap-1">
                  <button onClick={() => { setSelectedSale(sale); setDetailDialogOpen(true); }} className="p-1 hover:bg-blue-50 rounded text-blue-600 transition-colors" title="Ver detalle">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredSales.length === 0 && !loading && (
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-8 text-center">
            <ShoppingCart className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-900 mb-1">No se encontraron ventas</p>
            <p className="text-sm text-gray-600">Intenta ajustar los filtros de búsqueda</p>
          </CardContent>
        </Card>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-3 py-2 bg-white border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-600">Mostrando {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredSales.length)} de {filteredSales.length}</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-8 text-sm">Anterior</Button>
            <span className="text-sm text-gray-600">Página {currentPage} de {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="h-8 text-sm">Siguiente</Button>
          </div>
        </div>
      )}

      {/* Detalle Venta */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalle de Venta</DialogTitle>
            <DialogDescription>Información completa de la transacción</DialogDescription>
          </DialogHeader>
          {selectedSale && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 pb-4 border-b">
                <div><p className="text-sm text-gray-500">Cliente</p><p className="text-gray-900">{selectedSale.Cliente || "—"}</p></div>
                <div><p className="text-sm text-gray-500">Servicio</p><p className="text-gray-900">{selectedSale.Servicio || "—"}</p></div>
                <div><p className="text-sm text-gray-500">Método de pago</p><p className="text-gray-900">{selectedSale.metodo_pago}</p></div>
                <div><p className="text-sm text-gray-500">Fecha</p><p className="text-gray-900">{selectedSale.Fecha ? new Date(selectedSale.Fecha).toLocaleDateString('es-ES') : "—"}</p></div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal:</span><span>${(selectedSale.Subtotal || 0).toFixed(2)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">IVA (19%):</span><span>${(selectedSale.Iva || 0).toFixed(2)}</span></div>
                {selectedSale.descuento > 0 && <div className="flex justify-between text-sm text-green-600"><span>Descuento:</span><span>-${selectedSale.descuento.toFixed(2)}</span></div>}
                <div className="flex justify-between pt-2 border-t"><span className="text-gray-900">Total:</span><span className="text-gray-900">${(selectedSale.Total || 0).toFixed(2)}</span></div>
              </div>
            </div>
          )}
          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>Cerrar</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Anular Venta */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2"><AlertCircle className="w-5 h-5 text-[#F87171]" />¿Anular Venta?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelSale} className="bg-[#F87171] hover:bg-[#EF4444]">Anular Venta</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
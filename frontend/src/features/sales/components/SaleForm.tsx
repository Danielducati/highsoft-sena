import { Input } from "../../../shared/ui/input";
import { Label } from "../../../shared/ui/label";
import { Button } from "../../../shared/ui/button";
import { Card, CardContent } from "../../../shared/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../shared/ui/tabs";
import { Loader2, XCircle } from "lucide-react";
import { Appointment, SaleFormData, SaleItem } from "../types";
import { PAYMENT_METHODS } from "../constants";
import { calcSubtotal, calcTotal } from "../utils";

interface SaleFormProps {
  formData:           SaleFormData;
  setFormData:        React.Dispatch<React.SetStateAction<SaleFormData>>;
  saleType:           "appointment" | "direct";
  onSaleTypeChange:   (v: "appointment" | "direct") => void;
  appointments:       Appointment[];
  availableServices:  any[];
  saving:             boolean;
  onSubmit:           () => void;
  onCancel:           () => void;
  onAppointmentSelect:(id: string) => void;
  onAddService:       (id: number) => void;
  onUpdateQuantity:   (id: number, qty: number) => void;
  onRemoveService:    (id: number) => void;
}

export function SaleForm({
  formData, setFormData, saleType, onSaleTypeChange,
  appointments, availableServices, saving,
  onSubmit, onCancel, onAppointmentSelect,
  onAddService, onUpdateQuantity, onRemoveService,
}: SaleFormProps) {
  return (
    <>
      <Tabs value={saleType} onValueChange={(v) => onSaleTypeChange(v as "appointment" | "direct")} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="direct">Venta Directa</TabsTrigger>
          <TabsTrigger value="appointment">Desde Cita</TabsTrigger>
        </TabsList>

        {/* VENTA DIRECTA */}
        <TabsContent value="direct" className="space-y-4 max-h-[55vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Nombre del Cliente *</Label>
              <Input value={formData.clientName}
                onChange={e => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                placeholder="Nombre" />
            </div>
            <div className="space-y-2">
              <Label>Apellido</Label>
              <Input value={formData.apellido_cliente}
                onChange={e => setFormData(prev => ({ ...prev, apellido_cliente: e.target.value }))}
                placeholder="Apellido" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Teléfono</Label>
            <Input value={formData.telefono_cliente}
              onChange={e => setFormData(prev => ({ ...prev, telefono_cliente: e.target.value }))}
              placeholder="+57 300 123 4567" />
          </div>
          <div className="space-y-2">
            <Label>Agregar Servicio *</Label>
            <Select onValueChange={v => onAddService(parseInt(v))}>
              <SelectTrigger><SelectValue placeholder="Seleccionar servicio" /></SelectTrigger>
              <SelectContent>
                {availableServices.map(s => (
                  <SelectItem key={s.id} value={s.id.toString()}>
                    {s.name} — ${s.price}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <ServiceList items={formData.selectedServices} onUpdateQuantity={onUpdateQuantity} onRemove={onRemoveService} />
          <PaymentFields formData={formData} setFormData={setFormData} />
          <Totals items={formData.selectedServices} discount={formData.discount} />
        </TabsContent>

        {/* DESDE CITA */}
        <TabsContent value="appointment" className="space-y-4 max-h-[55vh] overflow-y-auto pr-2">
          <div className="space-y-2">
            <Label>Seleccionar Cita *</Label>
            <Select value={formData.appointmentId?.toString() || ""} onValueChange={onAppointmentSelect}>
              <SelectTrigger><SelectValue placeholder="Buscar cita..." /></SelectTrigger>
              <SelectContent>
                {appointments.length === 0 ? (
                  <SelectItem value="none" disabled>No hay citas activas</SelectItem>
                ) : appointments.map(a => (
                  <SelectItem key={a.id} value={a.id.toString()}>
                    <div className="flex flex-col py-1">
                      <span className="text-sm">{a.clientName} — {a.service}</span>
                      <span className="text-xs text-gray-500">
                        {a.date ? new Date(a.date).toLocaleDateString("es-ES") : ""} {a.time}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {formData.appointmentId && formData.selectedServices.length > 0 && (
            <Card>
              <CardContent className="p-3 space-y-2">
                {formData.selectedServices.map(item => (
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
              <PaymentFields formData={formData} setFormData={setFormData} />
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-gray-900">Total estimado:</span>
                  <span className="text-gray-900">${calcTotal(formData.selectedServices, formData.discount).toFixed(2)}</span>
                </div>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button
          className="bg-gradient-to-r from-[#78D1BD] to-[#5FBFAA] hover:from-[#6BCAB7] hover:to-[#4FB5A1] text-white"
          onClick={onSubmit}
          disabled={saving}
        >
          {saving
            ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Registrando...</>
            : "Registrar Venta"}
        </Button>
      </div>
    </>
  );
}

// ─── Sub-componentes internos ──────────────────────────────────────────────

function ServiceList({ items, onUpdateQuantity, onRemove }: {
  items:            SaleItem[];
  onUpdateQuantity: (id: number, qty: number) => void;
  onRemove:         (id: number) => void;
}) {
  if (items.length === 0) return null;
  return (
    <Card>
      <CardContent className="p-3 space-y-2">
        {items.map(item => (
          <div key={item.serviceId} className="flex items-center justify-between text-sm">
            <div className="flex-1">
              <p className="text-gray-900">{item.serviceName}</p>
              <p className="text-xs text-gray-500">${item.price} c/u</p>
            </div>
            <div className="flex items-center gap-2">
              <Input type="number" min="1" value={item.quantity}
                onChange={e => onUpdateQuantity(item.serviceId, parseInt(e.target.value))}
                className="w-16 h-7 text-sm" />
              <span className="text-gray-900 w-16 text-right">${item.price * item.quantity}</span>
              <button onClick={() => onRemove(item.serviceId)} className="p-1 hover:bg-red-50 rounded text-red-600">
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function PaymentFields({ formData, setFormData }: {
  formData:    SaleFormData;
  setFormData: React.Dispatch<React.SetStateAction<SaleFormData>>;
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>Descuento ($)</Label>
        <Input type="number" step="0.01" value={formData.discount}
          onChange={e => setFormData(prev => ({ ...prev, discount: e.target.value }))}
          placeholder="0.00" />
      </div>
      <div className="space-y-2">
        <Label>Método de Pago *</Label>
        <Select value={formData.paymentMethod}
          onValueChange={v => setFormData(prev => ({ ...prev, paymentMethod: v }))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {PAYMENT_METHODS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function Totals({ items, discount }: { items: SaleItem[]; discount: string }) {
  const subtotal = calcSubtotal(items);
  const desc     = parseFloat(discount) || 0;
  return (
    <div className="p-3 bg-gray-50 rounded-lg">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">Subtotal:</span>
        <span>${subtotal.toFixed(2)}</span>
      </div>
      {desc > 0 && (
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">Descuento:</span>
          <span className="text-red-600">-${desc.toFixed(2)}</span>
        </div>
      )}
      <div className="flex justify-between pt-2 border-t border-gray-200">
        <span className="text-gray-900">Total:</span>
        <span className="text-gray-900">${calcTotal(items, discount).toFixed(2)}</span>
      </div>
    </div>
  );
}

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../../shared/ui/dialog";
import { Button } from "../../../shared/ui/button";
import { Input } from "../../../shared/ui/input";
import { Label } from "../../../shared/ui/label";
import { Textarea } from "../../../shared/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/ui/select";
import { Plus, X } from "lucide-react";
import { Quotation, QuotationFormData } from "../types";

interface QuotationFormDialogProps {
  isOpen: boolean;
  onOpenChange: (v: boolean) => void;
  editingQuotation: Quotation | null;
  formData: QuotationFormData;
  setFormData: (d: QuotationFormData) => void;
  clients: any[];
  availableServices: any[];
  calculateSubtotal: () => number;
  calculateTotal: () => number;
  addService: (id: number) => void;
  removeService: (id: number) => void;
  updateQuantity: (id: number, qty: number) => void;
  onSubmit: () => void;
  onCancel: () => void;
  onNewClick: () => void;
  userRole: string;
}

export function QuotationFormDialog({
  isOpen, onOpenChange, editingQuotation, formData, setFormData,
  clients, availableServices, calculateSubtotal, calculateTotal,
  addService, removeService, updateQuantity,
  onSubmit, onCancel, onNewClick, userRole,
}: QuotationFormDialogProps) {
  if (userRole === "client") return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <button
          className="inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 bg-gradient-to-r from-[#A78BFA] to-[#9370DB] hover:from-[#9870E8] hover:to-[#8260CB] text-white text-sm shadow-sm transition-all"
          onClick={onNewClick}
        >
          <Plus className="w-3.5 h-3.5" />
          Nueva Cotización
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{editingQuotation ? "Editar Cotización" : "Nueva Cotización"}</DialogTitle>
          <DialogDescription>
            {editingQuotation ? "Modifica los datos de la cotización" : "Crea una cotización personalizada para el cliente"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {/* Cliente */}
          <div className="space-y-2">
            <Label>Cliente *</Label>
            <Select value={formData.clientId} onValueChange={(v) => setFormData({ ...formData, clientId: v })}>
              <SelectTrigger><SelectValue placeholder="Selecciona un cliente" /></SelectTrigger>
              <SelectContent>
                {clients.filter(c => c.id != null).map(c => (
                  <SelectItem key={c.id} value={c.id.toString()}>
                    {c.nombre} {c.apellido}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fecha y Hora */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fecha *</Label>
              <Input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Hora de Inicio</Label>
              <Input type="time" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} />
            </div>
          </div>

          {/* Servicios */}
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-gray-900">Servicios</h3>
            <div className="space-y-2">
              <Label>Agregar Servicio</Label>
              <Select onValueChange={(v) => addService(parseInt(v))}>
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
                            type="number" min="1" value={item.quantity}
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
              <Input type="number" step="0.01" value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: e.target.value })} placeholder="0.00" />
            </div>
            <div className="space-y-2">
              <Label>Total</Label>
              <Input value={`$${calculateTotal().toFixed(2)}`} disabled className="text-lg" />
            </div>
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <Label>Notas</Label>
            <Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Notas adicionales..." rows={3} />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onCancel}>Cancelar</Button>
            <Button onClick={onSubmit} className="bg-gradient-to-r from-[#78D1BD] to-[#5FBFAA] hover:from-[#6BCAB7] hover:to-[#4FB5A1] text-white">
              {editingQuotation ? "Guardar Cambios" : "Crear Cotización"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
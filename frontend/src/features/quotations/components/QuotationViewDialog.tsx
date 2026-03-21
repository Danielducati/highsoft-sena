import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../../shared/ui/dialog";
import { Badge } from "../../../shared/ui/badge";
import { Quotation } from "../types";
import { STATUS_COLORS, STATUS_LABELS } from "../constants";

interface QuotationViewDialogProps {
  quotation: Quotation | null;
  onClose: () => void;
}

export function QuotationViewDialog({ quotation, onClose }: QuotationViewDialogProps) {
  return (
    <Dialog open={!!quotation} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Cotización #{quotation?.id.toString().padStart(4, "0")}</DialogTitle>
          <DialogDescription>
            Fecha: {quotation?.date
              ? new Date(quotation.date).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })
              : "-"}
          </DialogDescription>
        </DialogHeader>
        {quotation && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 pb-4 border-b">
              <div>
                <p className="text-sm text-gray-500">Cliente</p>
                <p className="text-gray-900">{quotation.clientName}</p>
                <p className="text-sm text-gray-500">{quotation.clientEmail}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Estado</p>
                <Badge className={STATUS_COLORS[quotation.status]}>{STATUS_LABELS[quotation.status]}</Badge>
              </div>
            </div>

            <div>
              <h4 className="text-gray-900 mb-3">Servicios</h4>
              <div className="space-y-2">
                {quotation.items?.map((item, i) => (
                  <div key={i} className="p-3 bg-gray-50 rounded-lg">
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
                <span className="text-gray-900">${(quotation.subtotal || 0).toFixed(2)}</span>
              </div>
              {quotation.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Descuento:</span>
                  <span>-${quotation.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg pt-2 border-t">
                <span className="text-gray-900">Total:</span>
                <span className="text-gray-900">${(quotation.total || 0).toFixed(2)}</span>
              </div>
            </div>

            {quotation.notes && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Notas:</p>
                <p className="text-gray-900">{quotation.notes}</p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
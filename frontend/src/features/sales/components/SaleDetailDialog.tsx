import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../../shared/ui/dialog";
import { Button } from "../../../shared/ui/button";
import { Sale } from "../types";
import { formatDate } from "../utils";

interface SaleDetailDialogProps {
  sale:    Sale | null;
  onClose: () => void;
}

export function SaleDetailDialog({ sale, onClose }: SaleDetailDialogProps) {
  if (!sale) return null;
  return (
    <Dialog open={!!sale} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalle de Venta</DialogTitle>
          <DialogDescription>Información completa de la transacción</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 pb-4 border-b">
            <div><p className="text-sm text-gray-500">Cliente</p><p className="text-gray-900">{sale.Cliente || "—"}</p></div>
            <div><p className="text-sm text-gray-500">Servicio</p><p className="text-gray-900">{sale.Servicio || "—"}</p></div>
            <div><p className="text-sm text-gray-500">Método de pago</p><p className="text-gray-900">{sale.metodo_pago}</p></div>
            <div><p className="text-sm text-gray-500">Fecha</p><p className="text-gray-900">{formatDate(sale.Fecha)}</p></div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal:</span>
              <span>${(sale.Subtotal || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">IVA (19%):</span>
              <span>${(sale.Iva || 0).toFixed(2)}</span>
            </div>
            {sale.descuento > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Descuento:</span>
                <span>-${sale.descuento.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t">
              <span className="text-gray-900">Total:</span>
              <span className="text-gray-900">${(sale.Total || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>
        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>Cerrar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

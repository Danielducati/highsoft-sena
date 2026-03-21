import { Card, CardContent } from "../../../shared/ui/card";
import { Eye, Receipt, User, DollarSign, Calendar, ShoppingCart } from "lucide-react";
import { Sale } from "../types";
import { formatDate } from "../utils";

interface SalesTableProps {
  sales:   Sale[];
  loading: boolean;
  onView:  (sale: Sale) => void;
}

export function SalesTable({ sales, loading, onView }: SalesTableProps) {
  if (loading) return <p className="text-center text-gray-500 py-8">Cargando ventas...</p>;

  if (sales.length === 0) return (
    <Card className="border-gray-200 shadow-sm">
      <CardContent className="p-8 text-center">
        <ShoppingCart className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-900 mb-1">No se encontraron ventas</p>
        <p className="text-sm text-gray-600">Intenta ajustar los filtros de búsqueda</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-1">
      {sales.map((sale, index) => (
        <div key={sale.id ?? index} className="bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-all">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 lg:gap-3 p-2.5 lg:p-3 items-center">
            <div className="lg:col-span-2 flex items-center gap-2">
              <Receipt className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-sm text-gray-900">#{(index + 1).toString().padStart(4, "0")}</span>
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
                {sale.descuento > 0 && (
                  <p className="text-xs text-green-600">-${sale.descuento.toFixed(2)}</p>
                )}
              </div>
            </div>
            <div className="lg:col-span-2 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-sm text-gray-700">{formatDate(sale.Fecha)}</span>
            </div>
            <div className="lg:col-span-1 flex items-center justify-end">
              <button onClick={() => onView(sale)}
                className="p-1 hover:bg-blue-50 rounded text-blue-600 transition-colors" title="Ver detalle">
                <Eye className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

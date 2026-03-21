import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../shared/ui/dialog";
import { Badge } from "../../../shared/ui/badge";
import { Avatar, AvatarFallback } from "../../../shared/ui/avatar";
import { Employee } from "../types";
import { ImageWithFallback } from "../../guidelines/figma/ImageWithFallback";

interface EmployeeViewDialogProps {
  employee: Employee | null;
  onClose: () => void;
}

export function EmployeeViewDialog({ employee, onClose }: EmployeeViewDialogProps) {
  return (
    <Dialog open={!!employee} onOpenChange={onClose}>
      <DialogContent className="rounded-xl max-w-2xl border-gray-200 shadow-lg">
        <DialogHeader>
          <DialogTitle>Detalles del Empleado</DialogTitle>
        </DialogHeader>
        {employee && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <Avatar className="w-16 h-16 ring-2 ring-gray-100">
                {employee.image ? (
                  <ImageWithFallback src={employee.image} alt={employee.name} className="w-full h-full object-cover" />
                ) : (
                  <AvatarFallback className="bg-gradient-to-br from-[#78D1BD] to-[#5FBFAA] text-white text-xl">
                    {employee.name.charAt(0)}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1">
                <h3 className="text-gray-900">{employee.name}</h3>
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs px-2 py-0.5 mt-1">
                  {employee.specialty || "Sin especialidad"}
                </Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-gray-600">Correo</p>
                <p className="text-gray-900">{employee.email || "—"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-600">Teléfono</p>
                <p className="text-gray-900">{employee.phone || "—"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-600">Ciudad</p>
                <p className="text-gray-900">{employee.ciudad || "—"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-600">Documento</p>
                <p className="text-gray-900">{employee.tipo_documento} {employee.numero_documento || "—"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-600">Dirección</p>
                <p className="text-gray-900">{employee.direccion || "—"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-600">Estado</p>
                <Badge className={employee.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}>
                  {employee.isActive ? "Activo" : "Inactivo"}
                </Badge>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

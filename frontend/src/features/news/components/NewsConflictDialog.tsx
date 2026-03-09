// news/components/NewsConflictDialog.tsx
import { useState } from "react";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from "../../../shared/ui/alert-dialog";
import { Badge } from "../../../shared/ui/badge";
import { Button } from "../../../shared/ui/button";
import { Label } from "../../../shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/ui/select";
import { AlertTriangle, CalendarX, CalendarCheck, ArrowLeft, UserRoundCog } from "lucide-react";
import { ConflictResponse } from "../services/newsApi";
import { Employee } from "../types";

interface NewsConflictDialogProps {
  conflict:   ConflictResponse | null;
  employees:  Employee[];
  onCancel:   () => void;
  onConfirm:  (cancelAppointments: boolean) => void;
  onChangeEmployee: (newEmployeeId: string) => void;
}

export function NewsConflictDialog({ conflict, employees, onCancel, onConfirm, onChangeEmployee }: NewsConflictDialogProps) {
  const [showEmployeeSelect, setShowEmployeeSelect] = useState(false);
  const [selectedEmployee,   setSelectedEmployee]   = useState("");

  if (!conflict) return null;

  const handleEmployeeConfirm = () => {
    if (!selectedEmployee) return;
    setShowEmployeeSelect(false);
    setSelectedEmployee("");
    onChangeEmployee(selectedEmployee);
  };

  return (
    <AlertDialog open={!!conflict} onOpenChange={onCancel}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-amber-600">
            <AlertTriangle className="w-5 h-5" />
            Conflicto de Citas
          </AlertDialogTitle>
          <AlertDialogDescription>
            {conflict.message}. Elige cómo proceder:
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Lista de citas en conflicto */}
        <div className="space-y-2 max-h-48 overflow-y-auto py-2">
          {conflict.citas.map(cita => (
            <div key={cita.citaId} className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">{cita.clienteNombre}</p>
                <p className="text-xs text-gray-500">{cita.servicio}</p>
              </div>
              <div className="text-right">
                <Badge className="bg-amber-100 text-amber-700 text-xs">{cita.fecha}</Badge>
                <p className="text-xs text-gray-500 mt-1">{cita.hora}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Select de empleado — se muestra solo cuando el usuario elige cambiar */}
        {showEmployeeSelect && (
          <div className="space-y-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Label className="text-sm text-blue-800">Selecciona el nuevo empleado:</Label>
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger className="bg-white border-blue-200">
                <SelectValue placeholder="Elige un empleado..." />
              </SelectTrigger>
              <SelectContent>
                {employees.map(emp => (
                  <SelectItem key={emp.id} value={String(emp.id)}>
                    {emp.name} {emp.specialty && `— ${emp.specialty}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2 pt-1">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 border-gray-300"
                onClick={() => { setShowEmployeeSelect(false); setSelectedEmployee(""); }}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                className={`flex-1 text-white transition-all ${
                  selectedEmployee
                    ? "bg-purple-600 hover:bg-purple-700 cursor-pointer"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
                onClick={handleEmployeeConfirm}
                disabled={!selectedEmployee}
              >
                Confirmar
              </Button>
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
          <Button
            className="w-full bg-red-500 hover:bg-red-600 text-white"
            onClick={() => onConfirm(true)}
          >
            <CalendarX className="w-4 h-4 mr-1.5" />
            Cancelar citas y registrar novedad
          </Button>

          <Button
            variant="outline"
            className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
            onClick={() => onConfirm(false)}
          >
            <CalendarCheck className="w-4 h-4 mr-1.5" />
            Registrar novedad sin cancelar citas
          </Button>

          <Button
            variant="outline"
            className="w-full border-purple-300 text-purple-700 hover:bg-purple-50"
            onClick={() => setShowEmployeeSelect(true)}
          >
            <UserRoundCog className="w-4 h-4 mr-1.5" />
            Asignar a otro empleado
          </Button>

          <Button
            variant="ghost"
            className="w-full text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            onClick={onCancel}
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Volver al formulario
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
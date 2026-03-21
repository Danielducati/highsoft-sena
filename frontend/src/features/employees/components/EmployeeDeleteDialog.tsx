import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../../shared/ui/alert-dialog";
import { AlertCircle } from "lucide-react";

interface EmployeeDeleteDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: () => void;
}

export function EmployeeDeleteDialog({ open, onOpenChange, onConfirm }: EmployeeDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-[#F87171]" />
            ¿Desactivar Empleado?
          </AlertDialogTitle>
          <AlertDialogDescription>
            El empleado pasará a estado Inactivo y no podrá iniciar sesión.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-[#F87171] hover:bg-[#EF4444]">
            Desactivar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
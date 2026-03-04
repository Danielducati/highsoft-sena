import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../../shared/ui/alert-dialog";
import { AlertCircle } from "lucide-react";

interface RoleDeleteDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: () => void;
}

export function RoleDeleteDialog({ open, onOpenChange, onConfirm }: RoleDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-[#F87171]" />
            ¿Eliminar Rol?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. El rol será eliminado permanentemente del sistema.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-[#F87171] hover:bg-[#EF4444]">
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
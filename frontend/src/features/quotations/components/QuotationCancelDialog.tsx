import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../../shared/ui/alert-dialog";
import { AlertCircle } from "lucide-react";

interface QuotationCancelDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: () => void;
}

export function QuotationCancelDialog({ open, onOpenChange, onConfirm }: QuotationCancelDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-[#F87171]" />
            ¿Cancelar Cotización?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción cambiará el estado de la cotización a "Cancelada".
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Volver</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-[#F87171] hover:bg-[#EF4444]">
            Cancelar Cotización
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
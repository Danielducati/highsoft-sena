import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../../shared/ui/dialog";
import { Button } from "../../../shared/ui/button";
import { Label } from "../../../shared/ui/label";
import { Badge } from "../../../shared/ui/badge";
import { Category } from "../types";

interface CategoryDetailDialogProps {
  isOpen: boolean;
  onOpenChange: (v: boolean) => void;
  category: Category | null;
}

export function CategoryDetailDialog({ isOpen, onOpenChange, category }: CategoryDetailDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Detalle de Categoría</DialogTitle>
          <DialogDescription>Información completa de la categoría</DialogDescription>
        </DialogHeader>
        {category && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <div
                className="w-16 h-16 rounded-full border-2 border-white shadow-md flex-shrink-0"
                style={{ backgroundColor: category.color }}
              />
              <div className="flex-1">
                <p className="text-foreground">{category.name}</p>
                <p className="text-sm text-muted-foreground">ID: {category.id}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <Label className="text-muted-foreground">Descripción</Label>
                <p className="text-foreground mt-1">{category.description}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Color de Identificación</Label>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-8 h-8 rounded border-2 border-white shadow-sm" style={{ backgroundColor: category.color }} />
                  <p className="text-foreground">{category.color}</p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Cantidad de Servicios</Label>
                <p className="text-foreground mt-1">{category.servicesCount} servicios</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Estado</Label>
                <div className="mt-1">
                  <Badge className={category.isActive ? "bg-primary text-foreground" : "bg-gray-500"}>
                    {category.isActive ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cerrar</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
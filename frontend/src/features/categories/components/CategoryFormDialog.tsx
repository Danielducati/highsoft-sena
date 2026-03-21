import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../../shared/ui/dialog";
import { Button } from "../../../shared/ui/button";
import { Input } from "../../../shared/ui/input";
import { Label } from "../../../shared/ui/label";
import { Plus } from "lucide-react";
import { Category, CategoryFormData } from "../types";

interface CategoryFormDialogProps {
  isOpen: boolean;
  onOpenChange: (v: boolean) => void;
  editingCategory: Category | null;
  formData: CategoryFormData;
  setFormData: (d: CategoryFormData) => void;
  onSubmit: () => void;
  onNewClick: () => void;
  userRole: string;
}

export function CategoryFormDialog({
  isOpen, onOpenChange, editingCategory, formData, setFormData, onSubmit, onNewClick, userRole,
}: CategoryFormDialogProps) {
  if (userRole !== "admin") return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 bg-primary hover:bg-primary/90 text-foreground transition-colors"
          onClick={onNewClick}
        >
          <Plus className="w-4 h-4" />
          Nueva Categoría
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingCategory ? "Editar Categoría" : "Nueva Categoría"}</DialogTitle>
          <DialogDescription>
            {editingCategory ? "Actualiza la información de la categoría" : "Crea una nueva categoría de servicios"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Masajes"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe la categoría..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="color">Color de Identificación</Label>
            <div className="flex gap-2">
              <Input
                id="color"
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-16 h-10 p-1 cursor-pointer"
              />
              <Input
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                placeholder="#78D1BD"
                className="flex-1"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button onClick={onSubmit}>
              {editingCategory ? "Actualizar" : "Crear Categoría"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
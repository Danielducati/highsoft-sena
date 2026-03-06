import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../../shared/ui/dialog";
import { Button } from "../../../shared/ui/button";
import { Input } from "../../../shared/ui/input";
import { Label } from "../../../shared/ui/label";
import { Textarea } from "../../../shared/ui/textarea";
import { Checkbox } from "../../../shared/ui/checkbox";
import { Permission } from "../types";
import { parseName } from "../constants";

interface Props {
  open:        boolean;
  onClose:     () => void;
  onSubmit:    () => void;
  isEditing:   boolean;
  formData:    { nombre: string; descripcion: string; permisosIds: number[] };
  setFormData: (data: any) => void;
  groupedPermissions: Record<string, Permission[]>;
}

export function RoleFormDialog({ open, onClose, onSubmit, isEditing, formData, setFormData, groupedPermissions }: Props) {

  const handlePermissionToggle = (id: string) => {
    const numId = Number(id);
    setFormData((prev: any) => ({
      ...prev,
      permisosIds: prev.permisosIds.includes(numId)
        ? prev.permisosIds.filter((p: number) => p !== numId)
        : [...prev.permisosIds, numId],
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="rounded-xl max-w-3xl max-h-[90vh] overflow-y-auto border-gray-200 shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-gray-900">{isEditing ? "Editar Rol" : "Nuevo Rol"}</DialogTitle>
          <DialogDescription className="text-gray-600">
            {isEditing ? "Actualiza la información del rol" : "Crea un nuevo rol y asigna permisos"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-4">
          <div className="space-y-2">
            <Label className="text-gray-900">Nombre del Rol *</Label>
            <Input
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Ej: Gerente, Recepcionista..."
              className="rounded-lg border-gray-200"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-900">Descripción *</Label>
            <Textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder="Describe las responsabilidades de este rol..."
              rows={3}
              className="rounded-lg border-gray-200"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-gray-900">Asignar Permisos *</Label>
            <div className="border border-gray-200 rounded-lg p-4 space-y-4 max-h-96 overflow-y-auto">
              {Object.entries(groupedPermissions).map(([category, permissions]) => (
                <div key={category} className="space-y-2">
                  <h4 className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg capitalize">
                    {category}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-3">
                    {permissions.map((permission) => (
                      <div key={permission.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={permission.id}
                          checked={formData.permisosIds.includes(Number(permission.id))}
                          onCheckedChange={() => handlePermissionToggle(permission.id)}
                        />
                        <label htmlFor={permission.id} className="text-sm text-gray-700 cursor-pointer select-none">
                          {parseName(permission.nombre)}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500">
              {formData.permisosIds.length} permiso{formData.permisosIds.length !== 1 ? "s" : ""} seleccionado{formData.permisosIds.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} className="rounded-lg border-gray-300">
              Cancelar
            </Button>
            <Button
              onClick={onSubmit}
              className="bg-gradient-to-r from-[#78D1BD] to-[#5FBFAA] hover:from-[#6BCAB7] hover:to-[#4FB5A1] text-white rounded-lg"
            >
              {isEditing ? "Actualizar" : "Crear"} Rol
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
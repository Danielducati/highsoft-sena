import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../../shared/ui/dialog";
import { Button } from "../../../shared/ui/button";
import { Input } from "../../../shared/ui/input";
import { Label } from "../../../shared/ui/label";
import { Textarea } from "../../../shared/ui/textarea";
import { Checkbox } from "../../../shared/ui/checkbox";
import { Role, RoleFormData } from "../types";
import { AVAILABLE_PERMISSIONS } from "../constants";
import { groupPermissionsByCategory } from "../utils";

interface RoleFormDialogProps {
  isOpen: boolean;
  onOpenChange: (v: boolean) => void;
  editingRole: Role | null;
  formData: RoleFormData;
  setFormData: (d: RoleFormData) => void;
  onSubmit: () => void;
  onCancel: () => void;
  onPermissionToggle: (id: string) => void;
}

const groupedPermissions = groupPermissionsByCategory(AVAILABLE_PERMISSIONS);

export function RoleFormDialog({
  isOpen, onOpenChange, editingRole, formData, setFormData,
  onSubmit, onCancel, onPermissionToggle,
}: RoleFormDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-xl max-w-3xl max-h-[90vh] overflow-y-auto border-gray-200 shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-gray-900">{editingRole ? "Editar Rol" : "Nuevo Rol"}</DialogTitle>
          <DialogDescription className="text-gray-600">
            {editingRole ? "Actualiza la información del rol" : "Crea un nuevo rol y asigna permisos"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-900">Nombre del Rol *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Gerente, Recepcionista..."
              className="rounded-lg border-gray-200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-900">Descripción *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                  <h4 className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{category}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-3">
                    {permissions.map((permission) => (
                      <div key={permission.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={permission.id}
                          checked={formData.permissions.includes(permission.id)}
                          onCheckedChange={() => onPermissionToggle(permission.id)}
                        />
                        <label htmlFor={permission.id} className="text-sm text-gray-700 cursor-pointer select-none">
                          {permission.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500">
              {formData.permissions.length} permiso{formData.permissions.length !== 1 ? "s" : ""} seleccionado{formData.permissions.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onCancel} className="rounded-lg border-gray-300">Cancelar</Button>
            <Button onClick={onSubmit} className="bg-gradient-to-r from-[#78D1BD] to-[#5FBFAA] hover:from-[#6BCAB7] hover:to-[#4FB5A1] text-white rounded-lg">
              {editingRole ? "Actualizar" : "Crear"} Rol
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
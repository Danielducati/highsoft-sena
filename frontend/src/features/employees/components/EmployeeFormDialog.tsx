import { useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../../shared/ui/dialog";
import { Button } from "../../../shared/ui/button";
import { Input } from "../../../shared/ui/input";
import { Label } from "../../../shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/ui/select";
import { Avatar, AvatarFallback } from "../../../shared/ui/avatar";
import { Upload, ImageIcon, X, Loader2 } from "lucide-react";
import { Employee, EmployeeFormData } from "../types";
import { DOCUMENT_TYPES, SPECIALTIES } from "../constants";
import { ImageWithFallback } from "../../guidelines/figma/ImageWithFallback";
import { toast } from "sonner";

interface EmployeeFormDialogProps {
  isOpen: boolean;
  onOpenChange: (v: boolean) => void;
  editingEmployee: Employee | null;
  formData: EmployeeFormData;
  setFormData: (d: EmployeeFormData) => void;
  imagePreview: string;
  setImagePreview: (v: string) => void;
  saving: boolean;
  onSubmit: () => void;
  onCancel: () => void;
}

export function EmployeeFormDialog({
  isOpen, onOpenChange, editingEmployee, formData, setFormData,
  imagePreview, setImagePreview, saving, onSubmit, onCancel,
}: EmployeeFormDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5000000) { toast.error("La imagen no debe superar los 5MB"); return; }
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-xl max-w-2xl border-gray-200 shadow-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingEmployee ? "Editar Empleado" : "Nuevo Empleado"}</DialogTitle>
          <DialogDescription>
            {editingEmployee ? "Actualiza la información del empleado" : "Ingresa los datos del nuevo empleado"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Foto */}
          <div className="space-y-2">
            <Label>Foto de Perfil</Label>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="w-20 h-20 ring-2 ring-gray-200">
                  {imagePreview ? (
                    <ImageWithFallback src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <AvatarFallback className="bg-gray-100"><ImageIcon className="w-8 h-8 text-gray-400" /></AvatarFallback>
                  )}
                </Avatar>
                {imagePreview && (
                  <button onClick={() => setImagePreview("")} className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="flex-1">
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full rounded-lg border-gray-200">
                  <Upload className="w-4 h-4 mr-2" />Subir Imagen
                </Button>
                <p className="text-xs text-gray-500 mt-1">JPG, PNG (máx. 5MB)</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nombres *</Label>
              <Input value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} placeholder="Ana María" className="rounded-lg border-gray-200" />
            </div>
            <div className="space-y-2">
              <Label>Apellidos *</Label>
              <Input value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} placeholder="García Pérez" className="rounded-lg border-gray-200" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Documento</Label>
              <Select value={formData.documentType} onValueChange={(v) => setFormData({ ...formData, documentType: v })}>
                <SelectTrigger className="rounded-lg border-gray-200"><SelectValue placeholder="Selecciona tipo" /></SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Número de Documento</Label>
              <Input value={formData.document} onChange={(e) => setFormData({ ...formData, document: e.target.value })} placeholder="1234567890" className="rounded-lg border-gray-200" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Correo *</Label>
              <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="empleado@highlifespa.com" className="rounded-lg border-gray-200" />
            </div>
            <div className="space-y-2">
              <Label>Teléfono</Label>
              <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+57 310 123 4567" className="rounded-lg border-gray-200" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Ciudad</Label>
              <Input value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} placeholder="Medellín" className="rounded-lg border-gray-200" />
            </div>
            <div className="space-y-2">
              <Label>Especialidad *</Label>
              <Select value={formData.specialty} onValueChange={(v) => setFormData({ ...formData, specialty: v })}>
                <SelectTrigger className="rounded-lg border-gray-200"><SelectValue placeholder="Selecciona especialidad" /></SelectTrigger>
                <SelectContent>
                  {SPECIALTIES.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Dirección</Label>
            <Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Calle 123 #45-67" className="rounded-lg border-gray-200" />
          </div>

          {!editingEmployee && (
            <div className="space-y-2">
              <Label>Contraseña inicial</Label>
              <Input type="password" value={formData.contrasena} onChange={(e) => setFormData({ ...formData, contrasena: e.target.value })} placeholder='empleado123 (por defecto)' className="rounded-lg border-gray-200" />
              <p className="text-xs text-gray-500">Si no ingresas una, se usará "empleado123"</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onCancel} className="rounded-lg border-gray-300">Cancelar</Button>
            <Button onClick={onSubmit} disabled={saving} className="bg-gradient-to-r from-[#78D1BD] to-[#5FBFAA] hover:from-[#6BCAB7] hover:to-[#4FB5A1] text-white rounded-lg">
              {saving
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Guardando...</>
                : `${editingEmployee ? "Actualizar" : "Crear"} Empleado`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
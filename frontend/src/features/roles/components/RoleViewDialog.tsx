import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../shared/ui/dialog";
import { Button } from "../../../shared/ui/button";
import { Badge } from "../../../shared/ui/badge";
import { Shield } from "lucide-react";
import { Role } from "../types";
import { AVAILABLE_PERMISSIONS } from "../constants";
import { groupPermissionsByCategory } from "../utils";

interface RoleViewDialogProps {
  isOpen: boolean;
  onOpenChange: (v: boolean) => void;
  role: Role | null;
}

const groupedPermissions = groupPermissionsByCategory(AVAILABLE_PERMISSIONS);

export function RoleViewDialog({ isOpen, onOpenChange, role }: RoleViewDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-xl max-w-2xl border-gray-200 shadow-lg max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-gray-900">Permisos del Rol</DialogTitle>
        </DialogHeader>
        {role && (
          <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg flex-shrink-0">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#A78BFA] to-[#8B5CF6] flex items-center justify-center shadow-sm">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-gray-900">{role.name}</h3>
                <p className="text-sm text-gray-600">{role.description}</p>
              </div>
              <Badge variant="outline" className={`text-xs px-2 py-0.5 ${role.isActive ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-100 text-gray-600 border-gray-200"}`}>
                {role.isActive ? "Activo" : "Inactivo"}
              </Badge>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto pr-2">
              <h4 className="text-gray-900 sticky top-0 bg-white pb-2 z-10">Lista de Permisos</h4>
              {Object.entries(groupedPermissions).map(([category, permissions]) => {
                const assigned = permissions.filter(p => role.permissions.includes(p.id));
                if (assigned.length === 0) return null;
                return (
                  <div key={category} className="space-y-2">
                    <h5 className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{category}</h5>
                    <div className="grid grid-cols-2 gap-2 pl-3">
                      {assigned.map((permission) => (
                        <div key={permission.id} className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{permission.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              {role.permissions.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No hay permisos asignados</p>
              )}
            </div>

            <div className="flex justify-between items-center pt-4 border-t flex-shrink-0">
              <p className="text-sm text-gray-600">Total: {role.permissions.length} permisos asignados</p>
              <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-lg border-gray-300">Cerrar</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
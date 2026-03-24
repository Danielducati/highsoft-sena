import { Badge } from "../../../shared/ui/badge";
import { Switch } from "../../../shared/ui/switch";
import { Eye, Pencil, Trash2, Lock, Layers } from "lucide-react";
import { AccessPermission } from "../types";
import { getModuleColor, getActionColor } from "../utils";

interface PermissionRowProps {
  permission: AccessPermission;
  userRole: string;
  onView: (permission: AccessPermission) => void;
  onEdit: (permission: AccessPermission) => void;
  onDelete: (id: number) => void;
  onToggleStatus: (id: number) => void;
}

export function PermissionRow({
  permission,
  userRole,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
}: PermissionRowProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-all">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 lg:gap-3 p-2.5 lg:p-3 items-start lg:items-center">
        {/* Permiso */}
        <div className="lg:col-span-3 flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#60A5FA] to-[#3B82F6] flex items-center justify-center text-white flex-shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-gray-900 truncate">{permission.name}</p>
            <Badge className={`${getActionColor(permission.action)} text-xs px-1.5 py-0 h-4 mt-0.5`}>
              {permission.action}
            </Badge>
          </div>
        </div>

        {/* Descripción */}
        <div className="lg:col-span-3 min-w-0">
          <p className="text-xs text-gray-700 line-clamp-2">{permission.description}</p>
        </div>

        {/* Módulo */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-1.5">
            <Layers className="w-3 h-3 text-gray-400" />
            <Badge className={`${getModuleColor(permission.module)} text-xs px-1.5 py-0 h-4`}>
              {permission.module}
            </Badge>
          </div>
        </div>

        {/* Estado */}
        <div className="lg:col-span-1">
          {userRole === "admin" && (
            <Switch
              checked={permission.isActive}
              onCheckedChange={() => onToggleStatus(permission.id)}
              className="scale-75"
            />
          )}
        </div>

        {/* Acciones */}
        <div className="lg:col-span-3 flex items-center justify-end gap-1">
          {userRole === "admin" && (
            <>
              <button
                onClick={() => onView(permission)}
                className="p-1 hover:bg-blue-50 rounded text-blue-600 transition-colors"
                title="Ver detalles"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => onEdit(permission)}
                className="p-1 hover:bg-amber-50 rounded text-amber-600 transition-colors"
                title="Editar"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(permission.id)}
                className="p-1 hover:bg-red-50 rounded text-red-600 transition-colors"
                title="Eliminar"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
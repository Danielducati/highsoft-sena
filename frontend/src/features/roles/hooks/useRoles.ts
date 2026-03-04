import { useState } from "react";
import { toast } from "sonner";
import { Role, RoleFormData } from "../types";

const EMPTY_FORM: RoleFormData = { name: "", description: "", permissions: [] };

export function useRoles() {
  const [roles,           setRoles]           = useState<Role[]>([]);
  const [searchTerm,      setSearchTerm]      = useState("");
  const [isDialogOpen,    setIsDialogOpen]    = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingRole,     setEditingRole]     = useState<Role | null>(null);
  const [viewingRole,     setViewingRole]     = useState<Role | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleToDelete,    setRoleToDelete]    = useState<number | null>(null);
  const [formData,        setFormData]        = useState<RoleFormData>(EMPTY_FORM);

  const filteredRoles = roles.filter(r =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ── CRUD ──────────────────────────────────────────────────────────────────
  const handleCreateOrUpdate = () => {
    if (!formData.name || !formData.description) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }
    if (formData.permissions.length === 0) {
      toast.error("Debes asignar al menos un permiso al rol");
      return;
    }

    if (editingRole) {
      setRoles(prev => prev.map(r => r.id === editingRole.id ? { ...r, ...formData } : r));
      toast.success("Rol actualizado exitosamente");
    } else {
      const newRole: Role = {
        id:          Math.max(...roles.map(r => r.id), 0) + 1,
        ...formData,
        isActive:    true,
        createdAt:   new Date().toISOString().split("T")[0],
        usersCount:  0,
      };
      setRoles(prev => [...prev, newRole]);
      toast.success("Rol creado exitosamente");
    }
    resetForm();
  };

  const handleDelete = () => {
    if (!roleToDelete) return;
    setRoles(prev => prev.filter(r => r.id !== roleToDelete));
    toast.success("Rol eliminado exitosamente");
    setDeleteDialogOpen(false);
    setRoleToDelete(null);
  };

  const confirmDelete = (id: number) => {
    const role = roles.find(r => r.id === id);
    if (role && role.usersCount > 0) {
      toast.error(`No se puede eliminar "${role.name}" porque tiene ${role.usersCount} usuarios asignados`);
      return;
    }
    setRoleToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setFormData({ name: role.name, description: role.description, permissions: role.permissions });
    setIsDialogOpen(true);
  };

  const handleView = (role: Role) => {
    setViewingRole(role);
    setIsViewDialogOpen(true);
  };

  const handleToggleStatus = (id: number) => {
    setRoles(prev => prev.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r));
    toast.success("Estado actualizado");
  };

  const handlePermissionToggle = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId],
    }));
  };

  const resetForm = () => {
    setIsDialogOpen(false);
    setEditingRole(null);
    setFormData(EMPTY_FORM);
  };

  const handleNewClick = () => {
    setEditingRole(null);
    setFormData(EMPTY_FORM);
    setIsDialogOpen(true);
  };

  const activeRoles = roles.filter(r => r.isActive).length;

  return {
    roles, filteredRoles, activeRoles,
    searchTerm, setSearchTerm,
    isDialogOpen, setIsDialogOpen,
    isViewDialogOpen, setIsViewDialogOpen,
    editingRole, viewingRole,
    deleteDialogOpen, setDeleteDialogOpen,
    formData, setFormData,
    handleCreateOrUpdate, handleDelete,
    confirmDelete, handleEdit, handleView,
    handleToggleStatus, handlePermissionToggle,
    resetForm, handleNewClick,
  };
}
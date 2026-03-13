// src/features/users/hooks/useUsers.ts
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { User, Role, UserFormData } from "../types";
import { ITEMS_PER_PAGE, MAX_IMAGE_SIZE_MB, EMPTY_FORM } from "../constants";
import { splitFullName } from "../utils";
import {
  fetchUsersApi, fetchRolesApi,
  createUserApi, updateUserApi,
  toggleUserStatusApi, deleteUserApi,
} from "../services/usersService";

export function useUsers() {
  const [users,            setUsers]            = useState<User[]>([]);
  const [roles,            setRoles]            = useState<Role[]>([]);
  const [loading,          setLoading]          = useState(true);
  const [searchTerm,       setSearchTerm]       = useState("");
  const [filterRole,       setFilterRole]       = useState("all");
  const [filterStatus,     setFilterStatus]     = useState("all");
  const [isDialogOpen,     setIsDialogOpen]     = useState(false);
  const [editingUser,      setEditingUser]      = useState<User | null>(null);
  const [viewingUser,      setViewingUser]      = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete,     setUserToDelete]     = useState<number | null>(null);
  const [imagePreview,     setImagePreview]     = useState("");
  const [formData,         setFormData]         = useState<UserFormData>({ ...EMPTY_FORM });
  const [currentPage,      setCurrentPage]      = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadUsers();
    loadRoles();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setUsers(await fetchUsersApi());
    } catch {
      toast.error("Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      setRoles(await fetchRolesApi());
    } catch {
      toast.error("Error al cargar roles");
    }
  };

  // ── CRUD ──────────────────────────────────────────────────────────────────
  const handleCreateOrUpdate = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.roleId) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }

    // Buscar el nombre del rol a partir del id seleccionado
    const selectedRole = roles.find(r => r.id === parseInt(formData.roleId));
    if (!selectedRole) {
      toast.error("El rol seleccionado no es válido");
      return;
    }

    const body = {
      firstName:    formData.firstName,
      lastName:     formData.lastName,
      documentType: formData.documentType,
      document:     formData.document,
      email:        formData.email,
      phone:        formData.phone,
      role:         selectedRole.Nombre, // ← nombre del rol, no el id
    };

    try {
      if (editingUser) {
        await updateUserApi(editingUser.id, body);
        toast.success("Usuario actualizado");
      } else {
        await createUserApi(body);
        toast.success("Usuario creado exitosamente");
      }
      await loadUsers();
      resetForm();
    } catch (error: any) {
      toast.error(error.message || "Error al guardar usuario");
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      await toggleUserStatusApi(user.id, !user.isActive);
      toast.success("Estado actualizado");
      await loadUsers();
    } catch {
      toast.error("Error al actualizar estado");
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    try {
      await deleteUserApi(userToDelete);
      toast.success("Usuario eliminado exitosamente");
      await loadUsers();
    } catch {
      toast.error("Error al eliminar usuario");
    } finally {
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const confirmDelete = (id: number) => {
    setUserToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    const { firstName, lastName } = splitFullName(user.name);
    setFormData({
      firstName,
      lastName,
      documentType: user.documentType || "",
      document:     user.document     || "",
      email:        user.email,
      phone:        user.phone,
      roleId:       user.roleId?.toString() || "",
      image:        "",
    });
    setImagePreview(user.photo || "");
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setIsDialogOpen(false);
    setEditingUser(null);
    setFormData({ ...EMPTY_FORM });
    setImagePreview("");
  };

  // ── Imagen ────────────────────────────────────────────────────────────────
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      toast.error(`La imagen no debe superar los ${MAX_IMAGE_SIZE_MB}MB`);
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImagePreview(result);
      setFormData(prev => ({ ...prev, image: result }));
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImagePreview("");
    setFormData(prev => ({ ...prev, image: "" }));
  };

  // ── Filtros / paginación ──────────────────────────────────────────────────
  const filteredUsers = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        u.phone?.includes(searchTerm);
    const matchRole   = filterRole   === "all" || u.role === filterRole;
    const matchStatus = filterStatus === "all" ||
                        (filterStatus === "active"   &&  u.isActive) ||
                        (filterStatus === "inactive" && !u.isActive);
    return matchSearch && matchRole && matchStatus;
  });

  const totalPages     = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const startIndex     = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const activeUsers    = users.filter(u => u.isActive).length;

  return {
    users, roles, loading, activeUsers,
    searchTerm, setSearchTerm,
    filterRole, setFilterRole,
    filterStatus, setFilterStatus,
    isDialogOpen, setIsDialogOpen,
    editingUser, viewingUser, setViewingUser,
    deleteDialogOpen, setDeleteDialogOpen,
    formData, setFormData,
    imagePreview, fileInputRef,
    currentPage, setCurrentPage, totalPages, startIndex,
    filteredUsers, paginatedUsers,
    handleCreateOrUpdate, handleDelete, handleToggleStatus,
    confirmDelete, handleEdit, resetForm,
    handleImageUpload, clearImage,
  };
}
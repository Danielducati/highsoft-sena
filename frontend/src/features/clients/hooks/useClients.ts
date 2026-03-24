import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Client, ClientFormData } from "../types";
import { ITEMS_PER_PAGE } from "../constants";
import { clientsApi } from "../services/clientsApi";

const EMPTY_FORM: ClientFormData = {
  firstName: "", lastName: "", documentType: "", document: "",
  email: "", phone: "", address: "", image: "",
};

export function useClients() {
  const [clients,          setClients]          = useState<Client[]>([]);
  const [loading,          setLoading]          = useState(true);
  const [searchTerm,       setSearchTerm]       = useState("");
  const [filterStatus,     setFilterStatus]     = useState("all");
  const [isDialogOpen,     setIsDialogOpen]     = useState(false);
  const [editingClient,    setEditingClient]    = useState<Client | null>(null);
  const [viewingClient,    setViewingClient]    = useState<Client | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete,   setClientToDelete]   = useState<number | null>(null);
  const [imagePreview,     setImagePreview]     = useState("");
  const [currentPage,      setCurrentPage]      = useState(1);
  const [formData,         setFormData]         = useState<ClientFormData>(EMPTY_FORM);

  // ── Carga inicial ────────────────────────────────────────────────────────
  useEffect(() => {
    clientsApi.getAll()
      .then(setClients)
      .catch(() => toast.error("Error al cargar clientes"))
      .finally(() => setLoading(false));
  }, []);

  // ── Filtros y paginación ─────────────────────────────────────────────────
  const filteredClients = clients.filter(client => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchTerm.toLowerCase())  ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm);
    const matchesStatus =
      filterStatus === "all"                              ||
      (filterStatus === "active"   &&  client.isActive)  ||
      (filterStatus === "inactive" && !client.isActive);
    return matchesSearch && matchesStatus;
  });

  const totalPages       = Math.ceil(filteredClients.length / ITEMS_PER_PAGE);
  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSearchChange = (value: string) => { setSearchTerm(value); setCurrentPage(1); };
  const handleFilterChange = (value: string) => { setFilterStatus(value); setCurrentPage(1); };

  // ── Crear / Actualizar ───────────────────────────────────────────────────
  const handleCreateOrUpdate = async () => {
    const { firstName, lastName, documentType, document, email, phone } = formData;

    if (!firstName || !lastName || !documentType || !document || !email || !phone) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }

    try {
      if (editingClient) {
        // PUT /clients/:id
        const updated = await clientsApi.update(editingClient.id, formData);
        setClients(prev => prev.map(c => c.id === editingClient.id ? updated : c));
        toast.success("Cliente actualizado exitosamente");
      } else {
        // POST /clients
        const created = await clientsApi.create(formData);
        setClients(prev => [...prev, created]);
        toast.success("Cliente creado exitosamente");
      }
      resetForm();
    } catch (err: any) {
      toast.error(err.message ?? "Error al guardar cliente");
    }
  };

  // ── Eliminar ─────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!clientToDelete) return;
    try {
      await clientsApi.remove(clientToDelete);
      setClients(prev => prev.filter(c => c.id !== clientToDelete));
      toast.success("Cliente eliminado exitosamente");
    } catch (err: any) {
      toast.error(err.message ?? "Error al eliminar cliente");
    } finally {
      setDeleteDialogOpen(false);
      setClientToDelete(null);
    }
  };

  // ── Toggle estado ────────────────────────────────────────────────────────
  const handleToggleStatus = async (id: number) => {
    const client = clients.find(c => c.id === id);
    if (!client) return;
    try {
      await clientsApi.toggleStatus(id, !client.isActive);
      setClients(prev => prev.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c));
      toast.success("Estado actualizado");
    } catch (err: any) {
      toast.error(err.message ?? "Error al cambiar estado");
    }
  };

  // ── Editar ───────────────────────────────────────────────────────────────
  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      firstName:    client.firstName    ?? client.name.split(" ")[0],
      lastName:     client.lastName     ?? client.name.split(" ").slice(1).join(" "),
      documentType: client.tipo_documento   ?? "",
      document:     client.numero_documento ?? "",
      email:        client.email,
      phone:        client.phone,
      address:      client.address,
      image:        client.image ?? "",
    });
    setImagePreview(client.image ?? "");
    setIsDialogOpen(true);
  };

  const confirmDelete = (id: number) => {
    setClientToDelete(id);
    setDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setIsDialogOpen(false);
    setEditingClient(null);
    setFormData(EMPTY_FORM);
    setImagePreview("");
  };

  const handleNewClick = () => {
    setEditingClient(null);
    setFormData(EMPTY_FORM);
    setImagePreview("");
  };

  return {
    clients, filteredClients, paginatedClients,
    loading,
    searchTerm,   handleSearchChange,
    filterStatus, handleFilterChange,
    isDialogOpen, setIsDialogOpen,
    editingClient, viewingClient, setViewingClient,
    deleteDialogOpen, setDeleteDialogOpen,
    formData, setFormData,
    imagePreview, setImagePreview,
    currentPage, setCurrentPage, totalPages,
    handleCreateOrUpdate, handleDelete,
    handleEdit, handleToggleStatus,
    confirmDelete, resetForm, handleNewClick,
  };
}
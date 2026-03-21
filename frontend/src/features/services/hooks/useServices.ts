import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Service, ServiceFormData } from "../types";
import { ITEMS_PER_PAGE, MAX_IMAGE_SIZE_MB, EMPTY_FORM } from "../constants";
import {
  fetchServicesApi, fetchCategoriesApi,
  createServiceApi, updateServiceApi, deleteServiceApi,
} from "../services/servicesService";

export function useServices() {
  const [services,         setServices]         = useState<Service[]>([]);
  const [categories,       setCategories]       = useState<any[]>([]);
  const [loading,          setLoading]          = useState(true);
  const [searchTerm,       setSearchTerm]       = useState("");
  const [filterCategory,   setFilterCategory]   = useState("all");
  const [filterStatus,     setFilterStatus]     = useState("all");
  const [isDialogOpen,     setIsDialogOpen]     = useState(false);
  const [editingService,   setEditingService]   = useState<Service | null>(null);
  const [viewingService,   setViewingService]   = useState<Service | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete,  setServiceToDelete]  = useState<number | null>(null);
  const [currentPage,      setCurrentPage]      = useState(1);
  const [formData,         setFormData]         = useState<ServiceFormData>({ ...EMPTY_FORM });
  const [imagePreview,     setImagePreview]     = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadServices();
    loadCategories();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      setServices(await fetchServicesApi());
    } catch {
      toast.error("Error al cargar servicios");
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try { setCategories(await fetchCategoriesApi()); }
    catch { toast.error("Error al cargar categorías"); }
  };

  // ── CRUD ──────────────────────────────────────────────────────────────────
  const handleCreateOrUpdate = async () => {
    if (!formData.name || !formData.duration || !formData.price || !formData.FK_categoria_servicios) {
      toast.error("Por favor completa todos los campos obligatorios");
      return;
    }
    const duration = parseInt(formData.duration);
    const price    = parseFloat(formData.price);
    if (duration <= 0 || price <= 0) {
      toast.error("La duración y el precio deben ser mayores a 0");
      return;
    }
    const body = {
      nombre:                 formData.name,
      descripcion:            formData.description,
      FK_categoria_servicios: parseInt(formData.FK_categoria_servicios),
      Duracion:               duration,
      Precio:                 price,
      imagen_servicio:        formData.image || null,
      Estado:                 "Activo",
    };
    try {
      if (editingService) {
        await updateServiceApi(editingService.id, body);
        toast.success("Servicio actualizado exitosamente");
      } else {
        await createServiceApi(body);
        toast.success("Servicio creado exitosamente");
      }
      await loadServices();
      handleCloseDialog();
    } catch (err: any) {
      toast.error(err.message || "Error al guardar el servicio");
    }
  };

  const handleDelete = async () => {
    if (!serviceToDelete) return;
    try {
      await deleteServiceApi(serviceToDelete);
      toast.success("Servicio eliminado exitosamente");
      await loadServices();
    } catch (err: any) {
      toast.error(err.message || "Error al eliminar el servicio");
    } finally {
      setDeleteDialogOpen(false);
      setServiceToDelete(null);
    }
  };

  const handleToggleStatus = async (service: Service) => {
    try {
      setServices(prev => prev.map(s =>
        s.id === service.id ? { ...s, isActive: !s.isActive } : s
      ));
      await updateServiceApi(service.id, {
        Estado: service.isActive ? "Inactivo" : "Activo",
      });
      toast.success(`Servicio ${service.isActive ? "desactivado" : "activado"} exitosamente`);
      await loadServices();
    } catch {
      await loadServices();
      toast.error("Error al actualizar estado");
    }
  };

  const confirmDelete = (id: number) => {
    setServiceToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    const cat = categories.find(c => c.name === service.category);
    setFormData({
      name:                   service.name,
      description:            service.description,
      duration:               service.duration.toString(),
      price:                  service.price.toString(),
      category:               service.category,
      image:                  service.image,
      FK_categoria_servicios: cat?.id?.toString() || service.categoryId?.toString() || "",
    });
    setImagePreview(service.image);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingService(null);
    setFormData({ ...EMPTY_FORM });
    setImagePreview("");
  };

  // ── Imagen ────────────────────────────────────────────────────────────────
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      toast.error(`La imagen debe ser menor a ${MAX_IMAGE_SIZE_MB}MB`);
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

  // ── Filtros / paginación ───────────────────────────────────────────────────
  const filteredServices = services.filter(s => {
    const matchSearch   = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = filterCategory === "all" || s.category === filterCategory;
    const matchStatus   = filterStatus === "all" ||
                          (filterStatus === "active"   &&  s.isActive) ||
                          (filterStatus === "inactive" && !s.isActive);
    return matchSearch && matchCategory && matchStatus;
  });

  const totalPages        = Math.ceil(filteredServices.length / ITEMS_PER_PAGE);
  const startIndex        = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex          = startIndex + ITEMS_PER_PAGE;
  const paginatedServices = filteredServices.slice(startIndex, endIndex);

  return {
    services, categories, loading,
    searchTerm, setSearchTerm,
    filterCategory, setFilterCategory,
    filterStatus, setFilterStatus,
    isDialogOpen, setIsDialogOpen,
    editingService, viewingService, setViewingService,
    deleteDialogOpen, setDeleteDialogOpen,
    formData, setFormData,
    imagePreview, fileInputRef,
    currentPage, setCurrentPage,
    filteredServices, paginatedServices, totalPages, startIndex, endIndex,
    handleCreateOrUpdate, handleDelete, handleToggleStatus,
    confirmDelete, handleEdit, handleCloseDialog,
    handleImageSelect, clearImage,
  };
}
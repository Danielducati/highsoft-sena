import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "../../shared/ui/card";
import { Button } from "../../shared/ui/button";
import { Input } from "../../shared/ui/input";
import { Label } from "../../shared/ui/label";
import { Textarea } from "../../shared/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../shared/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../shared/ui/select";
import { Badge } from "../../shared/ui/badge";
import { Switch } from "../../shared/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../shared/ui/alert-dialog";
import { Plus, Pencil, Trash2, Search, DollarSign, Clock, Upload, Image as ImageIcon, X, AlertCircle, Tag, Save, Eye } from "lucide-react";
import { toast } from "sonner";
import { ImageWithFallback } from "../guidelines/figma/ImageWithFallback";

const API_URL = "http://localhost:3001";

interface Service {
  id: number;
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
  image: string;
  isActive: boolean;
}

interface ServicesModuleProps {
  userRole: 'admin' | 'employee' | 'client';
}

export function ServicesModule({ userRole }: ServicesModuleProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [viewingService, setViewingService] = useState<Service | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration: "",
    price: "",
    category: "",
    image: "",
    FK_categoria_servicios: "",
  });

  const [imagePreview, setImagePreview] = useState<string>("");

  // ==========================================
  // CARGAR DATOS DESDE LA API
  // ==========================================
  useEffect(() => {
    fetchServices();
    fetchCategories();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/services`);
      if (!response.ok) throw new Error();
      const data = await response.json();
      const mapped: Service[] = data.map((s: any) => ({
        id: s.id,
        name: s.name,
        description: s.descripcion || "",
        duration: s.duration,
        price: s.price,
        category: s.category || "",
        image: s.imagen || "",
        isActive: s.estado === "Activo",
      }));
      setServices(mapped);
    } catch {
      toast.error("Error al cargar servicios");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/categories`);
      if (!response.ok) throw new Error();
      const data = await response.json();
      setCategories(data);
    } catch {
      toast.error("Error al cargar categorías");
    }
  };

  // ==========================================
  // CREAR O ACTUALIZAR SERVICIO
  // ==========================================
  const handleCreateOrUpdate = async () => {
    if (!formData.name || !formData.duration || !formData.price || !formData.FK_categoria_servicios) {
      toast.error("Por favor completa todos los campos obligatorios");
      return;
    }

    const duration = parseInt(formData.duration);
    const price = parseFloat(formData.price);

    if (duration <= 0 || price <= 0) {
      toast.error("La duración y el precio deben ser mayores a 0");
      return;
    }

    const body = {
      nombre: formData.name,
      descripcion: formData.description,
      Duracion: duration,
      Precio: price,
      FK_categoria_servicios: parseInt(formData.FK_categoria_servicios),
      imagen_servicio: formData.image || null,
      Estado: "Activo",
    };

    try {
      if (editingService) {
        const response = await fetch(`${API_URL}/services/${editingService.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!response.ok) throw new Error();
        toast.success("Servicio actualizado exitosamente");
      } else {
        const response = await fetch(`${API_URL}/services`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!response.ok) throw new Error();
        toast.success("Servicio creado exitosamente");
      }
      await fetchServices();
      handleCloseDialog();
    } catch {
      toast.error("Error al guardar el servicio");
    }
  };

  // ==========================================
  // ELIMINAR SERVICIO (soft delete)
  // ==========================================
  const handleDelete = async () => {
    if (!serviceToDelete) return;
    try {
      const response = await fetch(`${API_URL}/services/${serviceToDelete}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error();
      toast.success("Servicio desactivado exitosamente");
      await fetchServices();
    } catch {
      toast.error("Error al eliminar el servicio");
    } finally {
      setDeleteDialogOpen(false);
      setServiceToDelete(null);
    }
  };

  // ==========================================
  // TOGGLE ESTADO ACTIVO/INACTIVO
  // ==========================================
  const handleToggleStatus = async (service: Service) => {
    try {
      const response = await fetch(`${API_URL}/services/${service.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: service.name,
          descripcion: service.description,
          Duracion: service.duration,
          Precio: service.price,
          imagen_servicio: service.image || null,
          Estado: service.isActive ? "Inactivo" : "Activo",
        }),
      });
      if (!response.ok) throw new Error();
      toast.success(`Servicio ${service.isActive ? 'desactivado' : 'activado'} exitosamente`);
      await fetchServices();
    } catch {
      toast.error("Error al actualizar estado");
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("La imagen debe ser menor a 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setFormData({ ...formData, image: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingService(null);
    setFormData({ name: "", description: "", duration: "", price: "", category: "", image: "", FK_categoria_servicios: "" });
    setImagePreview("");
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    const cat = categories.find(c => c.Nombre === service.category);
    setFormData({
      name: service.name,
      description: service.description,
      duration: service.duration.toString(),
      price: service.price.toString(),
      category: service.category,
      image: service.image,
      FK_categoria_servicios: cat?.id?.toString() || "",
    });
    setImagePreview(service.image);
    setIsDialogOpen(true);
  };

  const confirmDelete = (id: number) => {
    setServiceToDelete(id);
    setDeleteDialogOpen(true);
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || service.category === filterCategory;
    const matchesStatus = filterStatus === "all" ||
      (filterStatus === "active" && service.isActive) ||
      (filterStatus === "inactive" && !service.isActive);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedServices = filteredServices.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-gray-900">Gestión de Servicios</h1>
          <p className="text-gray-600">Administra el catálogo completo de servicios del spa</p>
        </div>
        {userRole === 'admin' && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <button
                className="inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 bg-gradient-to-r from-[#78D1BD] to-[#5FBFAA] hover:from-[#6BCAB7] hover:to-[#4FB5A1] text-white transition-all shadow-md hover:shadow-lg"
                onClick={() => {
                  setEditingService(null);
                  setFormData({ name: "", description: "", duration: "", price: "", category: "", image: "", FK_categoria_servicios: "" });
                  setImagePreview("");
                }}
              >
                <Plus className="w-5 h-5" />
                <span>Agregar Servicio</span>
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {editingService ? <><Pencil className="w-5 h-5 text-[#78D1BD]" />Editar Servicio</> : <><Plus className="w-5 h-5 text-[#78D1BD]" />Nuevo Servicio</>}
                </DialogTitle>
                <DialogDescription>
                  {editingService ? "Actualiza la información del servicio" : "Completa los datos del nuevo servicio"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                {/* Imagen */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-[#78D1BD]" />
                    Imagen del Servicio
                  </Label>
                  <div className="flex flex-col gap-4">
                    {imagePreview ? (
                      <div className="relative rounded-xl overflow-hidden border-2 border-[#78D1BD]/20">
                        <ImageWithFallback src={imagePreview} alt="Preview" className="w-full h-64 object-cover" />
                        <button
                          onClick={() => { setImagePreview(""); setFormData({ ...formData, image: "" }); }}
                          className="absolute top-3 right-3 p-2 bg-[#F87171] text-white rounded-full hover:bg-[#EF4444] transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-[#78D1BD] hover:bg-[#78D1BD]/5 transition-colors"
                      >
                        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-900 mb-1">Click para subir imagen</p>
                        <p className="text-sm text-gray-600">PNG, JPG hasta 5MB</p>
                      </div>
                    )}
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="flex-1">
                        <Upload className="w-4 h-4 mr-2" />
                        {imagePreview ? "Cambiar Imagen" : "Seleccionar Imagen"}
                      </Button>
                      {imagePreview && (
                        <Button type="button" variant="outline" onClick={() => { setImagePreview(""); setFormData({ ...formData, image: "" }); }}>
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Detalles */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Tag className="w-4 h-4 text-[#78D1BD]" />Nombre del Servicio *</Label>
                    <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Ej: Masaje Relajante Premium" className="border-gray-300" />
                  </div>

                  <div className="space-y-2">
                    <Label>Descripción</Label>
                    <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Describe el servicio, beneficios, técnicas..." rows={4} className="border-gray-300 resize-none" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2"><Clock className="w-4 h-4 text-[#78D1BD]" />Duración (minutos) *</Label>
                      <Input type="number" min="1" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} placeholder="60" className="border-gray-300" />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2"><DollarSign className="w-4 h-4 text-[#78D1BD]" />Precio *</Label>
                      <Input type="number" step="0.01" min="0" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} placeholder="100.00" className="border-gray-300" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Categoría *</Label>
                    <Select value={formData.FK_categoria_servicios} onValueChange={(value) => {
                      const cat = categories.find(c => c.id.toString() === value);
                      setFormData({ ...formData, FK_categoria_servicios: value, category: cat?.Nombre || "" });
                    }}>
                      <SelectTrigger className="border-gray-300">
                        <SelectValue placeholder="Seleccionar categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color || "#78D1BD" }} />
                              <span>{cat.Nombre}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button variant="outline" onClick={handleCloseDialog}>Cancelar</Button>
                  <Button className="bg-gradient-to-r from-[#78D1BD] to-[#5FBFAA] hover:from-[#6BCAB7] hover:to-[#4FB5A1] text-white" onClick={handleCreateOrUpdate}>
                    <Save className="w-4 h-4 mr-2" />
                    {editingService ? "Guardar Cambios" : "Crear Servicio"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filtros */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Buscar servicios..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="pl-10 rounded-lg border-gray-200" />
            </div>
            <Select value={filterCategory} onValueChange={(v) => { setFilterCategory(v); setCurrentPage(1); }}>
              <SelectTrigger className="rounded-lg border-gray-200">
                <SelectValue placeholder="Todas las categorías" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.Nombre}>{cat.Nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v); setCurrentPage(1); }}>
              <SelectTrigger className="rounded-lg border-gray-200">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="inactive">Inactivos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista */}
      {loading ? (
        <p className="text-center text-gray-500 py-8">Cargando servicios...</p>
      ) : filteredServices.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-16 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-gray-900 mb-2">No se encontraron servicios</h3>
          <p className="text-sm text-gray-600">{searchTerm ? "Intenta con otros términos de búsqueda" : "Comienza agregando tu primer servicio"}</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="hidden lg:grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200 text-sm text-gray-600">
            <div className="col-span-4">Nombre</div>
            <div className="col-span-2">Precio</div>
            <div className="col-span-2">Duración</div>
            <div className="col-span-3">Estado</div>
            <div className="col-span-1 text-right">Acciones</div>
          </div>
          <div className="divide-y divide-gray-100">
            {paginatedServices.map((service) => (
              <div key={service.id} className="px-4 py-3 hover:bg-gray-50 transition-colors group">
                <div className="hidden lg:grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-4 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#78D1BD] flex-shrink-0"></div>
                    <div className="min-w-0">
                      <p className="text-sm text-gray-900 truncate">{service.name}</p>
                      <Badge variant="outline" className="text-xs mt-0.5 border-[#78D1BD]/30">{service.category}</Badge>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="flex items-center gap-1 text-sm text-gray-900">
                      <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                      <span>{service.price}</span>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="flex items-center gap-1 text-sm text-gray-700">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span>{service.duration}m</span>
                    </div>
                  </div>
                  <div className="col-span-3">
                    {userRole === 'admin' ? (
                      <div className="flex items-center gap-2">
                        <Switch checked={service.isActive} onCheckedChange={() => handleToggleStatus(service)} />
                        <span className="text-xs text-gray-600">{service.isActive ? 'Activo' : 'Inactivo'}</span>
                      </div>
                    ) : (
                      <Badge className={service.isActive ? "bg-[#78D1BD] text-white" : "bg-gray-500 text-white"}>
                        {service.isActive ? "Activo" : "Inactivo"}
                      </Badge>
                    )}
                  </div>
                  {userRole === 'admin' && (
                    <div className="col-span-1">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setViewingService(service)} className="h-8 w-8 hover:bg-[#78D1BD]/10 hover:text-[#78D1BD]"><Eye className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(service)} className="h-8 w-8 hover:bg-[#60A5FA]/10 hover:text-[#60A5FA]"><Pencil className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => confirmDelete(service.id)} className="h-8 w-8 hover:bg-[#F87171]/10 hover:text-[#F87171]"><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Vista Móvil */}
                <div className="lg:hidden space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#78D1BD] flex-shrink-0"></div>
                        <p className="text-sm text-gray-900">{service.name}</p>
                      </div>
                      <Badge variant="outline" className="text-xs mt-1 border-[#78D1BD]/30">{service.category}</Badge>
                    </div>
                    {userRole === 'admin' && (
                      <div className="flex gap-1 flex-shrink-0 ml-2">
                        <Button variant="ghost" size="icon" onClick={() => setViewingService(service)} className="h-8 w-8"><Eye className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(service)} className="h-8 w-8"><Pencil className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => confirmDelete(service.id)} className="h-8 w-8"><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-gray-700"><DollarSign className="w-3 h-3 text-gray-400" /><span>{service.price}</span></div>
                      <div className="flex items-center gap-1 text-gray-700"><Clock className="w-3 h-3 text-gray-400" /><span>{service.duration}m</span></div>
                    </div>
                    <Badge className={service.isActive ? "bg-[#78D1BD] text-white text-xs" : "bg-gray-500 text-white text-xs"}>
                      {service.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-3 py-2 bg-white border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-600">Mostrando {startIndex + 1}-{Math.min(endIndex, filteredServices.length)} de {filteredServices.length}</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-8 text-sm">Anterior</Button>
            <span className="text-sm text-gray-600">Página {currentPage} de {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="h-8 text-sm">Siguiente</Button>
          </div>
        </div>
      )}

      {/* Ver Servicio */}
      <Dialog open={viewingService !== null} onOpenChange={() => setViewingService(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {viewingService && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><Eye className="w-5 h-5 text-[#78D1BD]" />Detalle del Servicio</DialogTitle>
                <DialogDescription>{viewingService.category}</DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                {viewingService.image && (
                  <div className="rounded-xl overflow-hidden shadow-lg">
                    <ImageWithFallback src={viewingService.image} alt={viewingService.name} className="w-full h-72 object-cover" />
                  </div>
                )}
                <div>
                  <h3 className="text-2xl text-gray-900 mb-2">{viewingService.name}</h3>
                  <p className="text-gray-600 leading-relaxed">{viewingService.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Card className="border-gray-200"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="w-12 h-12 rounded-lg bg-[#78D1BD]/10 flex items-center justify-center"><Clock className="w-6 h-6 text-[#78D1BD]" /></div><div><p className="text-sm text-gray-600">Duración</p><p className="text-xl text-gray-900">{viewingService.duration} min</p></div></div></CardContent></Card>
                  <Card className="border-gray-200"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="w-12 h-12 rounded-lg bg-[#FBBF24]/10 flex items-center justify-center"><DollarSign className="w-6 h-6 text-[#FBBF24]" /></div><div><p className="text-sm text-gray-600">Precio</p><p className="text-xl text-gray-900">${viewingService.price}</p></div></div></CardContent></Card>
                  <Card className="border-gray-200"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="w-12 h-12 rounded-lg bg-[#78D1BD]/10 flex items-center justify-center"><Tag className="w-6 h-6 text-[#78D1BD]" /></div><div><p className="text-sm text-gray-600">Categoría</p><Badge variant="outline" className="mt-1">{viewingService.category}</Badge></div></div></CardContent></Card>
                  <Card className="border-gray-200"><CardContent className="p-4"><div className="flex items-center gap-3"><div className={`w-12 h-12 rounded-lg flex items-center justify-center ${viewingService.isActive ? 'bg-green-100' : 'bg-red-100'}`}><div className={`w-6 h-6 rounded-full ${viewingService.isActive ? 'bg-green-500' : 'bg-red-500'}`} /></div><div><p className="text-sm text-gray-600">Estado</p><Badge className={viewingService.isActive ? "bg-[#78D1BD] text-white mt-1" : "bg-gray-500 text-white mt-1"}>{viewingService.isActive ? "Activo" : "Inactivo"}</Badge></div></div></CardContent></Card>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Eliminar */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2"><AlertCircle className="w-5 h-5 text-[#F87171]" />¿Eliminar Servicio?</AlertDialogTitle>
            <AlertDialogDescription>El servicio pasará a estado Inactivo y no aparecerá en el catálogo.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-[#F87171] hover:bg-[#EF4444]">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
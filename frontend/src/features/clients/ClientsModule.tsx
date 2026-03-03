import { useState, useRef } from "react";
import { Card, CardContent } from "../../shared/ui/card";
import { Button } from "../../shared/ui/button";
import { Input } from "../../shared/ui/input";
import { Label } from "../../shared/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../shared/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../shared/ui/select";
import { Badge } from "../../shared/ui/badge";
import { Switch } from "../../shared/ui/switch";
import { Avatar, AvatarFallback } from "../../shared/ui/avatar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../shared/ui/alert-dialog";

import { Plus, Search, Filter, User, Mail, Phone, TrendingUp, Edit, Trash2, Eye, ShoppingBag, MapPin, AlertCircle, Upload, Image as ImageIcon, X } from "lucide-react";
import { toast } from "sonner";

import { ImageWithFallback } from "../guidelines/figma/ImageWithFallback";


interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  isActive: boolean;
  registeredDate: string;
  totalVisits: number;
  totalSpent: number;
  lastVisit: string;
}

interface ClientsModuleProps {
  userRole: 'admin' | 'employee' | 'client';
}

export function ClientsModule({ userRole }: ClientsModuleProps) {
  const [clients, setClients] = useState<Client[]>([ ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [viewingClient, setViewingClient] = useState<Client | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<number | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    documentType: "",
    document: "",
    email: "",
    phone: "",
    address: "",
    image: "",
  });

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.phone.includes(searchTerm);
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "active" && client.isActive) ||
                         (filterStatus === "inactive" && !client.isActive);
    return matchesSearch && matchesStatus;
  });

  // Paginación
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Reset to page 1 when search or filter changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (value: string) => {
    setFilterStatus(value);
    setCurrentPage(1);
  };

  const handleCreateOrUpdate = () => {
    if (!formData.firstName || !formData.lastName || !formData.documentType || !formData.document || !formData.email || !formData.phone) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }

    const fullName = `${formData.firstName} ${formData.lastName}`;

    if (editingClient) {
      setClients(clients.map(client => 
        client.id === editingClient.id 
          ? { 
              ...client,
              name: fullName,
              email: formData.email,
              phone: formData.phone,
              address: formData.address
            }
          : client
      ));
      toast.success("Cliente actualizado exitosamente");
    } else {
      const newClient: Client = {
        id: Math.max(...clients.map(c => c.id), 0) + 1,
        name: fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        isActive: true,
        registeredDate: new Date().toISOString().split('T')[0],
        totalVisits: 0,
        totalSpent: 0,
        lastVisit: "-"
      };
      setClients([...clients, newClient]);
      toast.success("Cliente creado exitosamente");
    }

    resetForm();
  };

  const resetForm = () => {
    setIsDialogOpen(false);
    setEditingClient(null);
    setFormData({ firstName: "", lastName: "", documentType: "", document: "", email: "", phone: "", address: "", image: "" });
    setImagePreview("");
  };

  const confirmDelete = (id: number) => {
    setClientToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (clientToDelete) {
      setClients(clients.filter(client => client.id !== clientToDelete));
      toast.success("Cliente eliminado exitosamente");
      setDeleteDialogOpen(false);
      setClientToDelete(null);
    }
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    const nameParts = client.name.split(' ');
    const firstName = nameParts.slice(0, Math.ceil(nameParts.length / 2)).join(' ');
    const lastName = nameParts.slice(Math.ceil(nameParts.length / 2)).join(' ');
    
    setFormData({
      firstName: firstName,
      lastName: lastName,
      documentType: "",
      document: "",
      email: client.email,
      phone: client.phone,
      address: client.address,
      image: "",
    });
    setImagePreview("");
    setIsDialogOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5000000) {
        toast.error("La imagen no debe superar los 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setFormData({ ...formData, image: reader.result as string });
        toast.success("Imagen cargada exitosamente");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleToggleStatus = (id: number) => {
    setClients(clients.map(client =>
      client.id === id ? { ...client, isActive: !client.isActive } : client
    ));
    toast.success("Estado actualizado");
  };

  const activeClients = clients.filter(c => c.isActive).length;
  const totalClients = clients.length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-[#60A5FA]" />
            <h1 className="text-gray-900">Gestión de Clientes</h1>
          </div>
          <p className="text-sm text-gray-600 mt-0.5">
            {totalClients} clientes • {activeClients} activos
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <button
              className="inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 bg-gradient-to-r from-[#A78BFA] to-[#9370DB] hover:from-[#9870E8] hover:to-[#8260CB] text-white text-sm shadow-sm transition-all"
              onClick={() => {
                setEditingClient(null);
                setFormData({ firstName: "", lastName: "", documentType: "", document: "", email: "", phone: "", address: "", image: "" });
                setImagePreview("");
              }}
            >
              <Plus className="w-3.5 h-3.5" />
              Nuevo Cliente
            </button>
          </DialogTrigger>
          <DialogContent className="rounded-xl max-w-3xl max-h-[90vh] overflow-y-auto border-gray-200 shadow-lg">
            <DialogHeader>
              <DialogTitle className="text-gray-900">{editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}</DialogTitle>
              <DialogDescription className="text-gray-600">
                {editingClient ? 'Actualiza la información del cliente' : 'Ingresa los datos del nuevo cliente'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-5 mt-4">
              {/* Upload de Imagen */}
              <div className="space-y-2">
                <Label className="text-gray-900">Foto del Cliente</Label>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="w-20 h-20 ring-2 ring-gray-200">
                      {imagePreview ? (
                        <ImageWithFallback
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <AvatarFallback className="bg-gradient-to-br from-[#60A5FA] to-[#3B82F6] text-white text-xl">
                          <ImageIcon className="w-8 h-8" />
                        </AvatarFallback>
                      )}
                    </Avatar>
                    {imagePreview && (
                      <button
                        onClick={() => {
                          setImagePreview("");
                          setFormData({ ...formData, image: "" });
                        }}
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full rounded-lg border-gray-200"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {imagePreview ? "Cambiar Imagen" : "Subir Imagen"}
                    </Button>
                    <p className="text-xs text-gray-500 mt-1">JPG, PNG o GIF (máx. 5MB)</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-gray-900">Nombre *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="Juan"
                    className="rounded-lg border-gray-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-gray-900">Apellido *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Pérez García"
                    className="rounded-lg border-gray-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="documentType" className="text-gray-900">Tipo de Documento *</Label>
                  <Select 
                    value={formData.documentType}
                    onValueChange={(value: any) => setFormData({ ...formData, documentType: value })}
                  >
                    <SelectTrigger className="rounded-lg border-gray-200">
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
                      <SelectItem value="CE">Cédula de Extranjería</SelectItem>
                      <SelectItem value="TI">Tarjeta de Identidad</SelectItem>
                      <SelectItem value="PP">Pasaporte</SelectItem>
                      <SelectItem value="NIT">NIT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="document" className="text-gray-900">Número de Documento *</Label>
                  <Input
                    id="document"
                    value={formData.document}
                    onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                    placeholder="1234567890"
                    className="rounded-lg border-gray-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-gray-900">Teléfono *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+57 300 123 4567"
                    className="rounded-lg border-gray-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-900">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="cliente@ejemplo.com"
                    className="rounded-lg border-gray-200"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-gray-900">Dirección</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Calle 123 #45-67, Bogotá"
                  className="rounded-lg border-gray-200"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={resetForm}
                  className="rounded-lg border-gray-300"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateOrUpdate}
                  className="bg-gradient-to-r from-[#78D1BD] to-[#5FBFAA] hover:from-[#6BCAB7] hover:to-[#4FB5A1] text-white rounded-lg"
                >
                  {editingClient ? 'Actualizar' : 'Crear'} Cliente
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <Input
                placeholder="Buscar por nombre, email o teléfono..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-8 h-8 text-sm rounded-lg border-gray-200"
              />
            </div>
            <div className="flex gap-2 items-center">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <Select value={filterStatus} onValueChange={handleFilterChange}>
                <SelectTrigger className="w-32 h-8 text-sm rounded-lg border-gray-200">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Activos</SelectItem>
                  <SelectItem value="inactive">Inactivos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table Header - Desktop */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-3 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-xs text-gray-600">
        <div className="col-span-3">Nombre</div>
        <div className="col-span-3">Contacto</div>
        <div className="col-span-2">Servicios</div>
        <div className="col-span-1">Estado</div>
        <div className="col-span-3 text-right">Acciones</div>
      </div>

      {/* Clients List - Table Rows */}
      <div className="space-y-1">
        {paginatedClients.map((client) => {
          return (
            <div key={client.id} className="bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-all">
              {/* Main Row */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 lg:gap-3 p-2.5 lg:p-3 items-start lg:items-center">
                {/* Nombre */}
                <div className="lg:col-span-3 flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#78D1BD] to-[#5FBFAA] flex items-center justify-center text-white text-sm flex-shrink-0">
                    {client.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-900 truncate">{client.name}</p>
                  </div>
                </div>

                {/* Contacto */}
                <div className="lg:col-span-3 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Mail className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    <span className="text-xs text-gray-700 truncate">{client.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    <span className="text-xs text-gray-700">{client.phone}</span>
                  </div>
                </div>

                {/* Servicios */}
                <div className="lg:col-span-2">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <ShoppingBag className="w-3 h-3 text-gray-400" />
                    <span className="text-sm text-gray-900">{client.totalVisits} Servicios</span>
                  </div>
                </div>

                {/* Estado */}
                <div className="lg:col-span-1">
                  <div className="flex items-center gap-1.5">
                    {userRole === 'admin' && (
                      <Switch
                        checked={client.isActive}
                        onCheckedChange={() => handleToggleStatus(client.id)}
                        className="scale-75"
                      />
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="lg:col-span-3 flex items-center justify-end gap-1">
                  {userRole === 'admin' && (
                    <>
                      <button
                        onClick={() => setViewingClient(client)}
                        className="p-1 hover:bg-blue-50 rounded text-blue-600 transition-colors"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(client)}
                        className="p-1 hover:bg-amber-50 rounded text-amber-600 transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => confirmDelete(client.id)}
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
        })}
      </div>

      {filteredClients.length === 0 && (
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-8 text-center">
            <User className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-900 mb-1">No se encontraron clientes</p>
            <p className="text-sm text-gray-600">Intenta ajustar los filtros de búsqueda</p>
          </CardContent>
        </Card>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-3">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
              <p className="text-sm text-gray-600">
                Mostrando {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredClients.length)} de {filteredClients.length} clientes
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="rounded-lg border-gray-200 disabled:opacity-50"
                >
                  Anterior
                </Button>
                <span className="text-sm text-gray-600 px-2">
                  Página {currentPage} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="rounded-lg border-gray-200 disabled:opacity-50"
                >
                  Siguiente
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* View Dialog */}
      <Dialog open={!!viewingClient} onOpenChange={() => setViewingClient(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles del Cliente</DialogTitle>
          </DialogHeader>
          {viewingClient && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#78D1BD] to-[#5FBFAA] flex items-center justify-center text-white text-xl">
                  {viewingClient.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="text-gray-900">{viewingClient.name}</h3>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-gray-900">{viewingClient.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Teléfono</p>
                  <p className="text-gray-900">{viewingClient.phone}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Total Visitas</p>
                  <p className="text-gray-900">{viewingClient.totalVisits}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Total Gastado</p>
                  <p className="text-gray-900">${viewingClient.totalSpent.toLocaleString()}</p>
                </div>
                <div className="space-y-1 col-span-2">
                  <p className="text-sm text-gray-500">Dirección</p>
                  <p className="text-gray-900">{viewingClient.address || "No especificada"}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-[#F87171]" />
              ¿Eliminar Cliente?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El cliente será eliminado permanentemente del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-[#F87171] hover:bg-[#EF4444]"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

import { useState } from "react";
import { Card, CardContent } from "../../../shared/ui/card";
import { Button } from "../../../shared/ui/button";
import { Input } from "../../../shared/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../../shared/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../../shared/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/ui/select";
import { Plus, Search, Filter, ShoppingCart, AlertCircle } from "lucide-react";
import { useSales } from "../hooks/useSales";
import { SaleForm } from "../components/SaleForm";
import { SalesTable } from "../components/SalesTable";
import { SaleDetailDialog } from "../components/SaleDetailDialog";
import { EMPTY_FORM, PAYMENT_METHODS } from "../constants";
import { Sale, SaleFormData, SaleItem, SalesModuleProps } from "../types";
import { toast } from "sonner";

export function SalesPage({ userRole }: SalesModuleProps) {
const { sales, appointments, availableServices, loading, saving, registerSale } = useSales();

const [searchTerm,    setSearchTerm]   = useState("");
const [filterPayment, setFilterPayment] = useState("all");
const [currentPage,   setCurrentPage]  = useState(1);
const itemsPerPage = 5;

const [isDialogOpen,    setIsDialogOpen]   = useState(false);
const [saleType,        setSaleType]       = useState<"appointment" | "direct">("direct");
const [selectedSale,    setSelectedSale]   = useState<Sale | null>(null);
const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
const [formData,        setFormData]       = useState<SaleFormData>(EMPTY_FORM);

// ── Filtros ────────────────────────────────────────────────────────────────
const filteredSales = sales.filter(sale => {
    const matchSearch  = (sale.Cliente || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchPayment = filterPayment === "all" || sale.metodo_pago === filterPayment;
    return matchSearch && matchPayment;
});

const totalPages    = Math.ceil(filteredSales.length / itemsPerPage);
const startIndex    = (currentPage - 1) * itemsPerPage;
const paginatedSales = filteredSales.slice(startIndex, startIndex + itemsPerPage);
const totalRevenue  = sales.reduce((sum, s) => sum + (s.Total || 0), 0);

// ── Formulario ─────────────────────────────────────────────────────────────
const resetForm = () => {
    setIsDialogOpen(false);
    setFormData(EMPTY_FORM);
    setSaleType("direct");
};

const handleSaleTypeChange = (value: "appointment" | "direct") => {
    setSaleType(value);
    setFormData(EMPTY_FORM);
};

const handleAppointmentSelect = (appointmentId: string) => {
    const appt = appointments.find(a => a.id === parseInt(appointmentId));
    if (!appt) return;

    const service = availableServices.find(s =>
    s.name === appt.service ||
    appt.service?.includes(s.name) ||
    s.name?.includes(appt.service)
    );

    setFormData(prev => ({
    ...prev,
    appointmentId: appt.id,
    clientName:    appt.clientName,
    selectedServices: service ? [{
        serviceId:   service.id,
        serviceName: service.name,
        price:       appt.precio || service.price,
        quantity:    1,
    }] : [],
    }));

    toast.success(`Cita seleccionada: ${appt.clientName}`);
};

const handleAddService = (serviceId: number) => {
    const service = availableServices.find(s => s.id === serviceId);
    if (!service) return;

    const existing = formData.selectedServices.findIndex(s => s.serviceId === serviceId);
    if (existing >= 0) {
    const updated = [...formData.selectedServices];
    updated[existing].quantity += 1;
    setFormData(prev => ({ ...prev, selectedServices: updated }));
    } else {
    setFormData(prev => ({
        ...prev,
        selectedServices: [...prev.selectedServices, {
        serviceId:   service.id,
        serviceName: service.name,
        price:       service.price,
        quantity:    1,
        }],
    }));
    }
};

const handleUpdateQuantity = (serviceId: number, quantity: number) => {
    setFormData(prev => ({
    ...prev,
    selectedServices: prev.selectedServices.map(s =>
        s.serviceId === serviceId ? { ...s, quantity: Math.max(1, quantity) } : s
    ),
    }));
};

const handleRemoveService = (serviceId: number) => {
    setFormData(prev => ({
    ...prev,
    selectedServices: prev.selectedServices.filter(s => s.serviceId !== serviceId),
    }));
};

const handleSubmit = async () => {
    const ok = await registerSale(formData, saleType);
    if (ok) resetForm();
};

return (
    <div className="space-y-4">
    {/* Header */}
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
        <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-[#78D1BD]" />
            <h1 className="text-gray-900">Gestión de Ventas</h1>
        </div>
        <p className="text-sm text-gray-600 mt-0.5">
            {sales.length} ventas • ${totalRevenue.toFixed(2)} total
        </p>
        </div>

        {userRole !== "client" && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
            <button className="inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 bg-gradient-to-r from-[#A78BFA] to-[#9370DB] hover:from-[#9870E8] hover:to-[#8260CB] text-white text-sm shadow-sm transition-all">
                <Plus className="w-3.5 h-3.5" /> Registrar Venta
            </button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh]">
            <DialogHeader>
                <DialogTitle>Registrar Nueva Venta</DialogTitle>
                <DialogDescription>Completa la información de la venta</DialogDescription>
            </DialogHeader>
            <SaleForm
                formData={formData}
                setFormData={setFormData}
                saleType={saleType}
                onSaleTypeChange={handleSaleTypeChange}
                appointments={appointments}
                availableServices={availableServices}
                saving={saving}
                onSubmit={handleSubmit}
                onCancel={resetForm}
                onAppointmentSelect={handleAppointmentSelect}
                onAddService={handleAddService}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveService={handleRemoveService}
            />
            </DialogContent>
        </Dialog>
        )}
    </div>

    {/* Filtros */}
    <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-3">
        <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <Input
                placeholder="Buscar por cliente..."
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="pl-8 h-8 text-sm rounded-lg border-gray-200"
            />
            </div>
            <div className="flex gap-2 items-center">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <Select value={filterPayment} onValueChange={v => { setFilterPayment(v); setCurrentPage(1); }}>
                <SelectTrigger className="w-36 h-8 text-sm rounded-lg border-gray-200">
                <SelectValue placeholder="Método pago" />
                </SelectTrigger>
                <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {PAYMENT_METHODS.map(m => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
                </SelectContent>
            </Select>
            </div>
        </div>
        </CardContent>
    </Card>

    {/* Cabecera tabla */}
    <div className="hidden lg:grid lg:grid-cols-12 gap-3 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-xs text-gray-600">
        <div className="col-span-2">Número</div>
        <div className="col-span-3">Cliente</div>
        <div className="col-span-2">Servicio</div>
        <div className="col-span-2">Total</div>
        <div className="col-span-2">Fecha</div>
        <div className="col-span-1 text-right">Acciones</div>
    </div>

    {/* Tabla */}
    <SalesTable
        sales={paginatedSales}
        loading={loading}
        onView={setSelectedSale}
    />

    {/* Paginación */}
    {totalPages > 1 && (
        <div className="flex items-center justify-between px-3 py-2 bg-white border border-gray-200 rounded-lg">
        <p className="text-sm text-gray-600">
            Mostrando {startIndex + 1}–{Math.min(startIndex + itemsPerPage, filteredSales.length)} de {filteredSales.length}
        </p>
        <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-8 text-sm">Anterior</Button>
            <span className="text-sm text-gray-600">Página {currentPage} de {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="h-8 text-sm">Siguiente</Button>
        </div>
        </div>
    )}

    {/* Dialogs */}
    <SaleDetailDialog sale={selectedSale} onClose={() => setSelectedSale(null)} />

    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
        <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-[#F87171]" />¿Anular Venta?
            </AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
            onClick={() => { setDeleteDialogOpen(false); toast.info("Función de anulación no implementada aún"); }}
            className="bg-[#F87171] hover:bg-[#EF4444]"
            >
            Anular Venta
            </AlertDialogAction>
        </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </div>
);
}
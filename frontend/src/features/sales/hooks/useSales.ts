import { useState, useEffect } from "react";
import { toast } from "sonner";
import { salesApi } from "../services/salesApi";
import { Appointment, Sale, SaleFormData } from "../types";
import { EMPTY_FORM } from "../constants";

export function useSales() {
const [sales,              setSales]              = useState<Sale[]>([]);
const [appointments,       setAppointments]       = useState<Appointment[]>([]);
const [availableServices,  setAvailableServices]  = useState<any[]>([]);
const [loading,            setLoading]            = useState(true);
const [saving,             setSaving]             = useState(false);

useEffect(() => {
    async function fetchAll() {
    try {
        const [salesData, apptData, svcData] = await Promise.all([
        salesApi.getSales(),
        salesApi.getAppointments(),
        salesApi.getServices(),
        ]);
        setSales(salesData);
        setAppointments(apptData);
        setAvailableServices(svcData);
    } catch (err: any) {
        toast.error(err.message ?? "Error al cargar datos");
    } finally {
        setLoading(false);
    }
    }
    fetchAll();
}, []);

const reload = async () => {
    const [salesData, apptData] = await Promise.all([
    salesApi.getSales(),
    salesApi.getAppointments(),
    ]);
    setSales(salesData);
    setAppointments(apptData);
};

const registerSale = async (
    formData: SaleFormData,
    saleType: "appointment" | "direct"
): Promise<boolean> => {
    if (saleType === "appointment" && !formData.appointmentId) {
    toast.error("Debes seleccionar una cita");
    return false;
    }
    if (saleType === "direct" && !formData.clientName.trim()) {
    toast.error("El nombre del cliente es obligatorio");
    return false;
    }
    if (saleType === "direct" && formData.selectedServices.length === 0) {
    toast.error("Debes agregar al menos un servicio");
    return false;
    }

    setSaving(true);
    try {
    await salesApi.create(formData, saleType);
    toast.success("Venta registrada exitosamente");
    await reload();
    return true;
    } catch (err: any) {
    toast.error(err.message ?? "Error al registrar venta");
    return false;
    } finally {
    setSaving(false);
    }
};

return { sales, appointments, availableServices, loading, saving, registerSale };
}
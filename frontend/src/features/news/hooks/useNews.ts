// news/hooks/useNews.ts
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { newsApi, ConflictResponse } from "../services/newsApi";
import { Employee, EmployeeNews, NewsFormData } from "../types";

export function useNews() {
const [employees, setEmployees] = useState<Employee[]>([]);
const [newsList,  setNewsList]  = useState<EmployeeNews[]>([]);
const [loading,   setLoading]   = useState(true);

// ── Estado del conflicto de citas ────────────────────────────────────────
const [conflict,        setConflict]        = useState<ConflictResponse | null>(null);
const [pendingFormData, setPendingFormData] = useState<NewsFormData | null>(null);

useEffect(() => {
    async function fetchAll() {
    try {
        const [empData, newsData] = await Promise.all([
        newsApi.getEmployees(),
        newsApi.getAll(),
        ]);
        setEmployees(empData);
        setNewsList(newsData);
    } catch {
        toast.error("Error al conectar con el servidor");
    } finally {
        setLoading(false);
    }
    }
    fetchAll();
}, []);

const reload = async () => {
    const data = await newsApi.getAll();
    setNewsList(data);
};

const createOrUpdate = async (formData: NewsFormData, editingId?: number): Promise<boolean> => {
    if (!formData.employeeId || !formData.date || !formData.description) {
    toast.error("Empleado, fecha y descripción son obligatorios");
    return false;
    }
    try {
    if (editingId) {
        await newsApi.update(editingId, formData);
        toast.success("Novedad actualizada");
        await reload();
        return true;
    }

    // Primer intento — sin decisión sobre citas
    const result = await newsApi.create(formData);

    // ── Hay conflicto de citas ─────────────────────────────────────────
    if ("conflict" in result) {
        setPendingFormData(formData); // guardamos el form para reusarlo
        setConflict(result);          // abrimos el modal
        return false;                 // no cerramos el form todavía
    }

    toast.success("Novedad creada");
    await reload();
    return true;
    } catch (err: any) {
    toast.error(err.message ?? "Error al guardar");
    return false;
    }
};

// Llamado cuando el usuario decide desde el modal de conflicto
const resolveConflict = async (cancelAppointments: boolean): Promise<boolean> => {
    if (!pendingFormData) return false;
    try {
    const result = await newsApi.create(pendingFormData, cancelAppointments);

    if ("conflict" in result) {
        // No debería pasar, pero por seguridad
        toast.error("Error inesperado al resolver conflicto");
        return false;
    }

    toast.success(
        cancelAppointments
        ? "Novedad creada y citas canceladas"
        : "Novedad creada — las citas se mantienen"
    );
    setConflict(null);
    setPendingFormData(null);
    await reload();
    return true;
    } catch (err: any) {
    toast.error(err.message ?? "Error al guardar");
    return false;
    }
};

const dismissConflict = () => {
    setConflict(null);
    setPendingFormData(null);
};

// Cambia el empleado y reintenta — puede volver a dar conflicto con el nuevo empleado
const changeEmployee = async (newEmployeeId: string): Promise<void> => {
    if (!pendingFormData) return;
    const updatedForm = { ...pendingFormData, employeeId: newEmployeeId };
    setPendingFormData(updatedForm);
    setConflict(null);
    try {
    const result = await newsApi.create(updatedForm);
    if ("conflict" in result) {
        setConflict(result); // nuevo empleado también tiene conflictos
        return;
    }
    toast.success("Novedad creada con el nuevo empleado");
    setPendingFormData(null);
    await reload();
    } catch (err: any) {
    toast.error(err.message ?? "Error al guardar");
    }
};

const remove = async (id: number): Promise<boolean> => {
    try {
    await newsApi.remove(id);
    setNewsList(prev => prev.filter(n => n.id !== id));
    toast.success("Novedad eliminada");
    return true;
    } catch {
    toast.error("Error al eliminar");
    return false;
    }
};

const updateStatus = async (id: number, status: EmployeeNews["status"]): Promise<boolean> => {
    try {
    await newsApi.updateStatus(id, status);
    setNewsList(prev => prev.map(n => n.id === id ? { ...n, status } : n));
    toast.success("Estado actualizado");
    return true;
    } catch {
    toast.error("Error al actualizar estado");
    return false;
    }
};

return {
    employees, newsList, loading,
    createOrUpdate, remove, updateStatus,
    // Conflicto
    conflict, resolveConflict, dismissConflict, changeEmployee,
};
}
import { API_BASE } from "../constants";
import { Employee, EmployeeNews, NewsFormData } from "../types";

export const newsApi = {
async getEmployees(): Promise<Employee[]> {
    const res = await fetch(`${API_BASE}/employees`);
    if (!res.ok) throw new Error("Error al cargar empleados");
    return res.json();
},

async getAll(): Promise<EmployeeNews[]> {
    const res = await fetch(`${API_BASE}/news`);
    if (!res.ok) throw new Error("Error al cargar novedades");
    return res.json();
},

async create(data: Omit<NewsFormData, "employeeName">): Promise<void> {
    const res = await fetch(`${API_BASE}/news`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({
        employeeId:  data.employeeId,
        type:        data.type,
        date:        data.date,
        fechaFinal:  data.fechaFinal  || null,
        startTime:   data.startTime   || null,
        endTime:     data.endTime     || null,
        description: data.description,
        status:      data.status,
    }),
    });
    if (!res.ok) throw new Error((await res.json()).error ?? "Error al crear");
},

async update(id: number, data: Omit<NewsFormData, "employeeName">): Promise<void> {
    const res = await fetch(`${API_BASE}/news/${id}`, {
    method:  "PUT",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({
        type:        data.type,
        date:        data.date,
        fechaFinal:  data.fechaFinal  || null,
        startTime:   data.startTime   || null,
        endTime:     data.endTime     || null,
        description: data.description,
        status:      data.status,
    }),
    });
    if (!res.ok) throw new Error((await res.json()).error ?? "Error al actualizar");
},

async updateStatus(id: number, status: EmployeeNews["status"]): Promise<void> {
    const res = await fetch(`${API_BASE}/news/${id}/status`, {
    method:  "PATCH",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error("Error al actualizar estado");
},

async remove(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/news/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Error al eliminar");
},
};
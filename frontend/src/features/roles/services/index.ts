import { API, authHeaders } from "../constants";
import { Permission, Role } from "../types";

export const rolesService = {

getRoles: async (): Promise<Role[]> => {
    const res = await fetch(`${API}/api/roles`, { headers: authHeaders() });
    if (!res.ok) throw new Error("Error al cargar roles");
    return res.json();
},

getPermissions: async (): Promise<Permission[]> => {
    const res = await fetch(`${API}/api/permisos`, { headers: authHeaders() });
    if (!res.ok) throw new Error("Error al cargar permisos");
    return res.json();
},

createRole: async (data: { nombre: string; descripcion: string; permisosIds: number[] }) => {
    const res = await fetch(`${API}/api/roles`, {
    method:  "POST",
    headers: authHeaders(),
    body:    JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error al crear el rol");
    return res.json();
},

updateRole: async (id: number, data: { nombre: string; descripcion: string; permisosIds: number[] }) => {
    const res = await fetch(`${API}/api/roles/${id}`, {
    method:  "PUT",
    headers: authHeaders(),
    body:    JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error al actualizar el rol");
    return res.json();
},

deleteRole: async (id: number) => {
    const res = await fetch(`${API}/api/roles/${id}`, {
    method:  "DELETE",
    headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Error al eliminar");
    return data;
},
};
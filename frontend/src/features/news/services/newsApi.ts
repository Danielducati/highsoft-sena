// news/services/newsApi.ts
const API = "http://localhost:3001";

const authHeaders = () => ({
"Content-Type": "application/json",
Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
});

// Respuesta cuando hay conflicto de citas
export interface ConflictResponse {
conflict: true;
message:  string;
citas: {
    citaId:        number;
    clienteNombre: string;
    fecha:         string;
    hora:          string;
    servicio:      string;
}[];
}

export const newsApi = {

getAll: async () => {
    const res = await fetch(`${API}/news`, { headers: authHeaders() });
    if (!res.ok) throw new Error("Error al cargar novedades");
    return res.json();
},

getEmployees: async () => {
    const res = await fetch(`${API}/employees`, { headers: authHeaders() });
    if (!res.ok) throw new Error("Error al cargar empleados");
    const data = await res.json();
    return data.map((e: any) => ({
    id:        e.id ?? e.PK_id_empleado,
    name:      `${e.nombre} ${e.apellido}`,
    specialty: e.especialidad ?? "",
    }));
},

// Crear novedad — puede devolver ConflictResponse si hay citas en el período
create: async (formData: any, cancelAppointments?: boolean): Promise<{ ok: boolean } | ConflictResponse> => {
    const res = await fetch(`${API}/news`, {
    method:  "POST",
    headers: authHeaders(),
    body:    JSON.stringify({
        ...formData,
        // Solo incluye cancelAppointments si el usuario ya tomó una decisión
        ...(cancelAppointments !== undefined && { cancelAppointments }),
    }),
    });

    const data = await res.json();

    // 409 = hay conflicto de citas, no es un error — es una respuesta válida
    if (res.status === 409) return data as ConflictResponse;
    if (!res.ok) throw new Error(data.error ?? "Error al crear novedad");
    return data;
},

update: async (id: number, formData: any) => {
    const res = await fetch(`${API}/news/${id}`, {
    method:  "PUT",
    headers: authHeaders(),
    body:    JSON.stringify(formData),
    });
    if (!res.ok) throw new Error("Error al actualizar novedad");
    return res.json();
},

updateStatus: async (id: number, status: string) => {
    const res = await fetch(`${API}/news/${id}/status`, {
    method:  "PATCH",
    headers: authHeaders(),
    body:    JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error("Error al actualizar estado");
    return res.json();
},

remove: async (id: number) => {
    const res = await fetch(`${API}/news/${id}`, {
    method:  "DELETE",
    headers: authHeaders(),
    });
    if (!res.ok) throw new Error("Error al eliminar novedad");
    return res.json();
},
};
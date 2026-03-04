import { API_URL } from "../constants";
import { Employee } from "../types";

const getToken = () => localStorage.getItem("token");

export async function fetchEmployeesApi(): Promise<Employee[]> {
  const res = await fetch(`${API_URL}/employees`);
  if (!res.ok) throw new Error("Error al cargar empleados");
  const data = await res.json();
  return data.map((e: any) => ({
    ...e,
    name:     `${e.nombre} ${e.apellido}`,
    email:    e.correo      || "",
    phone:    e.telefono    || "",
    specialty: e.especialidad || "",
    image:    e.foto_perfil || "",
    isActive: e.Estado === "Activo",
  }));
}

export async function createEmployeeApi(body: any): Promise<void> {
  const res = await fetch(`${API_URL}/employees`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Error al crear empleado");
  }
}

export async function updateEmployeeApi(id: number, body: any): Promise<void> {
  const res = await fetch(`${API_URL}/employees/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Error al actualizar empleado");
  }
}

export async function deleteEmployeeApi(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/employees/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error("Error al eliminar empleado");
}
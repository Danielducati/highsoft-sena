import { API_URL } from "../constants";
import { Service } from "../types";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchServicesApi(): Promise<Service[]> {
  const res = await fetch(`${API_URL}/services?all=true`, {  // ← agrega ?all=true aquí
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Error al cargar servicios");
  const data = await res.json();
  return data.map((s: any) => ({
    id:          s.id,
    name:        s.name,
    description: s.descripcion || "",
    duration:    s.duration,
    price:       s.price,
    category:    s.category || "",
    categoryId:  s.categoryId || 0,
    image:       s.imagen || "",
    isActive:    s.estado === "Activo",
  }));
}

export async function fetchCategoriesApi(): Promise<any[]> {
  const res = await fetch(`${API_URL}/categories?all=true`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Error al cargar categorías");
  const data = await res.json();
  return data.map((cat: any) => ({
    ...cat,
    id:   cat.id ?? cat.PK_id_categoria_servicios,
    name: cat.nombre ?? cat.Nombre,
  }));
}

export async function createServiceApi(body: any): Promise<void> {
  const res = await fetch(`${API_URL}/services`, {
    method:  "POST",
    headers: getAuthHeaders(),
    body:    JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Error al crear servicio");
  }
}   

export async function updateServiceApi(id: number, body: any): Promise<void> {
  const res = await fetch(`${API_URL}/services/${Number(id)}`, {
    method:  "PUT",
    headers: getAuthHeaders(),
    body:    JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Error al actualizar servicio");
}

export async function deleteServiceApi(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/services/${id}`, {
    method:  "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Error al eliminar servicio");
}
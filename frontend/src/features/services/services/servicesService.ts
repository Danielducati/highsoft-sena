import { API_URL } from "../constants";
import { Service } from "../types";

export async function fetchServicesApi(): Promise<Service[]> {
  const res = await fetch(`${API_URL}/services`);
  if (!res.ok) throw new Error("Error al cargar servicios");
  const data = await res.json();
  return data.map((s: any) => ({
    id:          s.id,
    name:        s.name,
    description: s.descripcion || "",
    duration:    s.duration,
    price:       s.price,
    category:    s.category || "",
    categoryId:  s.categoria_id || 0,
    image:       s.imagen || "",
    isActive:    s.isActive,
  }));
}

export async function fetchCategoriesApi(): Promise<any[]> {
  const res = await fetch(`${API_URL}/categories`);
  if (!res.ok) throw new Error("Error al cargar categorías");
  const data = await res.json();
  return data.map((cat: any) => ({
    ...cat,
    id: cat.id ?? cat.PK_id_categoria_servicios,
  }));
}

export async function createServiceApi(body: any): Promise<void> {
  const res = await fetch(`${API_URL}/services`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Error al crear servicio");
}

export async function updateServiceApi(id: number, body: any): Promise<void> {
  const res = await fetch(`${API_URL}/services/${id}`, {
    method:  "PUT",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Error al actualizar servicio");
}

export async function deleteServiceApi(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/services/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Error al eliminar servicio");
}
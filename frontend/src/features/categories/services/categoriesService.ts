import { API_URL } from "../constants";
import { Category, CategoryFormData } from "../types";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
});

export async function fetchCategoriesApi(): Promise<Category[]> {
  const res = await fetch(`${API_URL}/categories`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Error al cargar categorías");
  const data = await res.json();
  return data.map((cat: any) => ({
    id:            cat.PK_id_categoria_servicios,
    name:          cat.Nombre,
    description:   cat.descripcion || "",
    color:         cat.color || "#78D1BD",
    isActive:      cat.Estado === "Activo",
    servicesCount: cat.servicesCount || 0,
  }));
}

export async function createCategoryApi(formData: CategoryFormData): Promise<void> {
  const res = await fetch(`${API_URL}/categories`, {
    method:  "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      Nombre:      formData.name,
      descripcion: formData.description,
      color:       formData.color,
      Estado:      "Activo",
    }),
  });
  if (!res.ok) throw new Error("Error al crear categoría");
}

export async function updateCategoryApi(id: number, formData: Partial<CategoryFormData> & { estado?: string }): Promise<void> {
  const res = await fetch(`${API_URL}/categories/${id}`, {
    method:  "PUT",
    headers: authHeaders(),
    body: JSON.stringify({
      Nombre:      formData.name,
      descripcion: formData.description,
      color:       formData.color,
      Estado:      formData.estado ?? "Activo",
    }),
  });
  if (!res.ok) throw new Error("Error al actualizar categoría");
}

export async function deleteCategoryApi(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/categories/${id}`, {
    method:  "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Error al eliminar categoría");
}
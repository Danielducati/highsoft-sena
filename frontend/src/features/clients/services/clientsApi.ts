import { API_URL } from "../constants";
import { Client, ClientFormData } from "../types";

export const clientsApi = {
  async getAll(): Promise<Client[]> {
    const res = await fetch(`${API_URL}/clients`);
    if (!res.ok) throw new Error("Error al cargar clientes");
    return res.json();
  },

  async create(data: ClientFormData): Promise<Client> {
    const res = await fetch(`${API_URL}/clients`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? "Error al crear cliente");
    }
    return res.json();
  },

  async update(id: number, data: Partial<ClientFormData>): Promise<Client> {
    const res = await fetch(`${API_URL}/clients/${id}`, {
      method:  "PUT",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? "Error al actualizar cliente");
    }
    return res.json();
  },

  async toggleStatus(id: number, isActive: boolean): Promise<void> {
    const res = await fetch(`${API_URL}/clients/${id}/status`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ isActive }),
    });
    if (!res.ok) throw new Error("Error al cambiar estado");
  },

  async remove(id: number): Promise<void> {
    const res = await fetch(`${API_URL}/clients/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Error al eliminar cliente");
  },
};

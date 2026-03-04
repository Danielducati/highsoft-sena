import { API_URL } from "../constants";
import { Quotation, QuotationStatus } from "../types";

const getToken = () => localStorage.getItem("token");

export async function fetchQuotationsApi(): Promise<Quotation[]> {
  const res = await fetch(`${API_URL}/quotations`);
  if (!res.ok) throw new Error("Error al cargar cotizaciones");
  return res.json();
}

export async function fetchClientsApi(): Promise<any[]> {
  const res = await fetch(`${API_URL}/clients`);
  if (!res.ok) throw new Error("Error al cargar clientes");
  return res.json();
}

export async function fetchServicesApi(): Promise<any[]> {
  const res = await fetch(`${API_URL}/services`);
  if (!res.ok) throw new Error("Error al cargar servicios");
  return res.json();
}

export async function createQuotationApi(body: any): Promise<void> {
  const res = await fetch(`${API_URL}/quotations`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Error al crear cotización");
}

export async function updateQuotationApi(id: number, body: any): Promise<void> {
  const res = await fetch(`${API_URL}/quotations/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Error al actualizar cotización");
}

export async function updateQuotationStatusApi(id: number, status: QuotationStatus): Promise<void> {
  const res = await fetch(`${API_URL}/quotations/${id}/estado`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify({ estado: status }),
  });
  if (!res.ok) throw new Error("Error al actualizar estado");
}
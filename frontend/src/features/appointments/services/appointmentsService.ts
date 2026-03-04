import { API_BASE } from "../constants";
import { Appointment } from "../types";
import { mapApiToAppointment } from "../utils";

export async function fetchAppointments(): Promise<Appointment[]> {
  const res = await fetch(`${API_BASE}/appointments`);
  const data = await res.json();
  return data.map(mapApiToAppointment);
}

export async function fetchServices() {
  const res = await fetch(`${API_BASE}/services`);
  return res.json();
}

export async function fetchEmployees() {
  const res = await fetch(`${API_BASE}/employees`);
  return res.json();
}

export async function fetchClients() {
  const res = await fetch(`${API_BASE}/clients`);
  return res.json();
}

export async function createAppointment(payload: any) {
  const res = await fetch(`${API_BASE}/appointments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Error al crear cita");
  }
  return res.json();
}

export async function updateAppointment(id: number, payload: any) {
  const res = await fetch(`${API_BASE}/appointments/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Error al actualizar cita");
  }
  return res.json();
}

export async function deleteAppointment(id: number) {
  const res = await fetch(`${API_BASE}/appointments/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Error al eliminar cita");
  return res.json();
}

export async function cancelAppointment(id: number) {
  const res = await fetch(`${API_BASE}/appointments/${id}/cancel`, { method: "PATCH" });
  if (!res.ok) throw new Error("Error al cancelar cita");
  return res.json();
}

export async function updateAppointmentStatus(id: number, status: Appointment["status"]) {
  const res = await fetch(`${API_BASE}/appointments/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Error al actualizar estado");
  return res.json();
}
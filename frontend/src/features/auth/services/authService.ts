import { API_URL } from "../constants";

export async function loginRequest(correo: string, contrasena: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ correo, contrasena }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al iniciar sesión");
  return data;
}

export async function registerRequest(payload: {
  correo: string;
  contrasena: string;
  nombre: string;
  apellido: string;
  telefono: string;
  tipo_documento: string;
  numero_documento: string;
}) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al registrar usuario");
  return data;
}
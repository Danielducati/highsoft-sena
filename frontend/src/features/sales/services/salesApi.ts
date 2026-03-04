import { API_URL } from "../constants";
import { Appointment, Sale, SaleFormData } from "../types";
import { getToken } from "../utils";

export const salesApi = {
  async getSales(): Promise<Sale[]> {
    const res = await fetch(`${API_URL}/sales`);
    if (!res.ok) throw new Error("Error al cargar ventas");
    return res.json();
    // El backend ahora devuelve directamente los campos que espera el frontend:
    // { Cliente, Servicio, Total, Iva, Subtotal, Fecha, metodo_pago, descuento, Estado }
  },

  async getAppointments(): Promise<Appointment[]> {
    // Usa el endpoint dedicado del modelo de ventas, no el de appointments
    const res = await fetch(`${API_URL}/sales/appointments`);
    if (!res.ok) throw new Error("Error al cargar citas");
    return res.json();
    // El backend devuelve: { id, clientName, service, date, time, status, price, clienteId }
  },

  async getServices(): Promise<any[]> {
    const res = await fetch(`${API_URL}/services`);
    if (!res.ok) throw new Error("Error al cargar servicios");
    const data = await res.json();
    return data.filter((s: any) => s.isActive || s.estado === "Activo");
  },

  async create(formData: SaleFormData, saleType: "appointment" | "direct"): Promise<void> {
    const token = getToken();
    let body: any;

    if (saleType === "appointment") {
      body = {
        tipo:        "cita",
        citaId:      formData.appointmentId,   // el modelo espera citaId
        metodoPago:  formData.paymentMethod,   // el modelo espera metodoPago (camelCase)
        descuento:   parseFloat(formData.discount) || 0,
      };
    } else {
      body = {
        tipo:          "directa",
        clienteNombre: `${formData.clientName} ${formData.apellido_cliente || ""}`.trim(),
        servicios:     formData.selectedServices.map(s => ({
          id:     s.serviceId,
          precio: s.price,
          qty:    s.quantity,
        })),
        metodoPago:    formData.paymentMethod,
        descuento:     parseFloat(formData.discount) || 0,
      };
    }

    const res = await fetch(`${API_URL}/sales`, {
      method:  "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body:    JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Error al registrar venta");
    }
  },
};
// src/models/sales.js
const prisma = require("../config/prisma");

function formatVenta(v) {
return {
    id:         v.id,
    clienteId:  v.clienteId,
    citaId:     v.citaId,
    fecha:      v.fecha?.toISOString().split("T")[0] ?? null,
    subtotal:   v.detalles.reduce((s, d) => s + Number(d.subtotal), 0),
    iva:        Number(v.iva     ?? 0),
    descuento:  Number(v.descuento ?? 0),
    total:      Number(v.total   ?? 0),
    metodoPago: v.metodoPago ?? "",
    estado:     v.estado,
    client: v.cliente ? {
    name:  `${v.cliente.nombre} ${v.cliente.apellido}`,
    phone: v.cliente.telefono ?? "",
    } : null,
    items: v.detalles.map(d => ({
    id:          d.id,
    servicioId:  d.servicioId,
    nombre:      d.servicio?.nombre ?? "Servicio",
    precio:      Number(d.precio),
    cantidad:    d.cantidad,
    subtotal:    Number(d.subtotal),
    empleadoId:  d.empleadoId,
    empleado:    d.empleado
        ? `${d.empleado.nombre} ${d.empleado.apellido}`
        : null,
    })),
};
}

const include = {
cliente: true,
detalles: {
    include: { servicio: true, empleado: true },
},
};

const getAll = async () => {
const ventas = await prisma.venta.findMany({
    include,
    orderBy: { fecha: "desc" },
});
return ventas.map(formatVenta);
};

const getById = async (id) => {
const v = await prisma.venta.findUnique({ where: { id: Number(id) }, include });
return v ? formatVenta(v) : null;
};

// Obtener citas disponibles para convertir en venta
const getAvailableAppointments = async () => {
const citas = await prisma.agendamientoCita.findMany({
    where:   { estado: { in: ["Pendiente", "Confirmada", "Confirmado"] } },
    include: {
    cliente: true,
    detalles: { include: { servicio: true, empleado: true } },
    },
    orderBy: { fecha: "desc" },
});

return citas.map(c => ({
    id:          c.id,
    clienteId:   c.clienteId,
    clientName:  c.cliente ? `${c.cliente.nombre} ${c.cliente.apellido}` : "Sin cliente",
    clientPhone: c.cliente?.telefono ?? "",
    date:        c.fecha.toISOString().split("T")[0],
    time:        c.horario?.toISOString().slice(11, 16) ?? "00:00",
    status:      c.estado,
    service:     c.detalles.map(d => d.servicio?.nombre ?? "").join(", "),
    price:       c.detalles.reduce((s, d) => s + Number(d.precio ?? 0), 0),
}));
};

const create = async ({ tipo, clienteId, clienteNombre, citaId, servicios,
                        descuento, metodoPago }) => {
return prisma.$transaction(async (tx) => {
    let resolvedClienteId = clienteId ? Number(clienteId) : null;
    let items = servicios ?? [];

    // Si es venta por cita, tomar servicios de Agendamiento_detalle
    if (tipo === "cita" && citaId) {
    const detalles = await tx.agendamientoDetalle.findMany({
        where: { citaId: Number(citaId) },
    });
    items = detalles.map(d => ({ id: d.servicioId, precio: d.precio ?? 0, qty: 1 }));

    if (!resolvedClienteId) {
        const cita = await tx.agendamientoCita.findUnique({ where: { id: Number(citaId) } });
        resolvedClienteId = cita?.clienteId ?? null;
    }
    }

    const subtotal = items.reduce((s, i) => s + Number(i.precio ?? 0) * (i.qty ?? 1), 0);
    const iva      = subtotal * 0.19;
    const total    = subtotal + iva - Number(descuento ?? 0);

    const venta = await tx.venta.create({
    data: {
        clienteId:  resolvedClienteId,
        citaId:     citaId ? Number(citaId) : null,
        fecha:      new Date(),
        iva,
        descuento:  descuento ?? 0,
        total,
        metodoPago: metodoPago ?? null,
        estado:     "Activo",
    },
    });

    for (const item of items) {
    const precio   = Number(item.precio ?? 0);
    const cantidad = item.qty ?? 1;
    await tx.ventaDetalle.create({
        data: {
        ventaId:    venta.id,
        servicioId: Number(item.id),
        precio,
        cantidad,
        subtotal:   precio * cantidad,
        },
    });
    }

    // Marcar cita como Completada
    if (tipo === "cita" && citaId) {
    await tx.agendamientoCita.update({
        where: { id: Number(citaId) },
        data:  { estado: "Completada" },
    });
    }

    return venta.id;
});
};

const remove = async (id) => {
return prisma.$transaction(async (tx) => {
    await tx.ventaDetalle.deleteMany({ where: { ventaId: Number(id) } });
    await tx.venta.delete({ where: { id: Number(id) } });
});
};

module.exports = { getAll, getById, getAvailableAppointments, create, remove };
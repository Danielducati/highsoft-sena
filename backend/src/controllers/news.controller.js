// src/controllers/news.controller.js
const prisma = require("../config/prisma");

function formatNovedad(n) {
  const empleado = n.horario?.empleado;
  return {
    id:           n.id,
    employeeId:   String(empleado?.id ?? ""),
    employeeName: empleado ? `${empleado.nombre} ${empleado.apellido}` : "Sin empleado",
    type:         n.tipoNovedad ?? "otro",
    date:         n.fechaInicio ? n.fechaInicio.toISOString().split("T")[0] : "",
    fechaFinal:   n.fechaFinal  ? n.fechaFinal.toISOString().split("T")[0]  : null,
    startTime:    n.horaInicio  ? n.horaInicio.toISOString().slice(11, 16)  : null,
    endTime:      n.horaFinal   ? n.horaFinal.toISOString().slice(11, 16)   : null,
    description:  n.descripcion ?? "",
    status:       n.estado ?? "pendiente",
    createdAt:    n.fechaInicio ? n.fechaInicio.toISOString() : "",
  };
}

const getAll = async (req, res) => {
  try {
    const data = await prisma.novedad.findMany({
      include: { horario: { include: { empleado: true } } },
      orderBy: { fechaInicio: "desc" },
    });
    res.json(data.map(formatNovedad));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const create = async (req, res) => {
  try {
    const { employeeId, type, date, fechaFinal, startTime, endTime, description, cancelAppointments } = req.body;

    if (!employeeId || !date || !description)
      return res.status(400).json({ error: "empleado, fecha y descripción son requeridos" });

    const fechaInicio = new Date(date);
    const fechaFin    = fechaFinal ? new Date(fechaFinal) : fechaInicio;

    // ── Buscar citas del empleado en el rango de fechas ──────────────────────
    // Solo buscamos citas Pendientes o Confirmadas — las ya canceladas/completadas no importan
    const citasConflicto = await prisma.agendamientoDetalle.findMany({
      where: {
        empleadoId: Number(employeeId),
        cita: {
          fecha:  { gte: fechaInicio, lte: fechaFin },
          estado: { in: ["Pendiente", "Confirmada"] },
        },
      },
      include: {
        cita: {
          include: { cliente: true },
        },
        servicio: true,
      },
    });

    // ── Si hay conflictos y el frontend no decidió qué hacer ─────────────────
    // cancelAppointments puede ser: undefined (primera llamada), true, o false
    if (citasConflicto.length > 0 && cancelAppointments === undefined) {
      const citas = citasConflicto.map(d => ({
        citaId:        d.citaId,
        clienteNombre: d.cita.cliente
          ? `${d.cita.cliente.nombre} ${d.cita.cliente.apellido}`
          : "Sin cliente",
        fecha:         d.cita.fecha.toISOString().split("T")[0],
        hora:          d.cita.horario?.toISOString().slice(11, 16) ?? "—",
        servicio:      d.servicio?.nombre ?? "Servicio",
      }));

      // 409 Conflict — hay citas, el frontend decide qué hacer
      return res.status(409).json({
        conflict: true,
        message:  `El empleado tiene ${citas.length} cita(s) en ese período`,
        citas,
      });
    }

    // ── Si el frontend eligió cancelar las citas ─────────────────────────────
    if (cancelAppointments === true && citasConflicto.length > 0) {
      const citaIds = [...new Set(citasConflicto.map(d => d.citaId))];
      await prisma.agendamientoCita.updateMany({
        where: { id: { in: citaIds } },
        data:  { estado: "Cancelada" },
      });
    }
    // Si cancelAppointments === false → simplemente no cancela nada y sigue

    // ── Crear o reutilizar horario ────────────────────────────────────────────
    let horario = await prisma.horario.findFirst({
      where: { empleadoId: Number(employeeId), fecha: fechaInicio },
    });

    if (!horario) {
      horario = await prisma.horario.create({
        data: {
          empleadoId: Number(employeeId),
          fecha:      fechaInicio,
          horaInicio: new Date(`1970-01-01T${startTime || "08:00"}:00`),
          horaFinal:  new Date(`1970-01-01T${endTime   || "17:00"}:00`),
          diaSemana:  fechaInicio.toLocaleDateString("es-ES", { weekday: "long" }),
        },
      });
    }

    const novedad = await prisma.novedad.create({
      data: {
        horarioId:   horario.id,
        tipoNovedad: type        ?? "otro",
        descripcion: description,
        fechaInicio,
        fechaFinal:  fechaFinal  ? new Date(fechaFinal) : null,
        horaInicio:  startTime   ? new Date(`1970-01-01T${startTime}:00`) : null,
        horaFinal:   endTime     ? new Date(`1970-01-01T${endTime}:00`)   : null,
        estado:      "pendiente",
      },
    });

    res.status(201).json({ ok: true, id: novedad.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const update = async (req, res) => {
  try {
    const { type, date, fechaFinal, startTime, endTime, description } = req.body;

    await prisma.novedad.update({
      where: { id: Number(req.params.id) },
      data: {
        tipoNovedad: type        ?? undefined,
        descripcion: description ?? undefined,
        fechaInicio: date        ? new Date(date)       : undefined,
        fechaFinal:  fechaFinal  ? new Date(fechaFinal) : null,
        horaInicio:  startTime   ? new Date(`1970-01-01T${startTime}:00`) : null,
        horaFinal:   endTime     ? new Date(`1970-01-01T${endTime}:00`)   : null,
      },
    });

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    await prisma.novedad.update({
      where: { id: Number(req.params.id) },
      data:  { estado: status },
    });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const remove = async (req, res) => {
  try {
    await prisma.novedad.delete({ where: { id: Number(req.params.id) } });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAll, create, update, updateStatus, remove };
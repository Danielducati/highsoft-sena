const express = require("express");
const router  = express.Router();
const prisma  = require("../config/prisma");

// Mapeo frontend → BD
const TIPO_MAP = {
incapacidad: "incapacidad",
retraso:     "retraso",
permiso:     "permiso",
percance:    "percance",
ausencia:    "ausencia",
otro:        "otro",
};

const ESTADO_MAP = {
pendiente: "Activo",
aprobada:  "Activo",
rechazada: "Activo",
resuelta:  "Activo",
};

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
    status:       n.estado === "Activo" ? "pendiente" : n.estado,
    createdAt:    n.fechaInicio ? n.fechaInicio.toISOString() : "",
};
}

// GET /news — devuelve todas las novedades
router.get("/", async (req, res) => {
try {
    const data = await prisma.novedad.findMany({
    include: { horario: { include: { empleado: true } } },
    orderBy: { fechaInicio: "desc" },
    });
    res.json(data.map(formatNovedad));
} catch (err) {
    res.status(500).json({ error: err.message });
}
});

// POST /news — crear novedad
// El frontend manda: employeeId, type, date, fechaFinal, startTime, endTime, description, status
router.post("/", async (req, res) => {
try {
    const { employeeId, type, date, fechaFinal, startTime, endTime, description } = req.body;

    if (!employeeId || !date || !description)
    return res.status(400).json({ error: "empleado, fecha y descripción son requeridos" });

    // Buscar o crear horario del empleado para esa fecha
    let horario = await prisma.horario.findFirst({
    where: { empleadoId: Number(employeeId), fecha: new Date(date) },
    });

    if (!horario) {
    horario = await prisma.horario.create({
        data: {
        empleadoId: Number(employeeId),
        fecha:      new Date(date),
        horaInicio: new Date(`1970-01-01T${startTime || "08:00"}:00`),
        horaFinal:  new Date(`1970-01-01T${endTime   || "17:00"}:00`),
        diaSemana:  new Date(date).toLocaleDateString("es-ES", { weekday: "long" }),
        },
    });
    }

    const novedad = await prisma.novedad.create({
    data: {
        horarioId:   horario.id,
        tipoNovedad: type ?? "otro",
        descripcion: description,
        fechaInicio: new Date(date),
        fechaFinal:  fechaFinal ? new Date(fechaFinal) : null,
        horaInicio:  startTime  ? new Date(`1970-01-01T${startTime}:00`) : null,
        horaFinal:   endTime    ? new Date(`1970-01-01T${endTime}:00`)   : null,
        estado:      "Activo",
    },
    include: { horario: { include: { empleado: true } } },
    });

    res.status(201).json({ ok: true, id: novedad.id });
} catch (err) {
    res.status(500).json({ error: err.message });
}
});

// PUT /news/:id — editar novedad
router.put("/:id", async (req, res) => {
try {
    const { type, date, fechaFinal, startTime, endTime, description, status } = req.body;

    await prisma.novedad.update({
    where: { id: Number(req.params.id) },
    data: {
        tipoNovedad: type        ?? undefined,
        descripcion: description ?? undefined,
        fechaInicio: date        ? new Date(date)        : undefined,
        fechaFinal:  fechaFinal  ? new Date(fechaFinal)  : null,
        horaInicio:  startTime   ? new Date(`1970-01-01T${startTime}:00`) : null,
        horaFinal:   endTime     ? new Date(`1970-01-01T${endTime}:00`)   : null,
    },
    });

    res.json({ ok: true });
} catch (err) {
    res.status(500).json({ error: err.message });
}
});

// PATCH /news/:id/status — cambiar estado
router.patch("/:id/status", async (req, res) => {
try {
    const { status } = req.body;
    await prisma.novedad.update({
    where: { id: Number(req.params.id) },
    data:  { estado: status ?? "Activo" },
    });
    res.json({ ok: true });
} catch (err) {
    res.status(500).json({ error: err.message });
}
});

// DELETE /news/:id
router.delete("/:id", async (req, res) => {
try {
    await prisma.novedad.delete({ where: { id: Number(req.params.id) } });
    res.json({ ok: true });
} catch (err) {
    res.status(500).json({ error: err.message });
}
});

module.exports = router;
const express = require("express");
const router = express.Router();
const { pool, sql } = require("../config/db");

// Mapeo de tipos frontend → BD y viceversa
const tipoMap = {
incapacidad: "Incapacidad",
retraso:     "Retraso",
permiso:     "Permiso",
percance:    "Percance",
ausencia:    "Ausencia",
otro:        "Otro",
};
const tipoMapInverse = Object.fromEntries(Object.entries(tipoMap).map(([k, v]) => [v.toLowerCase(), k]));

const estadoMap = {
pendiente: "Activo",   // BD usa "Activo" como pendiente
aprobada:  "Aprobada",
rechazada: "Rechazada",
resuelta:  "Resuelta",
};
const estadoMapInverse = {
activo:    "pendiente",
aprobada:  "aprobada",
rechazada: "rechazada",
resuelta:  "resuelta",
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /novedades
// ─────────────────────────────────────────────────────────────────────────────
router.get("/", async (req, res) => {
try {
    const connection = await pool;
    const result = await connection.request().query(`
    SELECT
        n.PK_id_novedad                       AS id,
        n.FK_id_empleado                      AS empleado_id,
        e.nombre + ' ' + e.apellido           AS empleado_nombre,
        LOWER(ISNULL(n.tipo_novedad, 'otro')) AS tipo,
        CONVERT(VARCHAR(10), n.fecha_inicio, 23) AS fecha_inicio,
        CONVERT(VARCHAR(10), n.fecha_final,  23) AS fecha_final,
        CONVERT(VARCHAR(5),  n.hora_inicio, 108) AS hora_inicio,
        CONVERT(VARCHAR(5),  n.hora_final,  108) AS hora_final,
        ISNULL(n.descripcion, '')             AS descripcion,
        LOWER(ISNULL(n.Estado, 'activo'))     AS estado
    FROM Novedades n
    JOIN Empleado e ON e.PK_id_empleado = n.FK_id_empleado
    ORDER BY n.fecha_inicio DESC
    `);

    const novedades = result.recordset.map(row => ({
    id:           row.id,
    employeeId:   String(row.empleado_id),
    employeeName: row.empleado_nombre,
    type:         tipoMapInverse[row.tipo]  ?? "otro",
    date:         row.fecha_inicio          ?? "",
    fechaFinal:   row.fecha_final           ?? "",
    startTime:    row.hora_inicio           ?? "",
    endTime:      row.hora_final            ?? "",
    description:  row.descripcion,
    status:       estadoMapInverse[row.estado] ?? "pendiente",
    createdAt:    row.fecha_inicio          ?? "",
    }));

    res.json(novedades);
} catch (err) {
    console.error("Error GET /news:", err);
    res.status(500).json({ error: err.message });
}
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /novedades
// ─────────────────────────────────────────────────────────────────────────────
router.post("/", async (req, res) => {
const { employeeId, type, date, fechaFinal, startTime, endTime, description, status } = req.body;

if (!employeeId || !type || !date || !description) {
    return res.status(400).json({ error: "empleado, tipo, fecha y descripción son requeridos" });
}

try {
    const connection = await pool;
    const result = await connection.request()
    .input("empleado",    sql.Int,          Number(employeeId))
    .input("tipo",        sql.VarChar(100), tipoMap[type]          ?? "Otro")
    .input("descripcion", sql.VarChar(600), description)
    .input("fechaInicio", sql.Date,         new Date(date))
    .input("fechaFinal",  sql.Date,         fechaFinal ? new Date(fechaFinal) : null)
    .input("horaInicio",  sql.VarChar(5),   startTime || null)
    .input("horaFinal",   sql.VarChar(5),   endTime   || null)
    .input("estado",      sql.VarChar(30),  estadoMap[status]      ?? "Activo")
    .query(`
        INSERT INTO Novedades
        (FK_id_empleado, tipo_novedad, descripcion, fecha_inicio, fecha_final, hora_inicio, hora_final, Estado)
        OUTPUT INSERTED.PK_id_novedad
        VALUES (@empleado, @tipo, @descripcion, @fechaInicio, @fechaFinal, @horaInicio, @horaFinal, @estado)
    `);

    res.status(201).json({ ok: true, id: result.recordset[0].PK_id_novedad });
} catch (err) {
    console.error("Error POST /novedades:", err);
    res.status(500).json({ error: err.message });
}
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /novedades/:id
// ─────────────────────────────────────────────────────────────────────────────
router.put("/:id", async (req, res) => {
const { employeeId, type, date, fechaFinal, startTime, endTime, description, status } = req.body;

try {
    const connection = await pool;
    await connection.request()
    .input("id",          sql.Int,          Number(req.params.id))
    .input("empleado",    sql.Int,          Number(employeeId))
    .input("tipo",        sql.VarChar(100), tipoMap[type]          ?? "Otro")
    .input("descripcion", sql.VarChar(600), description)
    .input("fechaInicio", sql.Date,         new Date(date))
    .input("fechaFinal",  sql.Date,         fechaFinal ? new Date(fechaFinal) : null)
    .input("horaInicio",  sql.VarChar(5),   startTime || null)
    .input("horaFinal",   sql.VarChar(5),   endTime   || null)
    .input("estado",      sql.VarChar(30),  estadoMap[status]      ?? "Activo")
    .query(`
        UPDATE Novedades SET
        FK_id_empleado = @empleado,
        tipo_novedad   = @tipo,
        descripcion    = @descripcion,
        fecha_inicio   = @fechaInicio,
        fecha_final    = @fechaFinal,
        hora_inicio    = @horaInicio,
        hora_final     = @horaFinal,
        Estado         = @estado
        WHERE PK_id_novedad = @id
    `);

    res.json({ ok: true });
} catch (err) {
    console.error("Error PUT /novedades/:id:", err);
    res.status(500).json({ error: err.message });
}
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /novedades/:id/status
// ─────────────────────────────────────────────────────────────────────────────
router.patch("/:id/status", async (req, res) => {
const estadoDB = estadoMap[req.body.status];
if (!estadoDB) return res.status(400).json({ error: "Estado inválido" });

try {
    const connection = await pool;
    await connection.request()
    .input("id",     sql.Int,         Number(req.params.id))
    .input("estado", sql.VarChar(30), estadoDB)
    .query(`UPDATE Novedades SET Estado = @estado WHERE PK_id_novedad = @id`);

    res.json({ ok: true });
} catch (err) {
    console.error("Error PATCH /novedades/:id/status:", err);
    res.status(500).json({ error: err.message });
}
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /novedades/:id
// ─────────────────────────────────────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
try {
    const connection = await pool;
    await connection.request()
    .input("id", sql.Int, Number(req.params.id))
    .query(`DELETE FROM Novedades WHERE PK_id_novedad = @id`);

    res.json({ ok: true });
} catch (err) {
    console.error("Error DELETE /novedades/:id:", err);
    res.status(500).json({ error: err.message });
}
});

module.exports = router;
const express = require("express");
const router = express.Router();
const { pool, sql } = require("../config/db");

const DIAS = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];
const DIAS_INDEX = { "lunes":0,"martes":1,"miércoles":2,"miercoles":2,"jueves":3,"viernes":4,"sábado":5,"sabado":5,"domingo":6 };

// ─────────────────────────────────────────────────────────────────────────────
// GET /schedules
// Devuelve horarios agrupados por empleado + semana (lunes)
// ─────────────────────────────────────────────────────────────────────────────
router.get("/", async (req, res) => {
try {
    const connection = await pool;
    const result = await connection.request().query(`
    SELECT
        h.id_horario,
        h.FK_id_empleado                        AS empleado_id,
        e.nombre + ' ' + e.apellido             AS empleado_nombre,
        e.especialidad                           AS empleado_especialidad,
        CONVERT(VARCHAR(10), h.fecha, 23)        AS fecha,
        LOWER(ISNULL(h.dia_semana, ''))          AS dia_semana,
        CONVERT(VARCHAR(5), h.hora_inicio, 108)  AS hora_inicio,
        CONVERT(VARCHAR(5), h.hora_final,  108)  AS hora_final
    FROM Horarios h
    JOIN Empleado e ON e.PK_id_empleado = h.FK_id_empleado
    ORDER BY h.fecha ASC, h.hora_inicio ASC
    `);

    // Agrupar por empleado + lunes de la semana
    const gruposMap = new Map();

    for (const row of result.recordset) {
    const fecha   = new Date(row.fecha + "T00:00:00");
    const dia     = fecha.getDay(); // 0=dom,1=lun,...
    const diff    = dia === 0 ? -6 : 1 - dia;
    const lunes   = new Date(fecha);
    lunes.setDate(fecha.getDate() + diff);
    const lunesStr = lunes.toISOString().split("T")[0];

    const key = `${row.empleado_id}_${lunesStr}`;

    if (!gruposMap.has(key)) {
        gruposMap.set(key, {
        id:                `${row.empleado_id}_${lunesStr}`,
        employeeId:        String(row.empleado_id),
        employeeName:      row.empleado_nombre,
        employeeSpecialty: row.empleado_especialidad ?? "",
        weekStartDate:     lunesStr,
        isActive:          true,
        daySchedules:      [],
        });
    }

    const dayIndex = DIAS_INDEX[row.dia_semana] ?? (fecha.getDay() === 0 ? 6 : fecha.getDay() - 1);

    gruposMap.get(key).daySchedules.push({
        id:        row.id_horario,
        dayIndex,
        fecha:     row.fecha,
        startTime: row.hora_inicio,
        endTime:   row.hora_final,
    });
    }

    res.json([...gruposMap.values()]);
} catch (err) {
    console.error("Error GET /schedules:", err);
    res.status(500).json({ error: err.message });
}
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /schedules
// Body: { employeeId, weekStartDate, daySchedules: [{dayIndex, startTime, endTime}] }
// ─────────────────────────────────────────────────────────────────────────────
router.post("/", async (req, res) => {
const { employeeId, weekStartDate, daySchedules } = req.body;

if (!employeeId || !weekStartDate || !Array.isArray(daySchedules) || daySchedules.length === 0) {
    return res.status(400).json({ error: "employeeId, weekStartDate y al menos un día son requeridos" });
}

try {
    const connection = await pool;
    const ids = [];

    for (const ds of daySchedules) {
    const lunes = new Date(weekStartDate + "T00:00:00");
    const fecha = new Date(lunes);
    fecha.setDate(lunes.getDate() + ds.dayIndex);
    const fechaStr  = fecha.toISOString().split("T")[0];
    const diaNombre = DIAS[ds.dayIndex] ?? "Lunes";

    const result = await connection.request()
        .input("empleado",   sql.Int,         Number(employeeId))
        .input("horaInicio", sql.VarChar(8),  ds.startTime)
        .input("horaFinal",  sql.VarChar(8),  ds.endTime)
        .input("fecha",      sql.Date,        new Date(fechaStr))
        .input("dia",        sql.VarChar(20), diaNombre)
        .query(`
        INSERT INTO Horarios (FK_id_empleado, hora_inicio, hora_final, fecha, dia_semana)
        OUTPUT INSERTED.id_horario
        VALUES (@empleado, @horaInicio, @horaFinal, @fecha, @dia)
        `);

    ids.push(result.recordset[0].id_horario);
    }

    res.status(201).json({ ok: true, ids });
} catch (err) {
    console.error("Error POST /schedules:", err);
    res.status(500).json({ error: err.message });
}
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /schedules/:employeeId/:weekStart
// Reemplaza todos los horarios de un empleado en una semana
// ─────────────────────────────────────────────────────────────────────────────
router.put("/:employeeId/:weekStart", async (req, res) => {
const { employeeId, weekStart } = req.params;
const { daySchedules } = req.body;

try {
    const connection = await pool;

    // Calcular fechas de la semana
    const lunes   = new Date(weekStart + "T00:00:00");
    const domingo = new Date(lunes);
    domingo.setDate(lunes.getDate() + 6);

    // Borrar horarios existentes de esa semana
    await connection.request()
    .input("emp",   sql.Int,  Number(employeeId))
    .input("lunes", sql.Date, lunes)
    .input("dom",   sql.Date, domingo)
    .query(`
        DELETE FROM Horarios
        WHERE FK_id_empleado = @emp
        AND fecha BETWEEN @lunes AND @dom
    `);

    // Insertar los nuevos
    for (const ds of daySchedules) {
    const fecha = new Date(lunes);
    fecha.setDate(lunes.getDate() + ds.dayIndex);
    const fechaStr  = fecha.toISOString().split("T")[0];
    const diaNombre = DIAS[ds.dayIndex] ?? "Lunes";

    await connection.request()
        .input("empleado",   sql.Int,         Number(employeeId))
        .input("horaInicio", sql.VarChar(8),  ds.startTime)
        .input("horaFinal",  sql.VarChar(8),  ds.endTime)
        .input("fecha",      sql.Date,        new Date(fechaStr))
        .input("dia",        sql.VarChar(20), diaNombre)
        .query(`
        INSERT INTO Horarios (FK_id_empleado, hora_inicio, hora_final, fecha, dia_semana)
        VALUES (@empleado, @horaInicio, @horaFinal, @fecha, @dia)
        `);
    }

    res.json({ ok: true });
} catch (err) {
    console.error("Error PUT /schedules:", err);
    res.status(500).json({ error: err.message });
}
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /schedules/:employeeId/:weekStart
// Elimina todos los horarios de un empleado en una semana
// ─────────────────────────────────────────────────────────────────────────────
router.delete("/:employeeId/:weekStart", async (req, res) => {
const { employeeId, weekStart } = req.params;

try {
    const connection = await pool;
    const lunes   = new Date(weekStart + "T00:00:00");
    const domingo = new Date(lunes);
    domingo.setDate(lunes.getDate() + 6);

    await connection.request()
    .input("emp",   sql.Int,  Number(employeeId))
    .input("lunes", sql.Date, lunes)
    .input("dom",   sql.Date, domingo)
    .query(`
        DELETE FROM Horarios
        WHERE FK_id_empleado = @emp
        AND fecha BETWEEN @lunes AND @dom
    `);

    res.json({ ok: true });
} catch (err) {
    console.error("Error DELETE /schedules:", err);
    res.status(500).json({ error: err.message });
}
});

module.exports = router;
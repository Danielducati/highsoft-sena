const express = require("express");
const router = express.Router();
const { pool } = require("../config/db");

// ─────────────────────────────────────────────────────────────────────────────
// GET /dashboard?period=30days|7days|90days|year
// ─────────────────────────────────────────────────────────────────────────────
router.get("/", async (req, res) => {
try {
    const connection = await pool;
    const { period = "30days" } = req.query;

    // Calcular fecha de inicio según período
    const periodDays = { "7days": 7, "30days": 30, "90days": 90, "year": 365 };
    const days = periodDays[period] || 30;

    // ── Stats cards ──────────────────────────────────────────────────────────

    // Ventas totales del período
    const ventasResult = await connection.request().query(`
    SELECT ISNULL(SUM(Total), 0) AS total
    FROM Venta_encabezado
    WHERE Estado = 'Activo'
        AND Fecha >= DATEADD(DAY, -${days}, GETDATE())
    `);

    // Ventas período anterior (para calcular % cambio)
    const ventasAntResult = await connection.request().query(`
    SELECT ISNULL(SUM(Total), 0) AS total
    FROM Venta_encabezado
    WHERE Estado = 'Activo'
        AND Fecha >= DATEADD(DAY, -${days * 2}, GETDATE())
        AND Fecha <  DATEADD(DAY, -${days},     GETDATE())
    `);

    // Clientes activos
    const clientesResult = await connection.request().query(`
    SELECT COUNT(*) AS total FROM Cliente WHERE Estado = 'Activo'
    `);

    // Clientes período anterior
    const clientesAntResult = await connection.request().query(`
    SELECT COUNT(*) AS total
    FROM Cliente
    WHERE Estado = 'Activo'
        AND PK_id_cliente NOT IN (
        SELECT PK_id_cliente FROM Cliente
        WHERE Estado = 'Activo'
            AND PK_id_cliente > (
            SELECT ISNULL(MAX(PK_id_cliente) - COUNT(*) * 0.1, 0) FROM Cliente WHERE Estado = 'Activo'
            )
        )
    `);

    // Citas del período
    const citasResult = await connection.request().query(`
    SELECT COUNT(*) AS total
    FROM Agendamiento_citas
    WHERE Fecha >= DATEADD(DAY, -${days}, GETDATE())
    `);

    // Citas período anterior
    const citasAntResult = await connection.request().query(`
    SELECT COUNT(*) AS total
    FROM Agendamiento_citas
    WHERE Fecha >= DATEADD(DAY, -${days * 2}, GETDATE())
        AND Fecha <  DATEADD(DAY, -${days},     GETDATE())
    `);

    // Servicios completados del período
    const completadasResult = await connection.request().query(`
    SELECT COUNT(*) AS total
    FROM Agendamiento_citas
    WHERE Estado = 'Completada'
        AND Fecha >= DATEADD(DAY, -${days}, GETDATE())
    `);

    // Servicios completados período anterior
    const completadasAntResult = await connection.request().query(`
    SELECT COUNT(*) AS total
    FROM Agendamiento_citas
    WHERE Estado = 'Completada'
        AND Fecha >= DATEADD(DAY, -${days * 2}, GETDATE())
        AND Fecha <  DATEADD(DAY, -${days},     GETDATE())
    `);

    // ── Gráfica ventas por mes (últimos 6 meses siempre) ────────────────────
    const ventasMesResult = await connection.request().query(`
    SELECT
        FORMAT(Fecha, 'MMM', 'es-ES') AS mes,
        MONTH(Fecha)                  AS numMes,
        YEAR(Fecha)                   AS anio,
        ISNULL(SUM(Total), 0)         AS ventas,
        COUNT(*)                      AS servicios
    FROM Venta_encabezado
    WHERE Estado = 'Activo'
        AND Fecha >= DATEADD(MONTH, -6, GETDATE())
    GROUP BY FORMAT(Fecha, 'MMM', 'es-ES'), MONTH(Fecha), YEAR(Fecha)
    ORDER BY anio ASC, numMes ASC
    `);

    // ── Distribución de servicios (top 5 por apariciones en citas) ──────────
    const serviciosResult = await connection.request().query(`
    SELECT TOP 5
        s.nombre    AS name,
        COUNT(*)    AS value,
        ISNULL(SUM(ad.Precio), 0) AS revenue
    FROM Agendamiento_detalle ad
    JOIN Servicio s ON s.PK_id_servicio = ad.FK_id_servicios
    JOIN Agendamiento_citas ac ON ac.PK_id_cita = ad.FK_id_agendamiento_cita
    WHERE ac.Fecha >= DATEADD(DAY, -${days}, GETDATE())
    GROUP BY s.PK_id_servicio, s.nombre
    ORDER BY value DESC
    `);

    // ── Calcular porcentajes de cambio ───────────────────────────────────────
    const calcChange = (current, previous) => {
    if (!previous || previous === 0) return current > 0 ? "+100%" : "0%";
    const pct = ((current - previous) / previous) * 100;
    return (pct >= 0 ? "+" : "") + pct.toFixed(1) + "%";
    };

    const ventas          = parseFloat(ventasResult.recordset[0].total);
    const ventasAnt       = parseFloat(ventasAntResult.recordset[0].total);
    const clientes        = clientesResult.recordset[0].total;
    const citas           = citasResult.recordset[0].total;
    const citasAnt        = citasAntResult.recordset[0].total;
    const completadas     = completadasResult.recordset[0].total;
    const completadasAnt  = completadasAntResult.recordset[0].total;

    res.json({
    stats: {
        ventasTotales:        ventas,
        ventasChange:         calcChange(ventas, ventasAnt),
        clientesActivos:      clientes,
        citasDelPeriodo:      citas,
        citasChange:          calcChange(citas, citasAnt),
        serviciosCompletados: completadas,
        serviciosChange:      calcChange(completadas, completadasAnt),
    },
    salesData:    ventasMesResult.recordset.map(r => ({
        month:     r.mes.charAt(0).toUpperCase() + r.mes.slice(1, 3),
        ventas:    parseFloat(r.ventas),
        servicios: r.servicios,
    })),
    servicesData: serviciosResult.recordset.map(r => ({
        name:    r.name,
        value:   r.value,
        revenue: parseFloat(r.revenue),
    })),
    });

} catch (err) {
    console.error("Error GET /dashboard:", err);
    res.status(500).json({ error: err.message });
}
});

module.exports = router;
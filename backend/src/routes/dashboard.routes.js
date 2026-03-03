const express = require("express");
const router  = express.Router();
const prisma  = require("../config/prisma");

// Helpers de fecha según período
function getDateFilter(period) {
  const now = new Date();
  const desde = new Date();
  if (period === "7days")  desde.setDate(now.getDate() - 7);
  else if (period === "30days") desde.setDate(now.getDate() - 30);
  else if (period === "90days") desde.setDate(now.getDate() - 90);
  else if (period === "year")   desde.setFullYear(now.getFullYear(), 0, 1);
  else desde.setDate(now.getDate() - 30);
  return desde;
}

function getPreviousDateFilter(period) {
  const desde = getDateFilter(period);
  const anterior = new Date(desde);
  const diff = new Date() - desde;
  anterior.setTime(desde.getTime() - diff);
  return anterior;
}

function calcChange(current, previous) {
  if (previous === 0) return current > 0 ? "+100%" : "0%";
  const pct = ((current - previous) / previous * 100).toFixed(1);
  return pct >= 0 ? `+${pct}%` : `${pct}%`;
}

router.get("/", async (req, res) => {
  try {
    const period  = req.query.period || "30days";
    const desde   = getDateFilter(period);
    const anterior = getPreviousDateFilter(period);

    // ── Stats actuales ────────────────────────────────────────────────────────
    const [
      clientesActivos,
      citasActuales,
      serviciosCompletados,
      ventasActuales,
      // Período anterior para comparar
      citasAnteriores,
      serviciosAnteriores,
      ventasAnteriores,
    ] = await Promise.all([
      prisma.cliente.count({ where: { estado: "Activo" } }),
      prisma.agendamientoCita.count({ where: { fecha: { gte: desde } } }),
      prisma.agendamientoCita.count({ where: { estado: "Completada", fecha: { gte: desde } } }),
      prisma.venta.findMany({ where: { fecha: { gte: desde } }, select: { total: true } }),
      prisma.agendamientoCita.count({ where: { fecha: { gte: anterior, lt: desde } } }),
      prisma.agendamientoCita.count({ where: { estado: "Completada", fecha: { gte: anterior, lt: desde } } }),
      prisma.venta.findMany({ where: { fecha: { gte: anterior, lt: desde } }, select: { total: true } }),
    ]);

    const ventasTotales    = ventasActuales.reduce((s, v) => s + Number(v.total ?? 0), 0);
    const ventasAntTotal   = ventasAnteriores.reduce((s, v) => s + Number(v.total ?? 0), 0);

    // ── Sales data — ventas agrupadas por mes ─────────────────────────────────
    const ventasPorMes = await prisma.venta.findMany({
      where:  { fecha: { gte: desde } },
      select: { fecha: true, total: true },
      orderBy: { fecha: "asc" },
    });

    const salesMap = new Map();
    for (const v of ventasPorMes) {
      if (!v.fecha) continue;
      const key = v.fecha.toISOString().slice(0, 7); // "2025-03"
      const label = new Date(v.fecha).toLocaleDateString("es-ES", { month: "short", year: "2-digit" });
      if (!salesMap.has(key)) salesMap.set(key, { month: label, ventas: 0, servicios: 0 });
      salesMap.get(key).ventas    += Number(v.total ?? 0);
      salesMap.get(key).servicios += 1;
    }
    const salesData = [...salesMap.values()];

    // ── Services data — top 5 servicios más solicitados ───────────────────────
    const detalles = await prisma.agendamientoDetalle.findMany({
      where:   { cita: { fecha: { gte: desde } } },
      include: { servicio: true },
    });

    const servMap = new Map();
    for (const d of detalles) {
      const nombre = d.servicio?.nombre ?? "Otro";
      if (!servMap.has(nombre)) servMap.set(nombre, { name: nombre, value: 0, revenue: 0 });
      servMap.get(nombre).value   += 1;
      servMap.get(nombre).revenue += Number(d.precio ?? 0);
    }
    const servicesData = [...servMap.values()]
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // ── Respuesta final ───────────────────────────────────────────────────────
    res.json({
      stats: {
        ventasTotales,
        ventasChange:         calcChange(ventasTotales, ventasAntTotal),
        clientesActivos,
        citasDelPeriodo:      citasActuales,
        citasChange:          calcChange(citasActuales, citasAnteriores),
        serviciosCompletados,
        serviciosChange:      calcChange(serviciosCompletados, serviciosAnteriores),
      },
      salesData:    salesData.length    > 0 ? salesData    : [],
      servicesData: servicesData.length > 0 ? servicesData : [],
    });

  } catch (err) {
    console.error("Error dashboard:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
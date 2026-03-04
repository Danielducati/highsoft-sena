// src/controllers/dashboard.controller.js
const prisma = require("../config/prisma");

function getDateFilter(period) {
  const desde = new Date();
  if      (period === "7days")  desde.setDate(desde.getDate() - 7);
  else if (period === "30days") desde.setDate(desde.getDate() - 30);
  else if (period === "90days") desde.setDate(desde.getDate() - 90);
  else if (period === "year")   desde.setFullYear(desde.getFullYear(), 0, 1);
  else                          desde.setDate(desde.getDate() - 30);
  return desde;
}

function calcChange(current, previous) {
  if (previous === 0) return current > 0 ? "+100%" : "0%";
  const pct = ((current - previous) / previous * 100).toFixed(1);
  return Number(pct) >= 0 ? `+${pct}%` : `${pct}%`;
}

const getStats = async (req, res) => {
  try {
    const period  = req.query.period || "30days";
    const desde   = getDateFilter(period);
    const anterior = new Date(desde.getTime() - (new Date() - desde));

    const [
      clientesActivos,
      citasActuales, serviciosCompletados, ventasActuales,
      citasAnteriores, serviciosAnteriores, ventasAnteriores,
    ] = await Promise.all([
      prisma.cliente.count({ where: { estado: "Activo" } }),
      prisma.agendamientoCita.count({ where: { fecha: { gte: desde } } }),
      prisma.agendamientoCita.count({ where: { estado: "Completada", fecha: { gte: desde } } }),
      prisma.venta.findMany({ where: { fecha: { gte: desde } }, select: { total: true } }),
      prisma.agendamientoCita.count({ where: { fecha: { gte: anterior, lt: desde } } }),
      prisma.agendamientoCita.count({ where: { estado: "Completada", fecha: { gte: anterior, lt: desde } } }),
      prisma.venta.findMany({ where: { fecha: { gte: anterior, lt: desde } }, select: { total: true } }),
    ]);

    const ventasTotales  = ventasActuales.reduce((s, v) => s + Number(v.total ?? 0), 0);
    const ventasAntTotal = ventasAnteriores.reduce((s, v) => s + Number(v.total ?? 0), 0);

    // Sales por mes
    const ventasPorMes = await prisma.venta.findMany({
      where:   { fecha: { gte: desde } },
      select:  { fecha: true, total: true },
      orderBy: { fecha: "asc" },
    });

    const salesMap = new Map();
    for (const v of ventasPorMes) {
      if (!v.fecha) continue;
      const key   = v.fecha.toISOString().slice(0, 7);
      const label = new Date(v.fecha).toLocaleDateString("es-ES", { month: "short", year: "2-digit" });
      if (!salesMap.has(key)) salesMap.set(key, { month: label, ventas: 0, servicios: 0 });
      salesMap.get(key).ventas    += Number(v.total ?? 0);
      salesMap.get(key).servicios += 1;
    }

    // Top 5 servicios
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
      salesData:    [...salesMap.values()],
      servicesData: [...servMap.values()].sort((a, b) => b.value - a.value).slice(0, 5),
    });

  } catch (err) {
    console.error("Error dashboard:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getStats };

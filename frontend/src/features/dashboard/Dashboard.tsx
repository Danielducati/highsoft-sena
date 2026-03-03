import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../shared/ui/card";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, DollarSign, Users, Calendar, ArrowUp, ArrowDown, Download, Sparkles, Filter, CheckCircle } from "lucide-react";
import { Button } from "../../shared/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../shared/ui/select";
import { Badge } from "../../shared/ui/badge";
import { toast } from "sonner";

const API_BASE = "http://localhost:3001";
const COLORS = ["#78D1BD", "#A78BFA", "#60A5FA", "#FBBF24", "#F87171"];

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface DashboardData {
  stats: {
    ventasTotales:        number;
    ventasChange:         string;
    clientesActivos:      number;
    citasDelPeriodo:      number;
    citasChange:          string;
    serviciosCompletados: number;
    serviciosChange:      string;
  };
  salesData:    { month: string; ventas: number; servicios: number }[];
  servicesData: { name: string; value: number; revenue: number }[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getPeriodLabel(period: string): string {
  const map: Record<string, string> = {
    "7days":  "Últimos 7 días",
    "30days": "Últimos 30 días",
    "90days": "Últimos 90 días",
    "year":   "Este año",
  };
  return map[period] ?? "Período seleccionado";
}

function Changebadge({ change }: { change: string }) {
  const isUp = change.startsWith("+");
  return (
    <Badge variant="outline" className={`flex items-center gap-1 text-xs px-2 py-0.5 ${isUp ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
      {isUp ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
      {change}
    </Badge>
  );
}

// ─── Componente ───────────────────────────────────────────────────────────────
export function Dashboard() {
  const [period,  setPeriod]  = useState("30days");
  const [data,    setData]    = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async (p: string) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/dashboard?period=${p}`);
      if (!res.ok) throw new Error();
      const json = await res.json();
      setData(json);
    } catch {
      toast.error("Error al cargar el dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboard(period); }, [period]);

  const handleFilterChange = (value: string) => {
    setPeriod(value);
    toast.success(`Filtro aplicado: ${getPeriodLabel(value)}`, { duration: 2000 });
  };

  // ── Exportar reporte ───────────────────────────────────────────────────────
  const handleExportPDF = () => {
    if (!data) return;
    toast.promise(
      new Promise(resolve => setTimeout(() => resolve(true), 1500)),
      {
        loading: "Generando reporte PDF...",
        success: () => {
          const { stats, salesData, servicesData } = data;
          const html = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><title>Reporte Dashboard - HIGHLIFE SPA & BAR</title>
<style>
  body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #1f2937; }
  h1 { color: #78D1BD; font-size: 28px; text-align:center; margin-bottom:8px; }
  .sub { text-align:center; color:#6b7280; margin-bottom:30px; }
  .grid { display:grid; grid-template-columns:repeat(2,1fr); gap:16px; margin-bottom:30px; }
  .card { padding:20px; border-left:4px solid #78D1BD; background:#f9fafb; border-radius:8px; }
  .label { font-size:12px; color:#6b7280; text-transform:uppercase; }
  .value { font-size:28px; font-weight:700; margin:4px 0; }
  .change { font-size:13px; color:#10b981; }
  table { width:100%; border-collapse:collapse; margin-bottom:30px; }
  th { background:#78D1BD; color:white; padding:10px; text-align:left; }
  td { padding:10px; border-bottom:1px solid #e5e7eb; }
  .footer { text-align:center; color:#9ca3af; font-size:12px; margin-top:40px; }
</style>
</head>
<body>
<h1>🌟 HIGHLIFE SPA & BAR</h1>
<p class="sub">Reporte Dashboard — ${getPeriodLabel(period)} — ${new Date().toLocaleDateString("es-ES", { day:"2-digit", month:"long", year:"numeric" })}</p>
<div class="grid">
  <div class="card"><div class="label">Ventas Totales</div><div class="value">$${stats.ventasTotales.toLocaleString()}</div><div class="change">${stats.ventasChange} vs período anterior</div></div>
  <div class="card"><div class="label">Clientes Activos</div><div class="value">${stats.clientesActivos.toLocaleString()}</div></div>
  <div class="card"><div class="label">Citas del Período</div><div class="value">${stats.citasDelPeriodo}</div><div class="change">${stats.citasChange} vs período anterior</div></div>
  <div class="card"><div class="label">Servicios Completados</div><div class="value">${stats.serviciosCompletados}</div><div class="change">${stats.serviciosChange} vs período anterior</div></div>
</div>
<h2>Evolución de Ventas</h2>
<table><thead><tr><th>Mes</th><th>Ventas ($)</th><th>Transacciones</th></tr></thead><tbody>
${salesData.map(r => `<tr><td>${r.month}</td><td>$${r.ventas.toLocaleString()}</td><td>${r.servicios}</td></tr>`).join("")}
</tbody></table>
<h2>Top Servicios</h2>
<table><thead><tr><th>#</th><th>Servicio</th><th>Citas</th><th>Ingresos</th></tr></thead><tbody>
${servicesData.map((s, i) => `<tr><td>${i+1}</td><td>${s.name}</td><td>${s.value}</td><td>$${s.revenue.toLocaleString()}</td></tr>`).join("")}
</tbody></table>
<div class="footer">© ${new Date().getFullYear()} HIGHLIFE SPA & BAR</div>
</body></html>`;
          const blob = new Blob([html], { type: "text/html" });
          const a = document.createElement("a");
          a.href = URL.createObjectURL(blob);
          a.download = `reporte-dashboard-${new Date().toISOString().split("T")[0]}.html`;
          a.click();
          return "¡Reporte generado! Ábrelo en el navegador e imprime como PDF.";
        },
        error: "Error al generar el reporte",
      }
    );
  };

  // ── Stats cards config ─────────────────────────────────────────────────────
  const statsCards = data ? [
    { title: "Ventas Totales",        value: `$${data.stats.ventasTotales.toLocaleString()}`,    change: data.stats.ventasChange,         icon: DollarSign,   color: "from-emerald-400 to-emerald-500" },
    { title: "Clientes Activos",      value: data.stats.clientesActivos.toLocaleString(),        change: null,                            icon: Users,        color: "from-blue-400 to-blue-500" },
    { title: "Citas del Período",     value: data.stats.citasDelPeriodo.toLocaleString(),        change: data.stats.citasChange,          icon: Calendar,     color: "from-purple-400 to-purple-500" },
    { title: "Servicios Completados", value: data.stats.serviciosCompletados.toLocaleString(),   change: data.stats.serviciosChange,      icon: CheckCircle,  color: "from-amber-400 to-amber-500" },
  ] : [];

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-6 h-6 text-[#78D1BD]" />
            <h1 className="text-gray-900">Dashboard Analítico</h1>
          </div>
          <p className="text-gray-600">Vista general del rendimiento del spa</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Select value={period} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-44 rounded-lg border-gray-200 bg-white">
              <Filter className="w-4 h-4 mr-2 text-gray-500" />
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Últimos 7 días</SelectItem>
              <SelectItem value="30days">Últimos 30 días</SelectItem>
              <SelectItem value="90days">Últimos 90 días</SelectItem>
              <SelectItem value="year">Este año</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExportPDF} disabled={!data}
            className="bg-gradient-to-r from-[#78D1BD] to-[#5FBFAA] hover:from-[#6BCAB7] hover:to-[#4FB5A1] text-white rounded-lg shadow-md">
            <Download className="w-4 h-4 mr-2" />
            Exportar Reporte
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-gray-500">Cargando dashboard...</div>
      ) : !data ? (
        <div className="flex items-center justify-center h-64 text-gray-500">No se pudieron cargar los datos</div>
      ) : (
        <>
          {/* ── Stats Cards ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {statsCards.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <Card key={i} className="border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-sm`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      {stat.change && <Changebadge change={stat.change} />}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">{stat.title}</p>
                      <p className="text-2xl text-gray-900">{stat.value}</p>
                      <p className="text-xs text-gray-500">{getPeriodLabel(period)}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* ── Gráficas ── */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Ventas por mes */}
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <div className="w-1 h-6 bg-[#78D1BD] rounded-full" />
                  Análisis de Ventas
                </CardTitle>
                <CardDescription>Evolución de ventas mensuales — {getPeriodLabel(period)}</CardDescription>
              </CardHeader>
              <CardContent>
                {data.salesData.length === 0 ? (
                  <div className="flex items-center justify-center h-[300px] text-gray-400">Sin datos para este período</div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data.salesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                      <XAxis dataKey="month" stroke="#9CA3AF" style={{ fontSize: "12px" }} axisLine={false} tickLine={false} />
                      <YAxis stroke="#9CA3AF" style={{ fontSize: "12px" }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: "0.75rem", border: "none", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }} />
                      <Line type="monotone" dataKey="ventas" stroke="#78D1BD" strokeWidth={3} name="Ventas ($)"
                        dot={{ fill: "#78D1BD", strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Distribución de servicios */}
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <div className="w-1 h-6 bg-[#A78BFA] rounded-full" />
                  Distribución de Servicios
                </CardTitle>
                <CardDescription>Top 5 servicios más solicitados — {getPeriodLabel(period)}</CardDescription>
              </CardHeader>
              <CardContent>
                {data.servicesData.length === 0 ? (
                  <div className="flex items-center justify-center h-[300px] text-gray-400">Sin datos para este período</div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={data.servicesData} cx="50%" cy="50%" labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100} dataKey="value">
                        {data.servicesData.map((_, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: "0.75rem", border: "none", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ── Ingresos por servicio ── */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <div className="w-1 h-6 bg-blue-500 rounded-full" />
                Ingresos por Servicio
              </CardTitle>
              <CardDescription>Rentabilidad por servicio — {getPeriodLabel(period)}</CardDescription>
            </CardHeader>
            <CardContent>
              {data.servicesData.length === 0 ? (
                <div className="flex items-center justify-center h-[300px] text-gray-400">Sin datos para este período</div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.servicesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                    <XAxis dataKey="name" stroke="#9CA3AF" style={{ fontSize: "12px" }} axisLine={false} tickLine={false} />
                    <YAxis stroke="#9CA3AF" style={{ fontSize: "12px" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: "0.75rem", border: "none", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }} />
                    <Bar dataKey="revenue" fill="#78D1BD" name="Ingresos ($)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* ── Ranking de servicios ── */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <div className="w-1 h-6 bg-purple-500 rounded-full" />
                Ranking de Servicios
              </CardTitle>
              <CardDescription>Top 5 servicios más rentables — {getPeriodLabel(period)}</CardDescription>
            </CardHeader>
            <CardContent>
              {data.servicesData.length === 0 ? (
                <p className="text-center text-gray-400 py-8">Sin datos para este período</p>
              ) : (
                <div className="space-y-3">
                  {data.servicesData.map((service, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-sm transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#78D1BD] to-[#5FBFAA] text-white flex items-center justify-center shadow-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-gray-900">{service.name}</p>
                          <p className="text-sm text-gray-600">{service.value} citas realizadas</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-900">${service.revenue.toLocaleString()}</p>
                        <Badge variant="outline" className="mt-1 bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                          Ingresos
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
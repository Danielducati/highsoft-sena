import { Button } from "../../../shared/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/ui/select";
import { Sparkles, Filter, Download } from "lucide-react";
import { PERIOD_OPTIONS } from "../constants";
import { useDashboard } from "../hooks/useDashboard";
import { exportDashboardReport } from "../utils";
import { StatCard } from "../components/StatCard";
import { SalesChart } from "../components/SalesChart";
import { ServicesChart } from "../components/ServicesChart";
import { RevenueChart } from "../components/RevenueChart";
import { ServicesRanking } from "../components/ServicesRanking";

export function DashboardPage() {
  const { period, data, loading, statsCards, handleFilterChange, periodLabel } = useDashboard();

  return (
    <div className="space-y-6">

      {/* Header */}
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
              {PERIOD_OPTIONS.map(({ value, label }) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={() => data && exportDashboardReport(data, period, periodLabel)}
            disabled={!data}
            className="bg-gradient-to-r from-[#78D1BD] to-[#5FBFAA] hover:from-[#6BCAB7] hover:to-[#4FB5A1] text-white rounded-lg shadow-md"
          >
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
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {statsCards.map((stat, i) => (
              <StatCard key={i} {...stat} periodLabel={periodLabel} />
            ))}
          </div>

          {/* Gráficas */}
          <div className="grid lg:grid-cols-2 gap-6">
            <SalesChart    data={data.salesData}    periodLabel={periodLabel} />
            <ServicesChart data={data.servicesData} periodLabel={periodLabel} />
          </div>

          <RevenueChart    data={data.servicesData} periodLabel={periodLabel} />
          <ServicesRanking data={data.servicesData} periodLabel={periodLabel} />
        </>
      )}
    </div>
  );
}
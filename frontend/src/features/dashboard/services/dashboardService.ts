import { API_BASE } from "../constants";
import { DashboardData } from "../types";

export async function fetchDashboardApi(period: string): Promise<DashboardData> {
  const res = await fetch(`${API_BASE}/dashboard?period=${period}`);
  if (!res.ok) throw new Error("Error al cargar el dashboard");
  return res.json();
}
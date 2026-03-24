import { Card, CardContent } from "../../../shared/ui/card";
import { LucideIcon } from "lucide-react";
import { ChangeBadge } from "./ChangeBadge";

interface StatCardProps {
  title: string;
  value: string;
  change: string | null;
  icon: LucideIcon;
  color: string;
  periodLabel: string;
}

export function StatCard({ title, value, change, icon: Icon, color, periodLabel }: StatCardProps) {
  return (
    <Card className="border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-sm`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          {change && <ChangeBadge change={change} />}
        </div>
        <div className="space-y-1">
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl text-gray-900">{value}</p>
          <p className="text-xs text-gray-500">{periodLabel}</p>
        </div>
      </CardContent>
    </Card>
  );
}
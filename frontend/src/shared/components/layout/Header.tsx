import { Bell, Search } from "lucide-react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Avatar, AvatarFallback } from "../../ui/avatar";
import { Badge } from "../../ui/badge";

interface HeaderProps {
  userRole: 'admin' | 'employee' | 'client';
  userName?: string;
}

export function Header({ userRole, userName }: HeaderProps) {
  const roleLabels = {
    admin: 'Administrador',
    employee: 'Empleado',
    client: 'Cliente'
  };

  const displayName = userName || roleLabels[userRole];

  const getRoleBadgeColor = () => {
    switch (userRole) {
      case 'admin':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'employee':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'client':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <header className="h-16 border-b border-gray-200 bg-white sticky top-0 z-40 flex items-center justify-between px-8 shadow-sm">
      <div className="flex items-center gap-6 flex-1">
        <div>
          <h2 className="text-gray-900">Bienvenido de nuevo 👋</h2>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-sm text-gray-600">{displayName}</p>
            <Badge variant="outline" className={`${getRoleBadgeColor()} text-xs px-2 py-0.5`}>
              {roleLabels[userRole]}
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Search Bar */}
        <div className="relative hidden lg:block">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar..."
            className="pl-10 w-64 bg-gray-50 border-gray-200 rounded-lg focus:bg-white focus:shadow-sm transition-all"
          />
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative rounded-lg hover:bg-gray-100">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
        </Button>

        {/* User Avatar */}
        <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
          <Avatar className="w-9 h-9 ring-2 ring-gray-100">
            <AvatarFallback className="bg-gradient-to-br from-[#78D1BD] to-[#5FBFAA] text-white">
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}

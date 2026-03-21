import { 
  LayoutDashboard, 
  Sparkles,
  Package,
  FolderOpen,
  Newspaper, 
  Calendar, 
  Clock,
  FileText,
  ShoppingCart,
  Users,
  Settings, 
  LogOut,
  UserCircle,
  Shield,
  UserCog,
  Briefcase
} from "lucide-react";
import { cn } from "../../ui/utils";

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  userRole: 'admin' | 'employee' | 'client';
}

export function Sidebar({ activePage, onNavigate, onLogout, userRole }: SidebarProps) {
  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: LayoutDashboard,
      roles: ['admin']
    },
    { 
      id: 'services', 
      label: 'Servicios', 
      icon: Package,
      roles: ['admin']
    },
    { 
      id: 'categories', 
      label: 'Categorías de servicios', 
      icon: FolderOpen,
      roles: ['admin']
    },
    { 
      id: 'news', 
      label: 'Novedades', 
      icon: Newspaper,
      roles: ['admin', 'employee']
    },
    { 
      id: 'appointments', 
      label: 'Citas', 
      icon: Calendar,
      roles: ['admin', 'employee', 'client']
    },
    { 
      id: 'schedules', 
      label: 'Horarios', 
      icon: Clock,
      roles: ['admin']
    },
    { 
      id: 'quotations', 
      label: 'Cotizaciones', 
      icon: FileText,
      roles: ['admin']
    },
    { 
      id: 'sales', 
      label: 'Ventas', 
      icon: ShoppingCart,
      roles: ['admin']
    },
    { 
      id: 'clients', 
      label: 'Clientes', 
      icon: Users,
      roles: ['admin']
    },
    { 
      id: 'employees', 
      label: 'Empleados', 
      icon: Briefcase,
      roles: ['admin']
    },
    { 
      id: 'users', 
      label: 'Usuarios', 
      icon: UserCog,
      roles: ['admin']
    },
    { 
      id: 'roles', 
      label: 'Roles y Permisos', 
      icon: Shield,
      roles: ['admin']
    },
  ];

  const visibleItems = menuItems.filter(item => item.roles.includes(userRole));

  const roleLabels = {
    admin: 'Administrador',
    employee: 'Empleado',
    client: 'Cliente'
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen fixed left-0 top-0 shadow-sm">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#78D1BD] to-[#5FBFAA] flex items-center justify-center shadow-md">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-gray-900 tracking-tight">HIGHLIFE</h2>
            <p className="text-xs text-gray-500 tracking-wider">SPA & BAR</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200",
                isActive 
                  ? "bg-gradient-to-r from-[#78D1BD] to-[#6BCAB7] text-white shadow-md" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-gray-100 space-y-3">
        {/* User Card */}
        <div className="flex items-center gap-3 px-3 py-2.5 bg-gray-50 rounded-lg">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#A78BFA] to-[#8B5CF6] flex items-center justify-center">
            <UserCircle className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-900 truncate">{roleLabels[userRole]}</p>
            <p className="text-xs text-gray-500">Usuario activo</p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
          onClick={onLogout}
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}

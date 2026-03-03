import { useState } from "react";
// Landing & Auth
import { LandingPage } from "../features/landing/LandingPage";
import { LoginPage } from "../features/auth/LoginPage";
import { RegisterPage } from "../features/auth/RegisterPage";

// Layout (shared)
import { Sidebar } from "../shared/components/layout/Sidebar";
import { Header } from "../shared/components/layout/Header";

// Dashboard
import { Dashboard } from "../features/dashboard/Dashboard";

// Modules
import { ServicesModule } from "../features/services/ServicesModule";
import { CategoriesModule } from "../features/categories/CategoriesModule";
import { NewsModule } from "../features/news/NewsModule";
import { AppointmentsModule } from "../features/appointments/AppointmentsModule";
import { SchedulesModule } from "../features/schedules/SchedulesModule";
import { QuotationsModule } from "../features/quotations/QuotationsModule";
import { SalesModule } from "../features/sales/SalesModule";
import { ClientsModule } from "../features/clients/ClientsModule";
import { EmployeesModule } from "../features/employees/EmployeesModule";
import { UsersModule } from "../features/users/UsersModule";
import { RolesModule } from "../features/roles/RolesModule";
import { SettingsModule } from "../features/settings/SettingsModule";

// UI global
import { Toaster } from "sonner";


type UserRole = 'admin' | 'employee' | 'client' | null;
type Page =
  | "landing"
  | "login"
  | "register"
  | "dashboard"
  | "services"
  | "categories"
  | "news"
  | "appointments"
  | "schedules"
  | "quotations"
  | "sales"
  | "clients"
  | "employees"
  | "users"
  | "roles"
  | "settings";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [userRole, setUserRole] = useState<UserRole>(null);

  const handleLogin = (role: 'admin' | 'employee' | 'client') => {
    setUserRole(role);
    // Navigate to appropriate page based on role
    if (role === 'client') {
      setCurrentPage('appointments');
    } else if (role === 'employee') {
      setCurrentPage('appointments');
    } else {
      setCurrentPage('dashboard');
    }
  };

  const handleLogout = () => {
    setUserRole(null);
    setCurrentPage('landing');
  };

  const handleNavigate = (page: string) => {
    if (page === 'login') {
      setCurrentPage('login');
    } else if (page === 'register') {
      setCurrentPage('register');
    } else if (userRole) {
      setCurrentPage(page as Page);
    }
  };

  // Render landing or login page (no layout)
  if (currentPage === 'landing') {
    return (
      <>
        <LandingPage onNavigate={handleNavigate} />
        <Toaster />
      </>
    );
  }

  if (currentPage === 'login') {
    return (
      <>
        <LoginPage 
          onLogin={handleLogin} 
          onBack={() => setCurrentPage('landing')} 
        />
        <Toaster />
      </>
    );
  }

  if (currentPage === 'register') {
    return (
      <>
        <RegisterPage 
          onBack={() => setCurrentPage('landing')}
          onRegisterSuccess={() => setCurrentPage('landing')}
        />
        <Toaster />
      </>
    );
  }

  // Render authenticated pages with layout
  if (!userRole) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar 
        activePage={currentPage}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        userRole={userRole}
      />
      
      <div className="flex-1 flex flex-col ml-64">
        <Header userRole={userRole} />
        
        <main className="flex-1 overflow-y-auto bg-[#F7F9FC] p-8">
          {currentPage === 'dashboard' && <Dashboard />}
          {currentPage === 'services' && <ServicesModule userRole={userRole} />}
          {currentPage === 'categories' && <CategoriesModule userRole={userRole} />}
          {currentPage === 'news' && <NewsModule userRole={userRole} />}
          {currentPage === 'appointments' && <AppointmentsModule userRole={userRole} />}
          {currentPage === 'schedules' && <SchedulesModule userRole={userRole} />}
          {currentPage === 'quotations' && <QuotationsModule userRole={userRole} />}
          {currentPage === 'sales' && <SalesModule userRole={userRole} />}
          {currentPage === 'clients' && <ClientsModule userRole={userRole} />}
          {currentPage === 'employees' && <EmployeesModule userRole={userRole} />}
          {currentPage === 'users' && <UsersModule userRole={userRole} />}
          {currentPage === 'roles' && <RolesModule userRole={userRole} />}
          {currentPage === 'settings' && <SettingsModule userRole={userRole} />}
        </main>
      </div>

      <Toaster />
    </div>
  );
}
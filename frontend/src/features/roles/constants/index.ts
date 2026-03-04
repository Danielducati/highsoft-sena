import { Permission } from "../types";

// Lista de permisos disponibles agrupados por categoría.
// Extiende este array cuando agregues nuevos módulos.
export const AVAILABLE_PERMISSIONS: Permission[] = [
  // Dashboard
  { id: "dashboard.view",   name: "Ver Dashboard",          category: "Dashboard"      },
  // Clientes
  { id: "clients.view",     name: "Ver Clientes",           category: "Clientes"       },
  { id: "clients.create",   name: "Crear Clientes",         category: "Clientes"       },
  { id: "clients.edit",     name: "Editar Clientes",        category: "Clientes"       },
  { id: "clients.delete",   name: "Eliminar Clientes",      category: "Clientes"       },
  // Empleados
  { id: "employees.view",   name: "Ver Empleados",          category: "Empleados"      },
  { id: "employees.create", name: "Crear Empleados",        category: "Empleados"      },
  { id: "employees.edit",   name: "Editar Empleados",       category: "Empleados"      },
  { id: "employees.delete", name: "Eliminar Empleados",     category: "Empleados"      },
  // Citas
  { id: "appointments.view",   name: "Ver Citas",           category: "Citas"          },
  { id: "appointments.create", name: "Crear Citas",         category: "Citas"          },
  { id: "appointments.edit",   name: "Editar Citas",        category: "Citas"          },
  { id: "appointments.delete", name: "Eliminar Citas",      category: "Citas"          },
  // Cotizaciones
  { id: "quotations.view",   name: "Ver Cotizaciones",      category: "Cotizaciones"   },
  { id: "quotations.create", name: "Crear Cotizaciones",    category: "Cotizaciones"   },
  { id: "quotations.edit",   name: "Editar Cotizaciones",   category: "Cotizaciones"   },
  // Servicios
  { id: "services.view",    name: "Ver Servicios",          category: "Servicios"      },
  { id: "services.create",  name: "Crear Servicios",        category: "Servicios"      },
  { id: "services.edit",    name: "Editar Servicios",       category: "Servicios"      },
  { id: "services.delete",  name: "Eliminar Servicios",     category: "Servicios"      },
  // Categorías
  { id: "categories.view",  name: "Ver Categorías",         category: "Categorías"     },
  { id: "categories.manage",name: "Gestionar Categorías",   category: "Categorías"     },
  // Roles
  { id: "roles.view",       name: "Ver Roles",              category: "Roles"          },
  { id: "roles.manage",     name: "Gestionar Roles",        category: "Roles"          },
];

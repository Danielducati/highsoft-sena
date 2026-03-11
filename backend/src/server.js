const express = require('express');
const cors    = require('cors');
const app     = express();

app.use(cors());
app.use(express.json());

// ── Importar rutas ────────────────────────────────────────────
const appointmentRoutes = require('./routes/appointments.routes.js');
const employeeRoutes    = require('./routes/employees.routes.js');
const clientRoutes      = require('./routes/clients.routes.js');
const salesRoutes       = require('./routes/sales.routes.js');
const categoriesRoutes  = require('./routes/categories.routes.js');
const quotationsRoutes    = require('./routes/quotations.routes.js');
const schedulesRoutes   = require('./routes/schedules.routes.js');
const dashboardRoutes   = require('./routes/dashboard.routes.js');
const newsRoutes        = require('./routes/news.routes.js');
const servicesRoutes    = require('./routes/services.routes.js');
const usersRoutes       = require('./routes/users.routes.js');
const rolesRoutes       = require('./routes/roles.routes.js');
const { router: authRouter } = require('./routes/auth.routes.js');
const permissionsRoutes = require("./routes/permissions.routes.js");


// ── Registrar rutas ───────────────────────────────────────────
app.use('/appointments',     appointmentRoutes);
app.use("/permissions",     permissionsRoutes);
app.use("/api/permissions", permissionsRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/employees',        employeeRoutes);
app.use('/api/employees',    employeeRoutes);
app.use('/clients',          clientRoutes);
app.use('/api/clients',      clientRoutes);
app.use('/sales',            salesRoutes);
app.use('/api/sales',        salesRoutes);
app.use('/categories',       categoriesRoutes);
app.use('/api/categories',   categoriesRoutes);
app.use('/schedules',        schedulesRoutes);
app.use('/api/schedules',    schedulesRoutes);
app.use('/dashboard',        dashboardRoutes);
app.use('/api/dashboard',    dashboardRoutes);
app.use('/news',             newsRoutes);
app.use('/api/news',         newsRoutes);
app.use('/services',         servicesRoutes);
app.use('/api/services',     servicesRoutes);
app.use('/users',            usersRoutes);
app.use('/api/users',        usersRoutes);
app.use('/roles',            rolesRoutes);
app.use('/api/roles',        rolesRoutes);
app.use('/quotations',       quotationsRoutes);
app.use('/api/quotations',   quotationsRoutes);
app.use('/auth',             authRouter);
app.use('/api/auth',         authRouter);

app.listen(3001, () => {
  console.log('🔥 Backend corriendo en puerto 3001');
});
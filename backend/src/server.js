const express = require('express');
const cors    = require('cors');
const app     = express();

app.use(cors());
app.use(express.json());

const appointmentRoutes = require('./routes/appointments.routes.js');
const employeeRoutes    = require('./routes/employees.routes.js');
const clientRoutes      = require('./routes/clients.routes.js');
const salesRoutes       = require('./routes/sales.routes.js');
const categoriesRoutes  = require('./routes/categories.routes.js');
const schedulesRoutes   = require('./routes/schedules.routes.js');
const dashboardRoutes   = require('./routes/dashboard.routes.js');
const newsRoutes        = require('./routes/news.routes.js');
const servicesRoutes    = require('./routes/services.routes.js');
const { router: authRouter } = require('./routes/auth.routes.js');

app.use('/appointments',     appointmentRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/employees',        employeeRoutes);
app.use('/clients',          clientRoutes);
app.use('/sales',            salesRoutes);
app.use('/categories',       categoriesRoutes);
app.use('/schedules',        schedulesRoutes);
app.use('/dashboard',        dashboardRoutes);
app.use('/news',             newsRoutes);
app.use('/services',         servicesRoutes);
app.use('/auth',             authRouter);

// Pendientes
const pending = ['roles', 'users', 'quotations'];
pending.forEach(name => {
  app.use(`/${name}`, (req, res) => {
    res.json({ message: `Ruta /${name} pendiente de migrar a Prisma` });
  });
});

app.listen(3001, () => {
  console.log('🔥 Backend corriendo en puerto 3001');
});
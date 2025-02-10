
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { startScheduler } = require('./services/sapSchedulerService');
const schedulerRoutes = require('./routes/schedulerRoutes');
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Rutas opcionales
app.use('/api/scheduler', schedulerRoutes);

// Iniciamos el cron que corre cada 10 min
startScheduler();

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => {
  console.log(`🚀 SAP Scheduler Service corriendo en el puerto ${PORT}`);
});

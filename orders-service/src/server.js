const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const orderRoutes = require('./routes/ordersRoutes');
const consumeMessages = require('./consumer/ordersConsumer');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/orders', orderRoutes);

// Middleware de manejo de errores
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, async () => {
  console.log(`🚀 Orders Service running on port ${PORT}`);
  // Iniciar consumidor de Kafka
  await consumeMessages();
});
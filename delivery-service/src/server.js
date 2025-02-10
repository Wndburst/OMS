const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

const deliveryRoutes = require('./routes/deliveryRoutes');
const consumeMessages = require('./consumer/deliveryConsumer'); // si consumes eventos
const errorHandler = require('./middleware/errorHandler'); // opcional

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/delivery', deliveryRoutes);

// Iniciar consumer de Kafka
consumeMessages().catch(err => console.error('❌ Error al iniciar consumer:', err));

// Middleware de errores (opcional)
app.use(errorHandler);

const PORT = process.env.PORT || 5003;
app.listen(PORT, () => {
  console.log(`🚀 Delivery Service running on port ${PORT}`);
});

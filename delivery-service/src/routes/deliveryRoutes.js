const express = require('express');
const {
  createDelivery,
  assignDriver,
  updateDeliveryStatus,
  getDeliveryById,
  getDeliveryByOrder,
  getAllDeliveries
} = require('../controllers/deliveryController');

const authMiddleware = require('../middleware/authMiddleware'); // Si proteges con JWT
const userRole = require('../utils/roles'); // "Admin", "Driver", etc.

const router = express.Router();

// Crear una nueva entrega para un pedido
// Ej: solo "Admin" o "Assigner" puede crear la entrega
router.post('/create', createDelivery);

// Asignar chofer a la entrega
// Ej: solo "Admin" o "Assigner" pueden asignar
router.post('/assign', assignDriver);

// Actualizar estado de la entrega (en ruta, entregado, etc.)
// Ej: "Driver" puede marcar como entregado
router.put('/status', updateDeliveryStatus);

// Obtener info de una entrega por ID
router.get('/:id', getDeliveryById);

// Obtener entregas asociadas a una orden
router.get('/order/:orderID', getDeliveryByOrder);

// Obtener todas las entregas
router.get('/', getAllDeliveries);

module.exports = router;
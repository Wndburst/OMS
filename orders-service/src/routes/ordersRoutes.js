const express = require('express');
const {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  updateOrderProduct,
  getMaxCreatets,
  getLastQueryDate,
  getHistory
} = require('../controllers/ordersController');

const authMiddleware = require('../middleware/authMiddleware');
const userRole = require('../utils/roles');

const router = express.Router();

// Rutas
router.get('/', getAllOrders); // API para obtener todas las órdenes
router.get('/:id', getOrderById); // API para obtener una orden por su ID
router.put('/:id/status', updateOrderStatus); // API para actualizar el estado de una orden
router.put('/product/:orderProductID', updateOrderProduct); // API para actualizar un producto de una orden
router.get('/max/createts', getMaxCreatets); // API para obtener la fecha de la última orden creada
router.get('/max/lastQueryDate', getLastQueryDate); // API para obtener la fecha de la última consulta
router.get('/history/:id', getHistory); // API para obtener el historial de una orden

// authMiddleware([userRole.ADMIN, userRole.ASSIGNER]) para asignar múltiples roles
module.exports = router;
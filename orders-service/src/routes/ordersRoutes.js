const express = require('express');
const {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  updateOrderProduct,
  getMaxCreatets,
  getLastQueryDate
} = require('../controllers/ordersController');

const authMiddleware = require('../middleware/authMiddleware');
const userRole = require('../utils/roles');

const router = express.Router();

// 🔒 Solo `Admin` y `Assigner` pueden ver todas las órdenes
router.get('/', getAllOrders);

// 🔒 `Admin`, `Assigner` y `Picker` pueden ver una orden específica
router.get('/:id', getOrderById);

// 🔒 Solo `Admin` y `Assigner` pueden actualizar estados de órdenes
router.put('/:id/status', updateOrderStatus);

// 🔒 `Admin`, `Assigner` y `Picker` pueden actualizar productos dentro de una orden
router.put('/product/:orderProductID', updateOrderProduct);

router.get('/max/createts', getMaxCreatets);
router.get('/max/lastQueryDate', getLastQueryDate);


// authMiddleware([userRole.ADMIN, userRole.ASSIGNER]) para asignar múltiples roles
module.exports = router;

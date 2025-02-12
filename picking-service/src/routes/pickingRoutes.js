const express = require('express');
const {
  assignPickers,
  updatePickedProduct,
  completePicking,
  getProductsFromOrder
} = require('../controllers/pickingController');

const router = express.Router();


router.post('/assign', assignPickers); // Asignar pickers a una orden
router.put('/product/:orderProductID', updatePickedProduct); // Actualizar producto de una orden
router.put('/complete/:orderID', completePicking); // Completar picking de una orden
router.get('/products/:orderID', getProductsFromOrder);// Obtener productos de una orden


module.exports = router;

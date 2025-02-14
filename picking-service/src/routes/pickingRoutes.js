const express = require('express');
const {
  assignPickers,
  updatePickedProduct,
  completePicking,
  getProductsFromOrder,
  createBundle,  
  getBundlesByOrder, 
  getBundleDetails,
  getOrderProductsWithBundleID 
} = require('../controllers/pickingController');

const router = express.Router();


router.post('/assign', assignPickers); // Asignar pickers a una orden
router.put('/product/:orderProductID', updatePickedProduct); // Actualizar producto de una orden
router.put('/complete/:orderID', completePicking); // Completar picking de una orden
router.get('/products/:orderID', getProductsFromOrder);// Obtener productos de una orden



//BULTOS
router.post('/bundle', createBundle); // Crear un bulto
router.get('/bundles/:orderID', getBundlesByOrder); // Obtener bultos de una orden
router.get('/bundle/:bundleID', getBundleDetails); // Obtener detalles de un bulto
router.get('/order-products/:orderID', getOrderProductsWithBundleID); // Obtener productos con bundleID

module.exports = router;

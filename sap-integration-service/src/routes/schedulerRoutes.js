const express = require('express');
const { runScheduler, createNewOrder } = require('../controllers/schedulerController');

const router = express.Router();

// Rutas

// API para ejecutar el tarea programada de importación de órdenes desde SAP
router.post('/execute', runScheduler); 

// API para crear una orden a partir de un folionum en Retail Pro
router.post('/create/:folionum', createNewOrder); 

module.exports = router;

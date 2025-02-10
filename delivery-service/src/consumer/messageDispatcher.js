const DeliveryService = require('../services/deliveryService');

module.exports = {
  'picking.completed': async (msg) => {
    console.log(`📥 [picking.completed] Orden ${msg.orderID} completó picking, iniciemos etapa de delivery...`);
    // Opcional: podrías crear un registro de Delivery si no existe
    await DeliveryService.createDelivery(msg.orderID);
  },

  'order.status.updated': async (msg) => {
    console.log(`📥 [order.status.updated] Orden ${msg.orderID}, nuevo estado: ${msg.newStatus}`);
    // Ej: si newStatus == 6 -> "Listo para despachar", etc.
  }
};

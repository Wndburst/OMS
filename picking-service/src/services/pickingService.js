const PickingRepository = require('../models/pickingRepository');
const { sendMessage } = require('../producer');
const axios = require('axios');

const ORDERS_SERVICE_URL = "http://orders-service:4000/api/orders";

const PickingService = {
  assignPickers: async (orderID, pickerAssignments) => {
    // Obtener estado actual de la orden desde orders-service
    let currentStatus;
    try {
      const response = await axios.get(`${ORDERS_SERVICE_URL}/${orderID}`);
      currentStatus = response.data.orderStatusID;
    } catch (error) {
      console.error(`❌ Error obteniendo estado de la orden ${orderID} desde orders-service:`, error.message);
      return false;
    }

    const newStatus = await PickingRepository.assignPickers(orderID, pickerAssignments);

    // Evitar mensajes de estado innecesarios
    if (currentStatus !== newStatus) {
      await sendMessage('order.status.updated', { orderID, newStatus });
      console.log(`📤 Estado de la orden ${orderID} actualizado a ${newStatus}`);
    } else {
      console.log(`ℹ️ La orden ${orderID} ya está en estado ${newStatus}, no se envía nuevo mensaje.`);
    }
    return newStatus;
  },

  getProductsFromOrder: async (orderID) => {
    return await PickingRepository.getProductsFromOrder(orderID);
  },

  updatePickedProduct: async (orderProductID, pickedQuantity) => {
    const updated = await PickingRepository.updatePickedProduct(orderProductID, pickedQuantity);
    if (!updated) return false;

    console.log(`✅ Producto ${orderProductID} actualizado con ${pickedQuantity} unidades recogidas.`);

    // Verificar si toda la orden está completamente pickeada
    const { orderID } = await getorderIDByOrderProduct(orderProductID);
    if (orderID) {
      const isComplete = await PickingRepository.isOrderFullyPicked(orderID);
      if (isComplete) {
        console.log(`✅ Todos los productos de la orden ${orderID} han sido pickeados. Notificando...`);
        await sendMessage('order.status.updated', { orderID, newStatus: 5 }); // 5 -> "Picking Completado"
        console.log(`📤 Estado de la orden ${orderID} actualizado a 5 (Picking Completado)`);
      }
    }
    return updated;
  },

  completePicking: async (orderID) => {
    const isComplete = await PickingRepository.isPickingComplete(orderID);
    if (!isComplete) return false;

    console.log(`✅ Orden ${orderID} completó el picking`);

    // Verificar si hay productos con pickedQuantity < quantity
    const hasMissingProducts = await PickingRepository.hasMissingProducts(orderID);
    if (hasMissingProducts) {
      await sendMessage('order.status.updated', { orderID, newStatus: 4 }); 
      console.log(`📤 Estado de la orden ${orderID} -> 4 (Picking Completado Parcialmente)`);
    } else {
      await sendMessage('order.status.updated', { orderID, newStatus: 5 });
      console.log(`📤 Estado de la orden ${orderID} -> 5 (Picking Completado)`);
    }

    // Enviar evento de finalización de picking
    await sendMessage('picking.completed', { orderID });

    return true;
  }
};

/**
 * Obtener el orderID dada la relación con orderProductID.
 * (Podrías mover esto a un Repository si lo usas frecuentemente)
 */
async function getorderIDByOrderProduct(orderProductID) {
  const { default: pool } = await import('../config/db.js');
  const [rows] = await pool.query(
    `SELECT orderID FROM Order_Product WHERE orderProductID = ?`, 
    [orderProductID]
  );
  return rows[0] || {};
}

module.exports = PickingService;

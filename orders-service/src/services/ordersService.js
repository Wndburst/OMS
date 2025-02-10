const OrdersRepository = require('../models/ordersRepository.js');
const { sendMessage } = require('../producer');

const OrdersService = {
  getAllOrders: async () => {
    return await OrdersRepository.getAllOrders();
  },

  getOrderById: async (orderID) => {
    return await OrdersRepository.getOrderById(orderID);
  },

  createOrder: async (orderData, products) => {
    const orderID = await OrdersRepository.createOrder(orderData);
    if (orderID) {
      // Enviamos la orden a `picking-service` con los productos
      await sendMessage('sap.order.imported', { ...orderData, products });
      console.log(`📤 Orden ${orderID} enviada a Kafka con productos`);
    }
    return orderID;
  },

  updateOrderStatus: async (orderID, orderStatusID) => {
    const currentOrder = await OrdersRepository.getOrderById(orderID);
    if (!currentOrder) {
      console.warn(`⚠️ Orden ${orderID} no encontrada.`);
      return false;
    }

    // Si ya está en ese estado, no reenviamos evento.
    if (currentOrder.orderStatusID === orderStatusID) {
      console.log(`ℹ️ Estado de la orden ${orderID} ya es ${orderStatusID}, no se enviará otro mensaje.`);
      return false;
    }

    const updated = await OrdersRepository.updateOrderStatus(orderID, orderStatusID);

    if (updated) {
      // Notificar vía Kafka
      await sendMessage('order.status.updated', { orderID, newStatus: orderStatusID });
      console.log(`📤 Estado de la orden ${orderID} actualizado a ${orderStatusID}`);
    }
    return updated;
  },

  // Puedes exponerlo si se usa en otros lados
  updateOrderProduct: async (orderProductID, pickedQuantity) => {
    return OrdersRepository.updateOrderProduct(orderProductID, pickedQuantity);
  },
  getMaxCreatets: async () => {
    const maxCreatets = await OrdersRepository.getMaxCreatets();
    console.log(`✅ maxCreatets obtenido en Service: ${maxCreatets}`);
    return maxCreatets;
  },

  getLastQueryDate: async () => {
    const lastQueryDate = await OrdersRepository.getLastQueryDate();
    console.log(`✅ lastQueryDate obtenido en Service: ${lastQueryDate}`);
    return lastQueryDate;
  }

};

module.exports = OrdersService;

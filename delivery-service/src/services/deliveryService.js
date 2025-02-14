const DeliveryRepository = require('../models/deliveryRepository');
const { sendMessage } = require('../producer'); // Para publicar eventos

const DeliveryService = {
  // Crea una nueva entrega si no existe ya para la orden
  createDelivery: async (orderID) => {
    // Evitar duplicados
    const alreadyExists = await DeliveryRepository.existsDeliveryForOrder(orderID);
    if (alreadyExists) {
      console.log(`🔹 Ya existe entrega para la orden ${orderID}, no se creará otra.`);
      return null;
    }

    const deliveryID = await DeliveryRepository.createDelivery(orderID);
    console.log(`✅ Delivery creada para la orden ${orderID}, ID: ${deliveryID}`);

    // Opcional: Notificar un evento (delivery.created)
    await sendMessage('delivery.created', { deliveryID, orderID });
    return deliveryID;
  },

  // Asignar chofer
  assignDriver: async (deliveryID, driverRUT) => {
    const success = await DeliveryRepository.assignDriver(deliveryID, driverRUT);
    if (!success) return false;

    // Notificar evento de asignación
    await sendMessage('delivery.status.updated', {
      deliveryID,
      newStatus: 2, // "Asignado"
      driverRUT
    });
    console.log(`📤 Delivery ${deliveryID} asignada al chofer ${driverRUT}`);
    return true;
  },

  // Cambiar estado de la entrega (por ejemplo "En Ruta", "Entregado", etc.)
  updateDeliveryStatus: async (deliveryID, newStatus) => {
    const success = await DeliveryRepository.updateDeliveryStatus(deliveryID, newStatus);
    if (!success) return false;

    // Notificar a Kafka
    await sendMessage('delivery.status.updated', {
      deliveryID,
      newStatus
    });
    console.log(`📤 Delivery ${deliveryID} cambió a estado ${newStatus}`);
    // 🔹 Si cambia a estado 3 (En Ruta) → Enviar "order.status.updated" con estado 8
    if (newStatus === 3) {
      const delivery = await DeliveryRepository.getDeliveryById(deliveryID);
      if (delivery) {
        await sendMessage('order.status.updated', { orderID: delivery.orderID, newStatus: 8 });
        console.log(`📤 [order.status.updated] Orden ${delivery.orderID} cambió a estado 8 (En Ruta)`);
      }
    }

    // 🔹 Si cambia a estado 4 (Entregado) → Enviar "order.status.updated" con estado 9
    if (newStatus === 4) {
      const delivery = await DeliveryRepository.getDeliveryById(deliveryID);
      if (delivery) {
        await sendMessage('order.status.updated', { orderID: delivery.orderID, newStatus: 9 });
        console.log(`📤 [order.status.updated] Orden ${delivery.orderID} cambió a estado 9 (Entregado)`);
      }
    }
    return true;
  },

  // Obtener una entrega por su ID
  getDeliveryById: (deliveryID) => {
    return DeliveryRepository.getDeliveryById(deliveryID);
  },

  // Obtener entregas por orderID
  getDeliveryByOrder: (orderID) => {
    return DeliveryRepository.getDeliveryByOrder(orderID);
  },

  // Listar todas las entregas
  getAllDeliveries: () => {
    return DeliveryRepository.getAllDeliveries();
  }
};

module.exports = DeliveryService;
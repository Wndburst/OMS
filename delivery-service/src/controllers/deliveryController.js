const DeliveryService = require('../services/deliveryService');

exports.createDelivery = async (req, res) => {
  try {
    const { orderID } = req.body;
    const deliveryID = await DeliveryService.createDelivery(orderID);
    if (!deliveryID) {
      return res.status(400).json({ message: `La orden ${orderID} ya tiene una entrega asociada.` });
    }
    res.status(201).json({ 
      message: `Delivery creada con ID ${deliveryID}`, 
      deliveryID 
    });
  } catch (error) {
    console.error('❌ Error creando delivery:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

exports.assignDriver = async (req, res) => {
  try {
    const { deliveryID, driverRUT } = req.body;
    const success = await DeliveryService.assignDriver(deliveryID, driverRUT);
    if (!success) {
      return res.status(404).json({ message: `No se pudo asignar el chofer. Delivery ${deliveryID} no encontrada?` });
    }
    res.json({ message: `Chofer ${driverRUT} asignado a la entrega ${deliveryID}` });
  } catch (error) {
    console.error('❌ Error asignando chofer:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

exports.updateDeliveryStatus = async (req, res) => {
  try {
    const { deliveryID, newStatus } = req.body;
    const success = await DeliveryService.updateDeliveryStatus(deliveryID, newStatus);
    if (!success) {
      return res.status(404).json({ message: `No se pudo actualizar estado. Delivery ${deliveryID} no encontrada?` });
    }
    res.json({ message: `Estado de la entrega ${deliveryID} actualizado a ${newStatus}` });
  } catch (error) {
    console.error('❌ Error actualizando estado de delivery:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

exports.getDeliveryById = async (req, res) => {
  try {
    const { id } = req.params;
    const delivery = await DeliveryService.getDeliveryById(id);
    if (!delivery) {
      return res.status(404).json({ message: 'Delivery no encontrada' });
    }
    res.json(delivery);
  } catch (error) {
    console.error('❌ Error obteniendo delivery:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

exports.getDeliveryByOrder = async (req, res) => {
  try {
    const { orderID } = req.params;
    const deliveries = await DeliveryService.getDeliveryByOrder(orderID);
    res.json(deliveries);
  } catch (error) {
    console.error('❌ Error obteniendo deliveries por orderID:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

exports.getAllDeliveries = async (req, res) => {
  try {
    const list = await DeliveryService.getAllDeliveries();
    res.json(list);
  } catch (error) {
    console.error('❌ Error obteniendo todas las entregas:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
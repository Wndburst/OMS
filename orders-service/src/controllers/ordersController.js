const OrdersService = require('../services/ordersService');

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await OrdersService.getAllOrders();
    res.json(orders);
  } catch (error) {
    console.error('Error obteniendo órdenes:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await OrdersService.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }
    res.json(order);
  } catch (error) {
    console.error('Error obteniendo orden:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
exports.getHistory = async (req, res) => {
  try {
    const order = await OrdersService.getHistory(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }
    res.json(order);
  } catch (error) {
    console.error('Error obteniendo orden:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const updated = await OrdersService.updateOrderStatus(req.params.id, req.body.orderStatusID);
    if (!updated) return res.status(404).json({ message: 'Orden no encontrada' });
    res.json({ message: 'Estado actualizado correctamente' });
  } catch (error) {
    console.error('Error actualizando estado:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

exports.updateOrderProduct = async (req, res) => {
  try {
    const { pickedQuantity } = req.body;
    const updated = await OrdersService.updateOrderProduct(req.params.orderProductID, pickedQuantity);
    if (!updated) return res.status(404).json({ message: 'Producto no encontrado o ya completado' });

    res.json({ message: 'Producto actualizado correctamente' });
  } catch (error) {
    console.error('Error actualizando producto:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

exports.getMaxCreatets = async (req, res) => {
  try {
    const maxCreatets = await OrdersService.getMaxCreatets();
    
    console.log(`🔍 maxCreatets obtenido en Controller: ${maxCreatets}`);

    res.json({ maxCreatets });  // Devolvemos un 200 con el valor
  } catch (error) {
    console.error('❌ Error en getMaxCreatets:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

exports.getLastQueryDate = async (req, res) => {
  try {
    const lastQueryDate = await OrdersService.getLastQueryDate();
    
    console.log(`🔍 lastQueryDate obtenido en Controller: ${lastQueryDate}`);

    res.json({ lastQueryDate });  // Devolvemos un 200 con el valor
  } catch (error) {
    console.error('❌ Error en getLastQueryDate:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
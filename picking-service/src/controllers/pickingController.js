const PickingService = require('../services/pickingService');

exports.assignPickers = async (req, res) => {
  try {
    const { orderID, pickerAssignments } = req.body;
    const newStatus = await PickingService.assignPickers(orderID, pickerAssignments);

    if (!newStatus) {
      return res.status(404).json({ message: 'No hay productos pendientes en esta orden.' });
    }

    const statusMessage = (newStatus === 3)
      ? 'Todos los productos tienen pickers asignados. Estado: En Picking'
      : 'Algunos productos aún no tienen pickers asignados. Estado: Asignando Pickers';

    res.json({ 
      message: 'Pickers asignados correctamente', 
      status: newStatus, 
      statusMessage 
    });
  } catch (error) {
    console.error('❌ Error asignando pickers:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

exports.updatePickedProduct = async (req, res) => {
  try {
    const { pickedQuantity } = req.body;
    const updated = await PickingService.updatePickedProduct(req.params.orderProductID, pickedQuantity);
    if (!updated) {
      return res.status(404).json({ message: 'Producto no encontrado o ya completado' });
    }
    res.json({ message: 'Producto actualizado correctamente' });
  } catch (error) {
    console.error('❌ Error actualizando producto:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

exports.completePicking = async (req, res) => {
  try {
    const completed = await PickingService.completePicking(req.params.orderID);
    if (!completed) {
      return res.status(404).json({ message: 'Aún hay productos pendientes' });
    }
    res.json({ message: 'Picking completado y notificado correctamente' });
  } catch (error) {
    console.error('❌ Error completando picking:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

exports.getProductsFromOrder = async (req, res) => {
  try {
      const products = await PickingService.getProductsFromOrder(req.params.orderID);
      if (!products || products.length === 0) {
          return res.status(400).json({ message: 'No hay productos en la orden' });
      }
      res.json(products);
  } catch (error) {
      console.error('❌ Error obtener productos:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
  }
};

exports.createBundle = async (req, res) => {
  try {
    const { orderID, pickerRUT, products } = req.body;
    const bundleID = await PickingService.createBundle(orderID, pickerRUT, products);

    if (!bundleID) {
      return res.status(500).json({ message: 'Error al crear el bulto' });
    }

    res.status(201).json({ message: 'Bulto creado con éxito', bundleID });
  } catch (error) {
    console.error('❌ Error creando bulto:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
exports.markProductAsLoose = async (req, res) => {
  try {
    const { orderProductID } = req.body;
    const updated = await PickingService.markProductAsLoose(orderProductID);

    if (!updated) {
      return res.status(404).json({ message: 'No se pudo actualizar el producto' });
    }

    res.json({ message: 'Producto marcado como suelto' });
  } catch (error) {
    console.error('❌ Error marcando producto como suelto:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

exports.getBundlesByOrder = async (req, res) => {
  try {
    const bundles = await PickingService.getBundlesByOrder(req.params.orderID);
    res.json(bundles);
  } catch (error) {
    console.error('❌ Error obteniendo bultos:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

exports.getBundleDetails = async (req, res) => {
  try {
    const bundle = await PickingService.getBundleDetails(req.params.bundleID);
    res.json(bundle);
  } catch (error) {
    console.error('❌ Error obteniendo detalles del bulto:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

exports.getOrderProductsWithBundleID = async (req, res) => {
  try {
    const products = await PickingService.getOrderProductsWithBundleID(req.params.orderID);
    res.json(products);
  } catch (error) {
    console.error('❌ Error obteniendo productos de la orden:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
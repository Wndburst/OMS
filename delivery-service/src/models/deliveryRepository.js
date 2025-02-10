const pool = require('../config/db');

const DeliveryRepository = {
  // Crear una nueva entrega (ej, cuando se completa el picking)
  createDelivery: async (orderID, driverRUT = null) => {
    // Por defecto, le damos un deliveryStatusID = 1 (p. ej. "Pendiente de asignar")
    const [result] = await pool.query(`
      INSERT INTO Delivery (orderID, driverRUT, deliveryStatusID, assignedAt)
      VALUES (?, ?, 1, null)
    `, [orderID, driverRUT]);
    return result.insertId;
  },

  // Asignar chofer y cambiar estado
  assignDriver: async (deliveryID, driverRUT) => {
    const [result] = await pool.query(`
      UPDATE Delivery
      SET driverRUT = ?, deliveryStatusID = 2, assignedAt = NOW()
      WHERE deliveryID = ?
    `, [driverRUT, deliveryID]);
    return result.affectedRows > 0;
  },

  // Actualizar estado de entrega
  updateDeliveryStatus: async (deliveryID, newStatus) => {
    // Si newStatus = 3 => "En Ruta", 4 => "Entregado", etc.
    let completedAtQuery = '';
    if (newStatus === 4) {
      // Si el estado 4 es "Entregado", guardamos la hora de finalización
      completedAtQuery = ', completedAt = NOW()';
    }
    const [result] = await pool.query(`
      UPDATE Delivery
      SET deliveryStatusID = ? ${completedAtQuery}
      WHERE deliveryID = ?
    `, [newStatus, deliveryID]);
    return result.affectedRows > 0;
  },

  // Obtener entrega por ID
  getDeliveryById: async (deliveryID) => {
    const [rows] = await pool.query(`
      SELECT d.*, ds.statusName
      FROM Delivery d
      LEFT JOIN Delivery_Status ds ON d.deliveryStatusID = ds.deliveryStatusID
      WHERE d.deliveryID = ?
    `, [deliveryID]);
    return rows[0] || null;
  },

  // Obtener entregas por orderID
  getDeliveryByOrder: async (orderID) => {
    const [rows] = await pool.query(`
      SELECT d.*, ds.statusName
      FROM Delivery d
      LEFT JOIN Delivery_Status ds ON d.deliveryStatusID = ds.deliveryStatusID
      WHERE d.orderID = ?
    `, [orderID]);
    return rows;
  },

  // Obtener todas las entregas
  getAllDeliveries: async () => {
    const [rows] = await pool.query(`
      SELECT d.*, ds.statusName
      FROM Delivery d
      LEFT JOIN Delivery_Status ds ON d.deliveryStatusID = ds.deliveryStatusID
    `);
    return rows;
  },

  // Ejemplo: Verificar si ya existe una entrega para la orden
  existsDeliveryForOrder: async (orderID) => {
    const [rows] = await pool.query(`
      SELECT COUNT(*) as count
      FROM Delivery
      WHERE orderID = ?
    `, [orderID]);
    return rows[0].count > 0;
  },
};

module.exports = DeliveryRepository;

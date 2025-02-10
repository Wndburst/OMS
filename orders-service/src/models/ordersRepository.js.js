const pool = require('../config/db');

const OrdersRepository = {
  getAllOrders: async () => {
    const [orders] = await pool.query('SELECT * FROM Orders');
    return orders;
  },

  getOrderById: async (orderID) => {
    const [order] = await pool.query('SELECT * FROM Orders WHERE orderID = ?', [orderID]);
    return order.length ? order[0] : null;
  },

  updateOrderStatus: async (orderID, orderStatusID) => {
    const [result] = await pool.query(
      'UPDATE Orders SET orderStatusID = ? WHERE orderID = ?',
      [orderStatusID, orderID]
    );
    return result.affectedRows > 0;
  },

  createOrder: async (orderData) => {
    const [result] = await pool.query('INSERT INTO Orders SET ?', orderData);
    return result.insertId;
  },

  // Verificar si una orden está completa
  isOrderComplete: async (orderID) => {
    const [rows] = await pool.query(`
      SELECT COUNT(*) as pending 
      FROM Order_Product
      WHERE orderID = ?
        AND pickingStatusID != (
          SELECT pickingStatusID 
          FROM Picking_Status 
          WHERE statusName = 'Completado'
        )
    `, [orderID]);
    return rows[0].pending === 0;
  },

  // Actualizar productos recogidos en la orden
  updateOrderProduct: async (orderProductID, pickedQuantity) => {
    const [result] = await pool.query(`
      UPDATE Order_Product 
      SET pickedQuantity = pickedQuantity + ?, 
          pickingStatusID = CASE 
            WHEN pickedQuantity + ? >= quantity 
            THEN (SELECT pickingStatusID FROM Picking_Status WHERE statusName = 'Completado')
            ELSE pickingStatusID 
          END
      WHERE orderProductID = ?
    `, [pickedQuantity, pickedQuantity, orderProductID]);

    return result.affectedRows > 0;
  },


  getMaxCreatets: async () => {
    const [rows] = await pool.query(`
      SELECT MAX(createts) AS createts FROM Orders
    `);
    console.log("🔎 Query ejecutada: ", rows);
    // Devuelve "000000" si no hay registros
    return rows[0]?.createts || "000000"; 
  },


  getLastQueryDate: async () => {
    const [rows] = await pool.query(`
      SELECT MAX(lastquerydate) as lastquerydate FROM Orders 
    `);
    console.log("🔎 Query ejecutada: ", rows);
    // Devuelve "000000" si no hay registros
    return rows[0]?.lastquerydate 
  }

};

module.exports = OrdersRepository;

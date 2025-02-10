const pool = require('../config/db');

module.exports = {
'new.order.created': async (msg) => {
    console.log(`📥 Recibida nueva orden con orderID=${msg.orderID} en Picking Service...`);
    if (!msg.products || msg.products.length === 0) {
        console.warn(`⚠️ No hay productos en la orden ${msg.orderID}, se omite registro en Picking Service.`);
        return;
    }
    for (let product of msg.products) {
      await pool.query(`
        INSERT INTO Order_Product (orderID, itemcode, quantity, pickedQuantity, pickingStatusID)
        VALUES (?, ?, ?, 0, 1)
        ON DUPLICATE KEY UPDATE quantity = VALUES(quantity)
      `, [msg.orderID, product.itemcode, product.quantity]);
    }
    console.log(`✅ Productos de la orden ${msg.orderID} registrados en Picking Service`);
}
,

  'order.status.updated': async (msg) => {
    // Aquí puedes examinar `msg.newStatus` y reaccionar
    if (msg.newStatus === 2) {
      console.log(`📦 Orden ${msg.orderID} pasó a "Asignando Pickers", verificando asignación...`);
      const [products] = await pool.query(
        `SELECT orderProductID FROM Order_Product WHERE orderID = ?`, 
        [msg.orderID]
      );
      if (products.length === 0) {
        console.warn(`⚠️ No hay productos en la orden ${msg.orderID} para asignar pickers.`);
      } else {
        console.log(`📌 La orden ${msg.orderID} tiene ${products.length} productos pendientes de asignación.`);
      }
    }

    if (msg.newStatus === 3) {
      console.log(`✅ Orden ${msg.orderID} ahora está "En Picking". Se pueden empezar a recoger productos.`);
    }
  },
};

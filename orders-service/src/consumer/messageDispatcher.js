const pool = require('../config/db');
const OrdersService = require('../services/ordersService');
const { sendMessage } = require('../producer');


module.exports = {
  /**
   * Procesa el mensaje de 'sap.order.imported'
   */
  'sap.order.imported': async (msg) => {
    await pool.query(`
      INSERT INTO Orders (
        docentry, docnum, folionum, cardcode, cardname, phone1, e_mail, 
        itemsAmount, doctotalsy, orderStatusID, paymentMethodID, 
        deliveryTypeID, salesChannelID, recipient, deliveryDate, createdate,createts
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        docentry       = IF(VALUES(docentry) IS NOT NULL, VALUES(docentry), docentry),
        docnum         = VALUES(docnum),
        cardcode       = VALUES(cardcode),
        cardname       = VALUES(cardname),
        phone1         = VALUES(phone1),
        e_mail         = VALUES(e_mail),
        itemsAmount    = VALUES(itemsAmount),
        doctotalsy     = VALUES(doctotalsy),
        paymentMethodID= VALUES(paymentMethodID),
        deliveryTypeID = VALUES(deliveryTypeID),
        salesChannelID = VALUES(salesChannelID),
        recipient      = VALUES(recipient),
        deliveryDate   = VALUES(deliveryDate),
        createdate     = VALUES(createdate),
        createts       = VALUES(createts)
    `, [
      msg.docentry, msg.docnum, msg.folionum, msg.cardcode, msg.cardname, msg.phone1, msg.e_mail,
      msg.itemsAmount, msg.doctotalsy, msg.orderStatusID, msg.paymentMethodID,
      msg.deliveryTypeID, msg.salesChannelID, msg.recipient, msg.deliveryDate, 
      msg.createdate, msg.createts
    ]);

    const [orderRow] = await pool.query('SELECT * FROM Orders where folionum = ?', [msg.folionum]);

    if (orderRow.length === 0) {
      console.error(`❌ Error: No se encontró la orden después de insertarla.`);
      return;
    }
    
    console.log(`✅ Orden ${msg.orderID} creada/actualizada en Orders Service`);
    const order = orderRow[0];

    // 📤 Enviar mensaje con la orden completa, incluyendo orderID
    await sendMessage('new.order.created', {...order, products: msg.products});
    console.log(`📤 Evento new.order.created enviado para orderID=${order.orderID}`);

  },

  /**
   * Procesa el mensaje de 'order.status.updated'
   */
  'order.status.updated': async (msg) => {
    console.log(`🔄 Actualizando estado de la orden ${msg.orderID} a estado ${msg.newStatus}...`);
    await OrdersService.updateOrderStatus(msg.orderID, msg.newStatus);

    // Ejemplo: puedes abstraer estos 'switch' en un "State" Pattern
    switch (msg.newStatus) {
      case 2:
        console.log(`📦 Orden ${msg.orderID} ahora está en "Asignando Pickers".`);
        break;
      case 3:
        console.log(`📦 Orden ${msg.orderID} ahora está "En Picking".`);
        break;
      case 4:
        console.log(`⚠️ Orden ${msg.orderID} está "Picking Completado Parcialmente" (Faltan productos).`);
        break;
      case 5:
        console.log(`✅ Orden ${msg.orderID} ahora está "Picking Completado".`);
        break;
      default:
        console.log(`ℹ️ Estado de la orden ${msg.orderID} actualizado a ${msg.newStatus}.`);
        break;
    }
  },
};

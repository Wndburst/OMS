const kafka = require('../config/kafka');
const PickingModel = require('../models/pickingModel');
const pool = require('../config/db');

const consumer = kafka.consumer({ groupId: 'picking-service-group', retry: { retries: 5 } });

const consumeMessages = async () => {
    await consumer.connect();
    console.log('✅ Consumer de Picking conectado a Kafka');

    // 📌 Suscribirse a los eventos relevantes
    await consumer.subscribe({ topic: 'sap.order.imported', fromBeginning: false });
    await consumer.subscribe({ topic: 'order.status.updated', fromBeginning: false });

    await consumer.run({
        autoCommit: false,
        eachMessage: async ({ topic, partition, message, heartbeat }) => {
            const msg = JSON.parse(message.value.toString());
            console.log(`📥 Mensaje recibido de Kafka [${topic}]:`, msg);

            try {
                if (topic === 'sap.order.imported') {
                    console.log(`📥 Registrando productos de la orden ${msg.orderID} en Picking Service...`);

                    for (let product of msg.products) {
                        await pool.query(`
                            INSERT INTO Order_Product (orderID, itemcode, quantity, pickedQuantity, pickingStatusID)
                            VALUES (?, ?, ?, 0, 1)
                            ON DUPLICATE KEY UPDATE quantity = VALUES(quantity)`,
                            [msg.orderID, product.itemcode, product.quantity]
                        );
                    }

                    console.log(`✅ Productos de la orden ${msg.orderID} registrados en Picking Service`);
                }

                if (topic === 'order.status.updated' && msg.newStatus === 2) {
                    console.log(`📦 Orden ${msg.orderID} pasó a "Asignando Pickers", verificando asignación...`);
                    
                    // Obtener los productos de la orden
                    const [products] = await pool.query(
                        `SELECT orderProductID FROM Order_Product WHERE orderID = ?`, [msg.orderID]
                    );

                    if (products.length === 0) {
                        console.warn(`⚠️ No hay productos en la orden ${msg.orderID} para asignar pickers.`);
                    } else {
                        console.log(`📌 La orden ${msg.orderID} tiene productos pendientes de asignación.`);
                    }
                }

                if (topic === 'order.status.updated' && msg.newStatus === 3) {
                    console.log(`✅ Orden ${msg.orderID} ahora está "En Picking", se pueden empezar a recoger productos.`);
                }

                await consumer.commitOffsets([{ topic, partition, offset: (Number(message.offset) + 1).toString() }]);
                await heartbeat();

            } catch (error) {
                console.error(`❌ Error procesando mensaje de ${topic}:`, error);
            }
        },
    });
};

module.exports = consumeMessages;

const kafka = require('../config/kafka');
const dispatcher = require('./messageDispatcher');

const consumer = kafka.consumer({
  groupId: 'delivery-service-group',
  retry: { retries: 5 }
});

const consumeMessages = async () => {
  try {
    await consumer.connect();
    console.log('✅ Consumer de Delivery conectado a Kafka');

    // Suscribirse a tópicos relevantes
    await consumer.subscribe({ topic: 'picking.completed', fromBeginning: false });
    await consumer.subscribe({ topic: 'order.status.updated', fromBeginning: false });

    await consumer.run({
      autoCommit: false,
      eachMessage: async ({ topic, partition, message, heartbeat }) => {
        const msg = JSON.parse(message.value.toString());
        console.log(`📥 Mensaje recibido [${topic}]:`, msg);

        try {
          const handler = dispatcher[topic];
          if (handler) {
            await handler(msg);
          } else {
            console.warn(`⚠️ No hay manejador para el tópico: ${topic}`);
          }

          await consumer.commitOffsets([{
            topic,
            partition,
            offset: (Number(message.offset) + 1).toString()
          }]);
          await heartbeat();
        } catch (error) {
          console.error(`❌ Error procesando mensaje de ${topic}:`, error);
        }
      }
    });
  } catch (err) {
    console.error('❌ Error iniciando consumer de Delivery:', err);
  }
};

module.exports = consumeMessages;

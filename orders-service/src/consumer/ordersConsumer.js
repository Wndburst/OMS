const kafka = require('../config/kafka');
const dispatcher = require('./messageDispatcher');

const consumer = kafka.consumer({ 
  groupId: 'orders-service-group',
  retry: { retries: 5 } 
});

const consumeMessages = async () => {
  try {
    await consumer.connect();
    console.log('✅ Consumer de Orders conectado a Kafka');

    // Suscribirse a los tópicos que deseamos escuchar
    await consumer.subscribe({ topic: 'sap.order.imported', fromBeginning: false });
    await consumer.subscribe({ topic: 'order.status.updated', fromBeginning: false });

    await consumer.run({
      autoCommit: false,
      eachMessage: async ({ topic, partition, message, heartbeat }) => {
        const msg = JSON.parse(message.value.toString());
        console.log(`📥 Mensaje recibido de Kafka [${topic}]:`, msg);

        try {
          // Uso del dispatcher (Command Pattern)
          if (dispatcher[topic]) {
            await dispatcher[topic](msg);
          } else {
            console.warn(`⚠️ No existe un manejador para el tópico: ${topic}`);
          }

          // Confirmar offset y hacer heartbeat
          await consumer.commitOffsets([
            { topic, partition, offset: (Number(message.offset) + 1).toString() }
          ]);
          await heartbeat();
        } catch (error) {
          console.error(`❌ Error procesando mensaje de ${topic}:`, error);
        }
      },
    });
  } catch (error) {
    console.error('❌ Error iniciando el consumidor de Kafka:', error);
  }
};

module.exports = consumeMessages;
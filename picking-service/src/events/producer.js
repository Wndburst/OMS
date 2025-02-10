const kafka = require('../config/kafka');

const producer = kafka.producer();

const sendMessage = async (topic, message) => {
    try {
        await producer.connect();
        await producer.send({
            topic,
            messages: [{ value: JSON.stringify(message) }],
        });
        console.log(`📤 Mensaje enviado a Kafka [${topic}]:`, message);
    } catch (error) {
        console.error('❌ Error enviando mensaje a Kafka:', error);
    } finally {
        await producer.disconnect();
    }
};

module.exports = sendMessage;

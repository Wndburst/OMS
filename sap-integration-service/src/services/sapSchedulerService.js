const axios = require('axios');
const cron = require('node-cron');
const { sendMessage } = require('../producer');
const ORDERS_SERVICE_URL = process.env.ORDERS_SERVICE_URL;
const SAP_ENDPOINT = process.env.SAP_ENDPOINT;
const RETAIL_ENDPOINT = process.env.RETAIL_ENDPOINT;


// Obtener el createts máximo de las órdenes
async function getMaxCreatets() {
  const response = await axios.get(`${ORDERS_SERVICE_URL}/api/orders/max/createts`);
  return response.data.maxCreatets || '000000';
}

// Obtener las órdenes desde SAP
async function fetchOrdersFromSap(createts) {
  // 2. Llamar al endpoint SAP con createts
  const { data } = await axios.get(`${SAP_ENDPOINT}?createts=${createts}`);
  return data;
}

async function processNewOrders() {
  try {
    // a) Obtener el max createts
    const maxCreatets = await getMaxCreatets();
    console.log(`🔍 maxCreatets obtenido de orders-service: ${maxCreatets}`);

    // b) Llamar al endpoint SAP con ese createts
    const orders = await fetchOrdersFromSap(maxCreatets);
    console.log(`📥 Se obtuvieron ${orders.length} órdenes nuevas desde SAP`);

    // c) Enviar cada orden a Kafka -> sap.order.imported
    for (let order of orders) {
      console.log(`📦 Procesando orden orderID=${order.orderID}, createts=${order.createts}`);
      await sendMessage('sap.order.imported', order);
    }

    console.log('✅ Proceso completado. Órdenes enviadas a Kafka.');
  } catch (error) {
    console.error('❌ Error en processNewOrders:', error);
  }
}


// Función para crear una orden a partir del folionum 
async function createNewOrder(folionum) {
  try {
    let { data: order } = await axios.get(`http://192.168.0.91:5021/${folionum}`);
    
    // Si la respuesta es un array, tomar el primer elemento para mantener el mismo formato que SAP
    if (Array.isArray(order)) {
      order = order[0];
    }

    console.log(`📥 Se obtuvo la orden con folionum: ${folionum}`);
    console.log(`📦 Procesando orden orderID=${order.orderID}`);
    
    // Enviar la orden a Kafka
    await sendMessage('sap.order.imported', order);
    console.log('✅ Proceso completado. Orden enviada a Kafka.');
  } catch (error) {
    console.error('❌ Error en createNewOrder:', error);
    throw error;
  }
}


//Cron job que se ejecuta cada 10 min
function startScheduler() {
  // Expresión cron: "*/10 * * * *" => cada 10 minutos
  cron.schedule('*/1 * * * *', async () => {
    console.log('⏰ [CRON] Ejecutando job para traer órdenes desde SAP...');
    await processNewOrders();
  });
  console.log('✅ Cron job iniciado (cada 10 minutos)');
}

module.exports = {
  processNewOrders,
  startScheduler,
  createNewOrder
};

const { processNewOrders } = require('../../services/sapSchedulerService');

exports.runScheduler = async (req, res) => {
  try {
    await processNewOrders();
    res.json({ message: 'Proceso completado. Revisa logs para más detalles.' });
  } catch (error) {
    console.error('❌ Error en runScheduler:', error);
    res.status(500).json({ message: 'Error al ejecutar el scheduler' });
  }
};

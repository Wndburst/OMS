const express = require('express');
const { runScheduler } = require('../config/controllers/schedulerController');

const router = express.Router();

router.post('/execute', runScheduler); 
// Al hacer POST /api/scheduler/execute se dispara el mismo proceso manualmente

module.exports = router;

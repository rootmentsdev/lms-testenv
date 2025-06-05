const express = require('express');
const { migrateCompletedTraining } = require('../controllers/TrainingController');
const router = express.Router();

// Endpoint to trigger training migration
router.post('/migrate-training', migrateCompletedTraining);

module.exports = router;


const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const exerciseController = require('../controllers/exerciseController');
router.get('/exercises/:id', exerciseController.getExercise);
router.post(
  '/exercises',
  upload.array('files'),
  exerciseController.createExercise
);
router.post('/exercises/:id', exerciseController.updateExercise);
router.delete('/exercises/:id', exerciseController.deleteExercise);

module.exports = router;

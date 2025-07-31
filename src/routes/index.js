const express = require('express');
const router = express.Router();
const exerciseRoutes = require('./exerciseRoutes');
const userRoutes = require('./userRoutes');
const validateToken = require('../middleware/validateJwtToken');

const userController = require('../controllers/userController');
const exerciseController = require('../controllers/exerciseController');
router.get('/api/exercises', exerciseController.getAllExercises);
router.get('/api/exercises/:id/details', exerciseController.getExerciseDetails);
router.post('/api/users/login', userController.adminLogin);

// router.use(validateToken);
router.use('/api/', [exerciseRoutes, userRoutes]);

module.exports = router;

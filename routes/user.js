const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user');
const { auth } = require('../middlewares/auth');

// Definir rutas
router.get('/prueba-user', auth , UserController.pruebaUser);
router.post('/register',UserController.register);
router.post('/login',UserController.login);
router.get('/user/:id', auth , UserController.getUser);
router.get('/list/:page?', auth , UserController.list);
router.put('/update', auth , UserController.update);

// Exportar router
module.exports = router;





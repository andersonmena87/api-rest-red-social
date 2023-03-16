const express = require('express');
const router = express.Router();
const multer = require('multer'); //middleware
const UserController = require('../controllers/user');
const { auth } = require('../middlewares/auth');

// Configuración de subida
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/avatars/');
    },
    filename: (req, file, cb) => {
        cb(null, `avatar-${Date.now()}-${file.originalname}`);
    }
});

const uploads = multer({ storage });

// Definir rutas
router.get('/prueba-user', auth, UserController.pruebaUser);
router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.get('/user/:id', auth, UserController.getUser);
router.get('/list/:page?', auth, UserController.list);
router.put('/update', auth, UserController.update);
router.get('/avatar/:file', UserController.avatar);
router.get('/counters/:id?', auth, UserController.counters);

// Para ejecutar varios middlewreas se pasan como en un arreglo
router.post('/upload', [auth, uploads.single('file0')], UserController.upload);

// Exportar router
module.exports = router;





const express = require('express');
const router = express.Router();
const PublicationController = require('../controllers/publication');
const { auth } = require('../middlewares/auth');
const multer = require('multer'); //middleware

// Configuración de subida
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/publications/');
    },
    filename: (req, file, cb) => {
        cb(null, `publication-${Date.now()}-${file.originalname}`);
    }
});

const uploads = multer({ storage });

// Definir rutas
router.post('/save/:id?', auth, PublicationController.save);
router.get('/publication/:id', auth, PublicationController.getPublication);
router.get('/list/:page?', auth, PublicationController.list);
router.delete('/publication/:id', auth, PublicationController.deletePublication);
router.get('/user/:id?/:page?', auth, PublicationController.publicationsByUser);
router.post('/upload/:id', [auth, uploads.single('file0')], PublicationController.upload);
router.get('/image-publication/:file', auth, PublicationController.imagePublication);


// Ruta de prueba
router.get('/prueba-publication', PublicationController.pruebaPublication);


// Exportar router
module.exports = router;





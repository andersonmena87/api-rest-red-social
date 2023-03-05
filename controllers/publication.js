// Acciones de prueba
const pruebaPublication = (req, res) => {
    return res.status(200).send({
        message: 'Mensaje enviado desde el controllers/publication.js'
    });
}

// Exporar acciones
module.exports = {
    pruebaPublication
}

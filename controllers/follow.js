// Acciones de prueba
const pruebaFollow = (req, res) => {
    return res.status(200).send({
        message: 'Mensaje enviado desde el controllers/follow.js'
    });
}

// Exporar acciones
module.exports = {
    pruebaFollow
}

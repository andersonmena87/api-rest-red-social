// Importar dependencias
const jwt = require('jwt-simple');
const moment = require('moment');

//Clave sercreta
const secret = 'CLAVE_SECRETA_RED_SOLCIAL_10201020';

// Crear una función para generar tokens
const createToken = (user) => {
    const payload = {
        id: user._id,
        name: user.name,
        surname: user.surname,
        nick: user.nick,
        email: user.email,
        role: user.role,
        imagen: user.image,
        iat: moment().unix(),//Monento en el que se esta creando el token
        exp: moment().add(30, 'days').unix()// Fecha de expiración
    }

    // Devolver jwt token codificado
    return jwt.encode(payload, secret);
}

module.exports = {
    createToken,
    secret
}


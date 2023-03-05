// Importar dependencias y modulos
const User = require('../models/user');

// Acciones de prueba
const pruebaUser = (req, res) => {
    return res.status(200).send({
        message: 'Mensaje enviado desde el controllers/user.js'
    });
}

// Registro de usuarios
const register = (req, res) => {
    // Recoger datos de la petición
    const params = req.body;
    

    // Comprobar que llega bien (Validación)
    if(!params.name || !params.email || !params.password || !params.nick){
        return res.status(400).json({
            status: 'error',
            message: 'Faltan datos por ingresar'
        });
    }

    // Crear objeto de usuario
    let user_to_save = new User(params);


    // Control de usuarios duplicados
    User.find({ $or: [
        {email: user_to_save.email.toLowerCase()},
        {nick: user_to_save.nick.toLowerCase()}
    ]}).exec((error, users) => {
        if(error){
            return res.status(500).json({
                status: 'error',
                message: 'Error en la consulta de datos'
            })
        }

        if(users && users.length > 0){
            return res.status(400).json({
                status: 'error',
                message: 'El usaurio ya existe, email o nick ya fueron registrados en la base de datos'
            })
        }

        // Cifrar contraseña

        // Guardar en db
        return res.status(200).json({
            status: 'success',
            message: 'Acción de registro de usuarios',
            params,
            user_to_save
        });
    });


    
}


// Exporar acciones
module.exports = {
    pruebaUser,
    register
}

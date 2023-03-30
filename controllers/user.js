// Importar dependencias y modulos
const Messages = require('../utilities/messages.json');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const jwt = require('../services/jwt');
const followService = require('../services/followService');
const Follow = require('../models/follow');
const Publications = require('../models/publication');

// Librerías de nodeJS
const fs = require('fs');
const path = require('path');

// Acciones de prueba
const pruebaUser = (req, res) => {
    return res.status(200).send({
        message: 'Mensaje enviado desde el controllers/user.js',
        user: req.user
    });
}

// Registro de usuarios
const register = (req, res) => {
    // Recoger datos de la petición
    const params = req.body;

    // Comprobar que llega bien (Validación)
    if (!params.name || !params.email || !params.password || !params.nick) {
        return res.status(400).json({
            status: Messages.error,
            message: 'Faltan datos por ingresar'
        });
    }

    // Control de usuarios duplicados
    User.find({
        $or: [
            { email: params.email.toLowerCase() },
            { nick: params.nick.toLowerCase() }
        ]
    })
        .then(async (users) => {
            if (users && users.length > 0) {
                return res.status(400).json({
                    status: Messages.error,
                    message: 'El usuario ya existe, email o nick ya fueron registrados en la base de datos'
                })
            }

            // Cifrar contraseña
            // El 10 indica el número de veces que se cifrará o encryotará
            let pwd = await bcrypt.hash(params.password, 10);
            params.password = pwd;

            // Crear objeto de usuario
            let user_to_save = new User(params);

            // Guardar en la bbdd
            user_to_save.save()
                .then(userStored => {
                    return res.status(200).json({
                        status: Messages.success,
                        message: 'Acción de registro de usuarios',
                        user: userStored
                    });
                })
                .catch(error => {
                    return res.status(500).send({
                        status: Messages.error,
                        message: `Error al guardar el usuario ${error}`
                    })
                });
        })
        .catch(error => {
            return res.status(500).json({
                status: Messages.error,
                message: `Error en la consulta de datos: ${error}`
            })
        });
}

const login = (req, res) => {
    // Recoger parametros body
    const params = req.body;

    if (!params.email || !params.password) {
        return res.status(400).send({
            status: Messages.error,
            message: 'Faltan datos por enviar'
        });
    }


    // Buscar en la bbdd si existe 
    User.findOne({ email: params.email })
        // select restringe campos
        //.select({ 'password': 0 })
        .then(user => {
            // Comprobar contraseña
            const pwd = bcrypt.compareSync(params.password, user.password);

            if (!pwd) {
                return res.status(400).send({
                    status: Messages.error,
                    message: 'No te has identificado correctamente',
                })
            }

            // Conseguir el Token
            const token = jwt.createToken(user);

            // Devolver Datos el usuario
            return res.status(200).send({
                status: Messages.success,
                message: 'Te has identificado correctamente',
                user: {
                    id: user._id,
                    name: user.name,
                    nick: user.nick
                },
                token
            })
        })
        .catch(error => {

            return res.status(404).send({
                status: Messages.error,
                message: 'No existe el usuario',
                error
            })
        })

}

const getUser = (req, res) => {
    // Recibir el paremetro del id de usuario por la url
    const { id } = req.params;

    if (!id) {
        res.status(400).send({
            status: Messages.error,
            message: 'Debe enviar el id del usuario',
            id
        });
    }

    // Consulta para sacar los datos del usuario
    User.findById(id)
        // Quita los campos password y role del resultado
        .select({ password: 0, role: 0 })
        .then(async (userStored) => {
            // Devolver el resultado
            // Posteriormente: Devolver información de follows

            // Info seguimiento
            const followInfo = await followService.followThisUser(req.user.id, id);

            res.status(200).send({
                status: Messages.success,
                message: 'Usuario cargado con éxito!!',
                userStored,
                followwing: followInfo.following,
                follower: followInfo.follower
            });
        })
        .catch(error => {
            res.status(404).send({
                status: Messages.error,
                message: `No se encontraron datos con el id ${id}`,
                error
            });
        });
}

const list = (req, res) => {
    // controlar en que página estamos
    let pageDefault = 1;
    let { page } = req.params;

    if (!page) {
        page = pageDefault;
    }

    page = parseInt(page);
    // Consulta con mongoose paginate
    let itemsPerPage = 5;

    User.paginate({}, { page, limit: itemsPerPage, select: '-role -password -__v -email' })
        .then(async (result) => {

            // Sacar un array de ids de los usuarios que me siguen y los que sigo
            let followsUserId = await followService.folloUserIds(req.user.id);

            return res.status(200).send({
                status: Messages.success,
                message: 'Listado de usuarios',
                page,
                users: result.docs,
                total: result.totalDocs,
                itemsPerPage,
                page: result.page,
                pages: result.totalPages,
                user_following: followsUserId.following,
                user_follow_me: followsUserId.followers
            });
        }
        )
        .catch(error => {
            return res.status(404).send({
                status: Messages.error,
                message: 'No hay usuarios disponibles',
                error
            });
        });
}

const update = (req, res) => {
    // Recoger info del usaurio a actualizar
    let userIdentity = req.user;
    let user_to_update = req.body;

    //Limpiar datos del usuario
    delete userIdentity.password;
    delete userIdentity.image;
    delete userIdentity.iat;
    delete userIdentity.exp;
    delete userIdentity.role;

    //Comporbar si el usuario ya existe
    User.find({
        $or: [
            { email: user_to_update.email.toLowerCase() },
            { nick: user_to_update.nick.toLowerCase() }
        ]
    })
        .then(async (users) => {

            let userIsSet = false;

            users.forEach(user => {
                if (user && user._id.valueOf() !== userIdentity.id) {
                    userIsSet = true;
                }
            })

            if (userIsSet) {
                return res.status(400).json({
                    status: Messages.error,
                    message: 'El usuario ya existe, email o nick ya fueron registrados en la base de datos'
                })
            }

            if (user_to_update.password) {
                // Cifrar contraseña
                // El 10 indica el número de veces que se cifrará o encryotará
                let pwd = await bcrypt.hash(user_to_update.password, 10);
                user_to_update.password = pwd;
            }else {
                // Si la contraseña llega vacia se elimina la propiedad password del objeto que enviara a actualizar
                delete user_to_update.password;
            }

            // Buscar y actualizar
            User.findByIdAndUpdate(userIdentity.id, user_to_update, { new: true })
                .select({ password: 0, role: 0 })
                .then(userStored => {
                    return res.status(200).json({
                        status: Messages.success,
                        message: 'Usuario actualizado',
                        user: userStored
                    });
                })
                .catch(error => {
                    return res.status(500).send({
                        status: Messages.error,
                        message: `Error al actualizar el usuario ${error}`
                    })
                });
        })
        .catch(error => {
            return res.status(500).json({
                status: Messages.error,
                message: `Error en la consulta de datos: ${error}`
            })
        });
}

const upload = (req, res) => {

    // Recoger el fichero de imagen y comprobar que existe
    if (!req.file) {
        return res.status(404).json({
            status: Messages.error,
            message: 'La petición no incluye una imagen',
        })
    }

    // Conseguir el nombre del archivo
    const { file } = req;
    const imageName = file.originalname;

    // Sacar extensión del archivo
    const imageSplit = imageName.split('\.');
    const extension = imageSplit[1];

    // Comprobar extensión
    if (extension !== 'png' && extension !== 'jpeg' && extension !== 'jpg' && extension !== 'gif') {
        // Ruta donde esta almacenado el archivo
        const filePath = file.path;

        // Si no es correcta, borrar archivo
        // Eliminar archivo
        fs.unlinkSync(filePath);

        return res.status(400).send({
            status: Messages.error,
            message: 'Extensión del archivo invalida'
        });

    }

    // Si si es correcta, guardar en bbdd
    User.findByIdAndUpdate(req.user.id, { image: file.filename }, { new: true })
        .then(user_update => {
            // Devolver respuesta
            return res.status(200).json({
                status: Messages.success,
                message: 'Subida de imagenes',
                user: user_update,
            })
        })
        .catch(error => {
            return res.status(500).send({
                status: Messages.error,
                message: 'Error en la subida del archivo'
            });
        });
}

const avatar = (req, res) => {
    // Sacar el parametro de la url
    const file = req.params.file;

    // Montar el path real de la imagen
    const filePath = `./uploads/avatars/${file}`;

    // Comprobar que existe
    fs.stat(filePath, (error, exists) => {
        if (!exists) {
            return res.status(404).send({
                status: Messages.error,
                message: 'No existe la imagen'
            });
        }

        // Devolver un file
        return res.sendFile(path.resolve(filePath));
    })

}

const counters = async(req, res) => {
    let id = req.params.id;

    if (!id) id = req.user.id;

    try {
        // count devuelve el total de registros de la consulta
        const followind = await Follow.count({ user: id});
        const followed = await Follow.count({ followed: id});
        const publications = await Publications.count({ user: id});
    
        res.status(200).send({
            status: Messages.success,
            userId: id,
            followind,
            followed,
            publications
        });    
    } catch (error) {
        res.status(500).send({
            status: Messages.error,
            error
        });
    }
}

// Exporar acciones
module.exports = {
    pruebaUser,
    register,
    login,
    getUser,
    list,
    update,
    upload,
    avatar,
    counters
}

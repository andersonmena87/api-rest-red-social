// Importar dependencias
const Follow = require('../models/follow');
const User = require('../models/user');

// Importar servicio
const followService = require('../services/followService');

// Acciones de prueba
const pruebaFollow = (req, res) => {
    return res.status(200).send({
        message: 'Mensaje enviado desde el controllers/follow.js'
    });
}

// Acción de seguir
const save = (req, res) => {
    // Conseguir datos del body
    const params = req.body;

    // Sacar id del usuario
    const indentity = req.user;

    // Crear objeto con modelo follow
    const userToFollowed = new Follow({
        user: indentity.id,
        followed: params.followed
    });

    // Guardar en bbdd
    userToFollowed.save()
        .then(userFollowedStored => {
            return res.status(200).send({
                status: 'success',
                message: 'Follow guardado con exito',
                indentity,
                userFollowedStored
            });
        })
        .catch(error => {
            return res.status(200).send({
                status: 'error',
                message: 'No se ha podido seguir al usuario',
                error
            });
        })


}

// Acción de borrar un follow (dejar de seguir)
const unfollow = (req, res) => {
    // Recoger el id del usuario identificado
    const userId = req.user.id;

    // Recoger el id del usuario que sigo y quiero dejar de seguir
    const followedId = req.params.id;

    // Find de las coincidencias y hacer remove
    Follow
        .findOneAndRemove({
            user: userId,
            followed: followedId
        })
        .then(userFollowedDeleted => {
            return res.status(200).send({
                status: 'success',
                message: 'Follow eliminado correctamente',
            });
        })
        .catch(error => {
            return res.status(500).send({
                status: 'error',
                message: 'Error al dejar de seguir',
                error
            });
        })

}

// Acción de listado de usuarios que cualquier usuario esta siguiendo
const following = (req, res) => {
    // Sacar el id del usuario identificado
    let userId = req.user.id;

    // Comprobar si me llega el id para parametro en url
    if (req.params.id) userId = req.params.id;

    // Comprobar si me llega la página, si no la pagina 1
    let page = 1;

    if (req.params.page) page = req.params.page;

    // Usuarios por página quiero mostrar
    const itemsPerPage = 5;

    // Find a follow, popular datos de los usuarios y paginar con mongoose paginate
    // Populate ["user followed", "-password -role -__v"] cambia los id por el objeto en este caso user y follow 
    // Segundo parametro de populate para mostrar los campos que se nesecitan, si se le pone - al campo
    // no se mostrará 
    Follow
        .paginate({ user: userId }, {
            page,
            limit: itemsPerPage,
            populate: [
                {
                    path: 'user',
                    select: '-password -role -__v'
                },
                {
                    path: 'followed',
                    select: '-password -role -__v'
                },
            ]
        })
        .then(async (result) => {
            // Listado de usuarios
            // Sacar un array de ids de los usuarios que me siguen y los que sigo
            let followsUserId = await followService.folloUserIds(req.user.id);

            return res.status(200).send({
                status: 'success',
                message: 'Listado de usuarios que estoy siguiendo',
                follows: result.docs,
                total: result.totalDocs,
                itemsPerPage,
                pages: result.totalPages,
                user_following: followsUserId.following,
                user_follow_me: followsUserId.followers
            });
        })
        .catch(error => {
            res.status(400).send({
                status: 'error',
                message: 'Listado no cargado',
                error
            });
        });
}

// Acción de listado de usuarios que me siguen
const followers = (req, res) => {
    // Sacar el id del usuario identificado
    let userId = req.user.id;

    // Comprobar si me llega el id para parametro en url
    if (req.params.id) userId = req.params.id;

    // Comprobar si me llega la página, si no la pagina 1
    let page = 1;

    if (req.params.page) page = req.params.page;

    // Usuarios por página quiero mostrar
    const itemsPerPage = 5;

    Follow
        .paginate({ followed: userId }, {
            page,
            limit: itemsPerPage,
            populate: [
                {
                    path: 'user',
                    select: '-password -role -__v'
                },
                {
                    path: 'followed',
                    select: '-password -role -__v'
                },
            ]
        })
        .then(async (result) => {
            // Listado de usuarios
            // Sacar un array de ids de los usuarios que me siguen y los que sigo
            let followsUserId = await followService.folloUserIds(req.user.id);

            return res.status(200).send({
                status: 'success',
                message: 'Listado de usuarios que me siguen',
                follows: result.docs,
                total: result.totalDocs,
                itemsPerPage,
                pages: result.totalPages,
                user_identity: req.user,
                user_following: followsUserId.following,
                user_follow_me: followsUserId.followers
            });
        }).catch(error => {
            res.status(400).send({
                status: 'error',
                message: 'Listado no cargado',
                error
            });
        });

}

// Exporar acciones
module.exports = {
    pruebaFollow,
    save,
    unfollow,
    following,
    followers
}

const Messages = require('../utilities/messages.json');
const Publication = require('../models/publication');

// Importar servicios
const followService = require('../services/followService');


// Librerías de nodeJS
const fs = require('fs');
const path = require('path');

// Acciones de prueba
const pruebaPublication = (req, res) => {
    return res.status(200).send({
        message: 'Mensaje enviado desde el controllers/publication.js'
    });
}

// Guardar publicación
const save = (req, res) => {
    let id = req.params.id;
    const { body } = req;

    if (!body.text) {
        return res.status(400).send({
            status: Messages.error,
            message: 'Debe enviar el texto a publicar'
        });
    }

    if (!id) {
        id = req.user.id;
    }

    const publication_to_save = new Publication({
        text: body.text,
        user: id
    });

    publication_to_save.save()
        .then(publicactionStored => {
            return res.status(200).send({
                status: Messages.success,
                message: 'Publiación guardada con éxito!',
                publicactionStored
            });
        })
        .catch(error => {
            return res.status(500).send({
                status: Messages.error,
                message: 'Error al guardar publicación',
                error
            });
        });
}

// Sacar una publicación
const getPublication = (req, res) => {
    Publication.findOne({ _id: req.params.id })
        .then(publicationStored => {
            return res.status(200).send({
                status: Messages.success,
                message: 'Publicación cargada!',
                publication: publicationStored
            })
        })
        .catch(error => {
            return res.status(404).send({
                status: Messages.error,
                message: 'Error buscando publicación',
                error
            })
        });
}

// Listar todas las publicaciones (FEED)
const list = async (req, res) => {
    // controlar en que página estamos
    let pageDefault = 1;
    let { page } = req.params;

    if (!page) {
        page = pageDefault;
    }

    page = parseInt(page);
    let itemsPerPage = 5;

    // Sacar un array de identificadores de usuarios que yo sigo como usuario identificado
    try {
        const myFollows = await followService.folloUserIds(req.user.id);
        const { following } = myFollows;

        // Consulta con mongoose paginate
        // Ordenar (Descendente) muestra la mas reciente, populate
        Publication
            .paginate(
                // Otra forma usando operador $in
                // { user: {$in: following }},
                { user: following },
                {
                    page,
                    limit: itemsPerPage,
                    sort: '-create_at -_id',
                    populate: [
                        {
                            path: 'user',
                            // Campos que no se van a mostrar en la respuesta se les pone - emp: -campo
                            select: '-role -__v -password -email'
                        }
                    ],
                    select: '-__v'
                }
            )
            .then(result => {
                return res.status(200).send({
                    status: Messages.success,
                    message: 'Publicaciones cargadas!',
                    total: result.totalDocs,
                    itemsPerPage,
                    page: result.page,
                    pages: result.totalPages,
                    following,
                    publications: result.docs,
                })
            })
            .catch(error => {
                return res.status(500).send({
                    status: Messages.error,
                    message: 'No hay publicaciones',
                    error
                })
            });
    } catch (error) {
        return res.status(500).send({
            status: Messages.error,
            message: 'No se han listado las publicaciones',
            error
        })
    }

}

// Eliminar publicaciones
const deletePublication = (req, res) => {
    const publicationId = req.params.id;

    // Solo elimina publicaciones creadas por el usuario en sesión
    Publication.deleteOne({ user: req.user.id, _id: publicationId })
        .then(publicationDeleted => {
            return res.status(200).send({
                status: Messages.success,
                message: 'Publicación eliminada con éxito!',
                publication: publicationDeleted,
            })
        })
        .catch(error => {
            return res.status(404).send({
                status: Messages.error,
                message: 'No se encontró la publiación',
                error
            })
        });

}

// Listar publicaciones usuario
const publicationsByUser = (req, res) => {
    let userId = req.params.id;

    if (!userId) {
        userId = req.user.id;
    }

    let page = 1;

    if (req.params.page) page = req.params.page;

    const itemsPerPage = 5;

    Publication.paginate({ user: userId }, {
        page,
        limit: itemsPerPage,
        // Como se tienen publicaciones guardadas con la misma fecha se agrega el para _id
        sort: { create_at: -1, _id: -1 },
        populate: [
            {
                path: 'user',
                select: '-password -role -__v -email'
            }
        ],
        select: '-__v'
    })
        .then(result => {
            return res.status(200).send({
                status: Messages.success,
                message: 'Listado de publicaciones por usuario',
                total: result.totalDocs,
                itemsPerPage,
                page: result.page,
                pages: result.totalPages,
                publications: result.docs,
            });
        })
        .catch(error => {
            res.status(400).send({
                status: Messages.error,
                message: 'Listado no cargado',
                error
            });
        });

}

// Subir ficheros
const upload = (req, res) => {
    // Sacar publication ID
    const publicationId = req.params.id;

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
    Publication.findByIdAndUpdate(
        { user: req.params.id, _id: publicationId },
        { file: file.filename },
        // new: true para devolver registro actualizado
        { new: true }
    )
        .then(publication_update => {
            // Devolver respuesta
            return res.status(200).json({
                status: Messages.success,
                message: 'Subida de imagenes',
                publication: publication_update,
            })
        })
        .catch(error => {
            return res.status(500).send({
                status: Messages.error,
                message: 'Error en la subida del archivo',
                error
            });
        });
}

// Devolver archivos multimedia(Imagenes)
const imagePublication = (req, res) => {
    // Sacar el parametro de la url
    const file = req.params.file;

    // Montar el path real de la imagen
    const filePath = `./uploads/publications/${file}`;

    // Comprobar que existe
    fs.stat(filePath, (error, exists) => {
        if (!exists) {
            return res.status(404).send({
                status: Messages.error,
                message: 'No existe la imagen',
                error
            });
        }

        // Devolver un file
        return res.sendFile(path.resolve(filePath));
    })

}

// Exporar acciones
module.exports = {
    pruebaPublication,
    save,
    getPublication,
    list,
    deletePublication,
    publicationsByUser,
    upload,
    imagePublication
}

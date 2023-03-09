const { Schema, model } = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const FollowSchema = Schema({
    // Campo para almacenar id del usuario
    user: {
        type: Schema.ObjectId,
        ref: "User"
    },
    followed: {
        type: Schema.ObjectId,
        ref: "User"
    },
    create_at: {
        type: Date,
        default: Date.now()
    }
});

//Adicionando paginador al Esquema de usuario
FollowSchema.plugin(mongoosePaginate);

module.exports = model('Follow', FollowSchema, 'follows');
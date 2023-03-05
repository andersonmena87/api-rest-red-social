const {Schema, model} = require('mongoose');

const UserSchema = Schema({
    name: {
        type: String,
        required: true
    },
    surname: String,
    nick: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'role_user'
    },
    image: {
        type: String,
        default: 'default.png'
    },
    create_at: {
        type: Date,
        default: Date.now
    }
});

//model(nombreModelo, Esquema, nombreColleccion(opcional))
module.exports = model('User', UserSchema, 'users');
                //Si no se pone el tercer parametro por defecto moongose pondra users -> Pluraliza el primer parametro   
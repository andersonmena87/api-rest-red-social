const mongoose = require('mongoose');

const connection = async () => {
    const db = 'mi_red_social';
    try {
        await mongoose.connect(`mongodb://127.0.0.1:27017/${db}`);
        console.log(`Conectado correctamente a ${db}`);
    } catch (error) {
        console.log(error);
        throw new Error('No se ha podido conectar a la base de datos !!');
    }
}

module.exports = connection
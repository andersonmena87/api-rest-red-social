const mongoose = require('mongoose');

const connection = async () => {
    const db = 'mi-red-social';
    try {
        // Local
        // await mongoose.connect(`mongodb://127.0.0.1:27017/${db}`);
        // prd
        await mongoose.connect(`mongodb+srv://andersonmena87:%5Cw.0R%3B%5Bs&C,%7D*GC'~,vf@cluster0.uduo29b.mongodb.net/${db}`);
        console.log(`Conectado correctamente a ${db}`);
    } catch (error) {
        console.log(error);
        throw new Error('No se ha podido conectar a la base de datos !!');
    }
}

module.exports = connection
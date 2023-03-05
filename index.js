// Importar dependencias
const connection  = require('./database/connection');
const express = require('express');
const cors = require('cors');

// Mensaje de bienvenida
console.log('API NODE para RED SOCIAL ARRANCADA!');

// Conexión a base de datos
connection();

// Crear servidor node
const app = express();
const puerto = 3901

// Configurar cors
app.use(cors());

// Convertir los datos del body a objeto js
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Cargar conf rutas
const UserRoutes = require('./routes/user');
const PulicationRoutes = require('./routes/publication');
const FollowRoutes = require('./routes/follow');
const prefijo = '/api';

app.use(`${prefijo}/user`, UserRoutes);
app.use(`${prefijo}/publication`, PulicationRoutes);
app.use(`${prefijo}/follow`, FollowRoutes);

//Ruta de prueba
app.get('/ruta-prueba', (req, res) => {
    return res.status(200).json(
        {
            'id': 0,
            'nombre': 'Prueba API'
        }
    );
})

// Poner a escuchar peticiones http
app.listen(puerto, () => {
    console.log('Servidor de node corriendo por el puerto ' + puerto);
})

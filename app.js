// Requires (importamos las librerias necesarias)
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

// Inicializar Variables
var app = express();

// Body Parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Importar Rutas
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var loginRoutes = require('./routes/login');

// Conexion a la Base de Datos
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {

    if (err) throw err; // en js cuando lanzo un error se detiene la ejecución del proceso

    console.log('Base de Datos corriendo en el puerto 27017 - \x1b[32m%s\x1b[0m', 'Online');

});

// Rutas
/* declaro un middleware */
/* va de la mas especifico a lo menos especifico */
app.use('/usuario', usuarioRoutes);
app.use('/login', loginRoutes);
app.use('/', appRoutes);


// Escuchar Peticiones
app.listen(3000, () => {
    console.log('Express server corriendo en el puerto 3000 - \x1b[32m%s\x1b[0m', 'Online');
})
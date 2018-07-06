// Requires (importamos las librerias necesarias)
var express = require('express');
var mongoose = require('mongoose');

// Inicializar Variables
var app = express();

// Conexion a la Base de Datos
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {

    if (err) throw err; // en js cuando lanzo un error se detiene la ejecución del proceso

    console.log('Base de Datos corriendo en el puerto 27017 - \x1b[32m%s\x1b[0m', 'Online');

});

// Rutas
app.get('/', (req, res, next) => { // next le dice a express que cuando se ejecute continue con la siguiente instrucción

    res.status(200).json({
        ok: true,
        mensaje: "Peticion realizada correctamente"
    });

})

// Escuchar Peticiones
app.listen(3000, () => {
    console.log('Express server corriendo en el puerto 3000 - \x1b[32m%s\x1b[0m', 'Online');
})
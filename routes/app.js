var express = require('express');

var app = express();

// Rutas
app.get('/', (req, res, next) => { // next le dice a express que cuando se ejecute continue con la siguiente instrucción

    res.status(200).json({
        ok: true,
        mensaje: "Peticion realizada correctamente"
    });

});

module.exports = app;
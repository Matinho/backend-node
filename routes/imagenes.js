var express = require('express');

var app = express();

const path = require('path');
const fs = require('fs');

// Rutas
app.get('/:tipo/:img', (req, res, next) => { // next le dice a express que cuando se ejecute continue con la siguiente instrucción

    var tipo = req.params.tipo;
    var img = req.params.img;

    var pathImagen = path.resolve(__dirname, `../uploads/${ tipo }/${ img }`);

    if (fs.existsSync(pathImagen)) {
        res.sendFile(pathImagen);
    } else {
        var pathNoImagen = path.resolve(__dirname, '../assets/no-img.jpg');
        res.sendFile(pathNoImagen);
    }

});

module.exports = app;
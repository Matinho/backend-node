var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED; // obtengo el seed 

var app = express();

var Usuario = require('../models/usuario'); // estoy definiendo el modelo de usuario

app.post('/', (req, res) => {


    var body = req.body; // esto funciona si esta instalado el modulo body-parser

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        if (err) { // si tengo error mando un msj de error
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar Usuarios",
                errors: err
            });
        }

        if (!usuarioDB) {
            return res.status(500).json({
                ok: false,
                mensaje: "Credenciales incorrectas - email",
                errors: err
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(500).json({
                ok: false,
                mensaje: "Credenciales incorrectas - password",
                errors: err
            });
        }

        // Crear un Token!!!
        usuarioDB.password = ':)';
        // 1er param es el payload - 2do param es la semilla - 3er param es la vigencia del token
        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }) // 14400 son 4 horas

        res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB._id
        });

    })

});



module.exports = app;
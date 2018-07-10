var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Usuario = require('../models/usuario'); // estoy definiendo el modelo de usuario

// Rutas

/*----------------------------------------------*/
/*--------- Obtener todos los usuarios ---------*/
/*----------------------------------------------*/

app.get('/', (req, res, next) => { // next le dice a express que cuando se ejecute continue con la siguiente instrucción

    Usuario.find({}, 'nombre email img role')
        .exec(
            (err, usuarios) => {

                if (err) { // si tengo error mando un msj de error
                    return res.status(500).json({
                        ok: false,
                        mensaje: "Error cargando Usuarios",
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    usuarios: usuarios
                });

            })
});

/*--------------------------------------*/
/*--------- Verificar Token ------------*/
/*--------------------------------------*/
/*
// esta forma impide que todo lo que sigue hacia abajo se ejecute si no tiene token en la petición 
app.use('/', (req, res, next) => {

    var token = req.query.token;

    jwt.verify(token, SEED, (err, decoded) => {

        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: "Token incorrecto",
                errors: err
            });
        }

        next();

    });

});
*/

/*--------------------------------------*/
/*--------- Actualizar usuario ---------*/
/*--------------------------------------*/
// :id indica que es un recurso obligatorio de la aplicación 
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => { // Busco que el usuario exista

        if (err) { // si tengo error mando un msj de error
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar usuario",
                errors: err
            });
        }

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: "El usuario con el id " + id + " no existe",
                errors: { message: 'No existe un usuario con ese ID' }
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {

            if (err) { // si tengo error mando un msj de error
                return res.status(400).json({
                    ok: false,
                    mensaje: "Error al actualizar usuario",
                    errors: err
                });
            }

            usuarioGuardado.password = ':)';

            res.status(200).json({
                ok: true,
                body: usuarioGuardado
            });

        });

    });

});


/*---------------------------------------*/
/*--------- Crear nuevo usuario ---------*/
/*---------------------------------------*/

app.post('/', mdAutenticacion.verificaToken, (req, res) => { // mando el middleware con las validaciones (puede ser un arreglo)

    var body = req.body; // esto funciona si esta instalado el modulo body-parser

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {

        if (err) { // si tengo error mando un msj de error
            return res.status(400).json({
                ok: false,
                mensaje: "Error al crear Usuarios",
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: req.usuario
        });

    });

});

/*----------------------------------------------*/
/*--------- Borrar usuarios por ID -------------*/
/*----------------------------------------------*/

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {

        if (err) { // si tengo error mando un msj de error
            return res.status(500).json({
                ok: false,
                mensaje: "Error al borrar Usuarios",
                errors: err
            });
        }

        if (!usuarioBorrado) { // si tengo error mando un msj de error
            return res.status(400).json({
                ok: false,
                mensaje: "No existe un usuario con ese ID",
                errors: { message: 'No existe un usuario con ese ID' }
            });
        }

        res.status(200).json({
            ok: true,
            body: usuarioBorrado
        });

    })

});

module.exports = app;
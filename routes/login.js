var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED; // obtengo el seed 

var app = express();

var Usuario = require('../models/usuario'); // estoy definiendo el modelo de usuario

// Google
var CLIENT_ID = require('../config/config').CLIENT_ID; // obtengo el seed 
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

var mdAutenticacion = require('../middlewares/autenticacion');

// ================================
// Autenticación de Google
// ================================
app.get('/renuevatoken', mdAutenticacion.verificaToken, (req, res) => {

    var token = jwt.sign({ usuario: req.usuario }, SEED, { expiresIn: 14400 }) // 14400 son 4 horas

    res.status(200).json({
        ok: true,
        token: token
    });

});

// ================================
// Autenticación de Google
// ================================
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    //const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true,
    };
}

app.post('/google', async(req, res) => {

    var token = req.body.token;

    var googleUser = await verify(token)
        .catch(e => {
            res.status(403).json({
                ok: false,
                mensaje: "Token no valido"
            });
        });

    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {

        if (err) { // si tengo error mando un msj de error
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar Usuarios",
                errors: err
            });
        }

        // Verifico que el usuario exista 
        if (usuarioDB) {
            // si el correo esta usado pero no creado por google tiro error
            if (usuarioDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Debe de usar su atenticación normal",
                    errors: err
                });
            }
            // si esta creado pero fue creado por google genero el nuevo token de acceso
            else {
                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }) // 14400 son 4 horas

                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB._id,
                    menu: obtenerMenu(usuarioDB.role)
                });
            }

        }
        // si el usuario no existe, lo creamos
        else {
            var usuario = new Usuario();

            // seteo el usuario
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            // grabo el usuario
            usuario.save((err, usuarioDB) => {

                if (err) { // si tengo error mando un msj de error
                    return res.status(500).json({
                        ok: false,
                        mensaje: "Error al grabar Usuario",
                        errors: err
                    });
                }

                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }) // 14400 son 4 horas

                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB._id,
                    menu: obtenerMenu(usuarioDB.role)
                });

            });
        }

    });
});



// ================================
// Autenticación Normal
// ================================
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
            id: usuarioDB._id,
            menu: obtenerMenu(usuarioDB.role)
        });

    })

});

function obtenerMenu(role) {

    var menu = [{
            titulo: 'Principal',
            icono: 'mdi mdi-gauge',
            submenu: [
                { titulo: 'Dashboard', url: '/dashboard' },
                { titulo: 'ProgressBar', url: '/progress' },
                { titulo: 'Gráficas', url: '/graficas1' },
                { titulo: 'Promesas', url: '/promesas' },
                { titulo: 'RXJS', url: '/rxjs' },
            ]
        },
        {
            titulo: 'Mantenimiento',
            icono: 'mdi mdi-folder-lock-open',
            submenu: [
                { titulo: 'Hospitales', url: '/hospitales' },
                { titulo: 'Médicos', url: '/medicos' }
            ]
        }
    ];

    if (role === 'ADMIN_ROLE') {
        menu[1].submenu.unshift({ titulo: 'Usuarios', url: '/usuarios' }); // unshift pone las cosas al principio
    }

    return menu;

}

module.exports = app;
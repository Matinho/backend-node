var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED; // obtengo el seed 

/*--------------------------------------*/
/*--------- Verificar Token ------------*/
/*--------------------------------------*/
exports.verificaToken = function(req, res, next) {

    var token = req.query.token;

    jwt.verify(token, SEED, (err, decoded) => {

        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: "Token incorrecto",
                errors: err
            });
        }

        req.usuario = decoded.usuario;

        next();

    });

}

/*--------------------------------------*/
/*--------- Verificar Rol --------------*/
/*--------------------------------------*/
exports.verificaRol = function(req, res, next) {

    var usuario = req.usuario;

    if (usuario.role === 'ADMIN_ROLE') {
        // Es valido 
        next();
        return;

    } else {

        return res.status(401).json({
            ok: false,
            mensaje: "Token incorrecto",
            errors: { message: 'No es administrador, no puede hacer eso' }
        });

    }

}

/*--------------------------------------*/
/*--- Verificar Rol o Mismo Usuario ----*/
/*--------------------------------------*/
exports.verificaRolOMismoUsuario = function(req, res, next) {

    var usuario = req.usuario;
    var id = req.params.id;

    if (usuario.role === 'ADMIN_ROLE' || usuario._id === id) {
        // Es valido 
        next();
        return;

    } else {

        return res.status(401).json({
            ok: false,
            mensaje: "Token incorrecto",
            errors: { message: 'No es administrador ni es el mismo Usuario, no puede hacer eso' }
        });

    }

}
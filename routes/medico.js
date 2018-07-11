var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Medico = require('../models/medico'); // estoy definiendo el modelo de medico

/*----------------------------------------------*/
/*--------- Obtener todos los Medicos ----------*/
/*----------------------------------------------*/

app.get('/', (req, res, next) => { // next le dice a express que cuando se ejecute continue con la siguiente instrucción

    var desde = req.query.desde || 0; // si viene algo en el query lo almaceno, sino almaceno 0
    desde = Number(desde); // fuerzo para que desde sea un numero

    Medico.find({})
        .populate('usuario', 'nombre email')
        .populate('hospital', 'nombre')
        .skip(desde)
        .limit(5)
        .exec(
            (err, medicos) => {

                if (err) { // si tengo error mando un msj de error
                    return res.status(500).json({
                        ok: false,
                        mensaje: "Error cargando Medicos",
                        errors: err
                    });
                }

                Medico.count({}, (err, conteo) => {

                    res.status(200).json({
                        ok: true,
                        medicos: medicos,
                        total: conteo
                    });

                })

            })
});

/*--------------------------------------*/
/*--------- Actualizar Medico ----------*/
/*--------------------------------------*/
// :id indica que es un recurso obligatorio de la aplicación 
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medico) => { // Busco que el medico exista

        if (err) { // si tengo error mando un msj de error
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar medico",
                errors: err
            });
        }

        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: "El medico con el id " + id + " no existe",
                errors: { message: 'No existe un medico con ese ID' }
            });
        }

        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;

        medico.save((err, medicoGuardado) => {

            if (err) { // si tengo error mando un msj de error
                return res.status(400).json({
                    ok: false,
                    mensaje: "Error al actualizar medico",
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });

        });

    });

});


/*---------------------------------------*/
/*--------- Crear nuevo medico ----------*/
/*---------------------------------------*/

app.post('/', mdAutenticacion.verificaToken, (req, res) => { // mando el middleware con las validaciones (puede ser un arreglo)

    var body = req.body; // esto funciona si esta instalado el modulo body-parser

    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save((err, medicoGuardado) => {

        if (err) { // si tengo error mando un msj de error
            return res.status(400).json({
                ok: false,
                mensaje: "Error al crear medico",
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            medico: medicoGuardado,
        });

    });

});

/*----------------------------------------------*/
/*--------- Borrar medico por ID -------------*/
/*----------------------------------------------*/

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {

        if (err) { // si tengo error mando un msj de error
            return res.status(500).json({
                ok: false,
                mensaje: "Error al borrar medico",
                errors: err
            });
        }

        if (!medicoBorrado) { // si tengo error mando un msj de error
            return res.status(400).json({
                ok: false,
                mensaje: "No existe un medico con ese ID",
                errors: { message: 'No existe un medico con ese ID' }
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });

    })

});

module.exports = app;
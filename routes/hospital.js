var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Hospital = require('../models/hospital'); // estoy definiendo el modelo de usuario

/*--------------------------------------------------*/
/* Obtener todos los hospitales                     */
/*--------------------------------------------------*/

app.get('/', (req, res, next) => { // next le dice a express que cuando se ejecute continue con la siguiente instrucción

    var desde = req.query.desde || 0; // si viene algo en el query lo almaceno, sino almaceno 0
    desde = Number(desde); // fuerzo para que desde sea un numero

    if (desde === -1) {

        Hospital.find({})
            .populate('usuario', 'nombre img email')
            .sort('nombre')
            .exec(
                (err, hospitales) => {

                    if (err) { // si tengo error mando un msj de error
                        return res.status(500).json({
                            ok: false,
                            mensaje: "Error cargando Hospitales",
                            errors: err
                        });
                    }

                    Hospital.count({}, (err, conteo) => {

                        res.status(200).json({
                            ok: true,
                            hospitales: hospitales,
                            total: conteo
                        });

                    })

                })
    } else {

        Hospital.find({})
            .populate('usuario', 'nombre img email')
            .skip(desde)
            .limit(5)
            .exec(
                (err, hospitales) => {

                    if (err) { // si tengo error mando un msj de error
                        return res.status(500).json({
                            ok: false,
                            mensaje: "Error cargando Hospitales",
                            errors: err
                        });
                    }

                    Hospital.count({}, (err, conteo) => {

                        res.status(200).json({
                            ok: true,
                            hospitales: hospitales,
                            total: conteo
                        });

                    })

                })

    }
});

/*--------------------------------------------------*/
/* Buscar hospital por ID                           */
/*--------------------------------------------------*/

app.get('/:id', (req, res) => {

    var id = req.params.id;
    Hospital.findById(id)
        .populate('usuario', 'nombre img email')
        .exec((err, hospital) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar hospital',
                    errors: err
                });
            }

            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El hospital con el id ' + id + 'no existe',
                    errors: { message: 'No existe un hospital con ese ID' }
                });
            }
            res.status(200).json({
                ok: true,
                hospital: hospital
            });
        })

});


/*--------------------------------------------------*/
/* Actualizar hospital                              */
/*--------------------------------------------------*/
// :id indica que es un recurso obligatorio de la aplicación 
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => { // Busco que el hospital exista

        if (err) { // si tengo error mando un msj de error
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar hospital",
                errors: err
            });
        }

        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: "El hospital con el id " + id + " no existe",
                errors: { message: 'No existe un hospital con ese ID' }
            });
        }

        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;

        hospital.save((err, hospitalGuardado) => {

            if (err) { // si tengo error mando un msj de error
                return res.status(400).json({
                    ok: false,
                    mensaje: "Error al actualizar hospital",
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });

        });

    });

});


/*--------------------------------------------------*/
/*Crear nuevo hospital                              */
/*--------------------------------------------------*/

app.post('/', mdAutenticacion.verificaToken, (req, res) => { // mando el middleware con las validaciones (puede ser un arreglo)

    var body = req.body; // esto funciona si esta instalado el modulo body-parser

    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalGuardado) => {

        if (err) { // si tengo error mando un msj de error
            return res.status(400).json({
                ok: false,
                mensaje: "Error al crear hospital",
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado,
        });

    });

});

/*--------------------------------------------------*/
/* Borrar Hospital por ID                           */
/*--------------------------------------------------*/

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {

        if (err) { // si tengo error mando un msj de error
            return res.status(500).json({
                ok: false,
                mensaje: "Error al borrar Hospital",
                errors: err
            });
        }

        if (!hospitalBorrado) { // si tengo error mando un msj de error
            return res.status(400).json({
                ok: false,
                mensaje: "No existe un hospital con ese ID",
                errors: { message: 'No existe un hospital con ese ID' }
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });

    })

});

module.exports = app;
var express = require('express');

var mdautenticacion = require('../middlewares/autenticacion');
var app = express();

var Hospital = require('../models/hospital');


// ==============================================================
// Obeteniendo los hospitales
// ==============================================================

app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec((err, hospitales) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: 'Error cargando usuarios',
                    errors: err
                });
            }
            Hospital.count({}, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    hospitales: hospitales,
                    total: conteo
                });
            });

        });
});





// ==============================================================
// Actualizar hospital
// ==============================================================

app.put('/:id', mdautenticacion.verificaToken, (req, res) => {


    var id = req.params.id;
    var body = req.body;
    Hospital.findById(id, (err, hospital) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al buscar usuario',
                errors: err
            });
        }


        if (!hospital) {
            return res.status(400).json({
                ok: false,
                message: 'El hospital con el id: ' + id + ' no existe',
                errors: { message: 'No existe un usuario con ese id' }
            });
        }


        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;

        hospital.save((err, hospitalGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    message: 'Error al actualizar hospital',
                    errors: err
                });
            }


            res.status(201).json({
                ok: true,
                hospital: hospitalGuardado
            });
        });
    });
});

// ==============================================================
// Creando un hospital
// ==============================================================

app.post('/', mdautenticacion.verificaToken, (req, res) => {
    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    hospital.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                message: 'Error al crear hosspital',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado
        });
    });



});


// ==============================================================
// Eliminando un hospital por el id
// ==============================================================

app.delete('/:id', mdautenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al borrar hospital',
                errors: err
            });
        }
        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                message: 'No hay hopital con este id',
                errors: { message: 'No hay hospital con este id' }
            });
        }
        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });
    });
});

module.exports = app;
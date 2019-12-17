var express = require('express');

var app = express();
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');


// ==================================================
// Busqueda por colección
// ==================================================
app.get('/coleccion/:tabla/:busqueda', (req, res) => {
    var tabla = req.params.tabla;
    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');


    var promesa;
    switch (tabla) {
        case 'usuarios':
            promesa = busquedaUsuario(busqueda, regex);
            break;
        case 'medicos':
            promesa = busquedaMedicos(busqueda, regex);
            break;
        case 'hospitales':
            promesa = busquedaHospitales(busqueda, regex);
            break;

        default:
            return res.status(400).json({
                ok: false,
                message: 'Los tipos de busqueda son hospitales, medicos y usuarios',
                errror: { message: 'Tipo de tabla/coleccion no valido' }
            });
    }

    promesa.then(data => {
        res.status(200).json({
            ok: true,
            [tabla]: data
        });
    });


});


// ==================================================
// Busqueda General
// ==================================================


app.get('/todo/:busqueda', (req, res, next) => {
    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');

    Promise.all([
            busquedaHospitales(busqueda, regex),
            busquedaMedicos(busqueda, regex),
            busquedaUsuario(busqueda, regex)
        ])
        .then(respuestas => {
            res.status(200).json({
                ok: true,
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]
            });
        });


    // res.status(200).json({
    //     ok: true,
    //     message: 'Peticion realizada correctamente'
    // });
});

function busquedaHospitales(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Hospital.find({ nombre: regex }, (err, hospitales) => {
            if (err) {
                reject('Error al cagar hospitales', err);
            } else {
                resolve(hospitales);
            }
        });
    });

}

function busquedaMedicos(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Medico.find({ nombre: regex }, (err, medicos) => {
            if (err) {
                reject('Error al cagar medicos', err);
            } else {
                resolve(medicos);
            }
        });
    });

}

function busquedaUsuario(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Usuario.find({}, 'nombre email role').or([{ 'nombre': regex }, { 'email': regex }])
            .exec((err, usuarios) => {
                if (err) {
                    reject('Erros al cargar usuarios', err);
                } else {
                    resolve(usuarios);
                }
            });
    });

}


module.exports = app;
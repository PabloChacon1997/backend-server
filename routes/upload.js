var express = require('express');
var fileUpload = require('express-fileupload');

var fs = require('fs');


var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

var app = express();

// default options
app.use(fileUpload());

app.put('/:tipo/:id', (req, res, next) => {
    var tipo = req.params.tipo;
    var id = req.params.id;
    //  tipos de archivos
    var tiposvalidos = ['hospitales', 'medicos', 'usuarios'];
    if (tiposvalidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            message: 'Tipo de coleccion no valida',
            errors: { message: 'Tipo de coleccion no valida' }
        });
    }


    if (!req.files) {
        return res.status(400).json({
            ok: false,
            message: 'No selecciono nada',
            errors: { message: 'Debe seleccionar una imagen' }
        });

    }

    // obtener nombre deñ archivo

    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];


    // solo estas extensiones aceptamos
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            message: 'Extension no valida',
            errors: { message: 'Las extensones validas son: ' + extensionesValidas.join(', ') }
        });
    }

    // nombre de archivo personalizado
    var nombreArchivo = `${ id} -${ new Date().getMilliseconds() }.${extensionArchivo}`;

    // mover el archivo del temporal al path
    var path = `./uploads/${tipo}/${nombreArchivo}`;
    archivo.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al mover el archivo',
                errors: err
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res);


        // res.status(200).json({
        //     ok: true,
        //     message: 'Archivo movido',
        //     nombreCortado: extensionArchivo
        // });
    });


});



function subirPorTipo(tipo, id, nombreArchivo, res) {


    if (tipo === 'usuarios') {
        Usuario.findById(id, (err, usuario) => {
            if (!usuario) {
                return res.status(400).json({
                    ok: false,
                    message: 'Usuario No existe en la base de datos',
                    errors: { message: 'Usuario No existe en la base de datos' }
                });
            }
            var pathViejo = './uploads/usuarios/' + usuario.img;


            // si existe alimina la imagen antigua
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            usuario.img = nombreArchivo;

            usuario.save((err, usuarioActualizado) => {
                usuarioActualizado.password = ':)';
                return res.status(200).json({
                    ok: true,
                    message: 'Imagen de usuario Actualizada',
                    usuario: usuarioActualizado
                });
            });
        });
    }
    if (tipo === 'medicos') {
        Medico.findById(id, (err, medico) => {
            var pathViejo = './uploads/medicos/' + medico.img;
            if (!medico) {
                return res.status(400).json({
                    ok: false,
                    message: 'Medico No existe en la base de datos',
                    errors: { message: 'Medico No existe en la base de datos' }
                });
            }
            // si existe alimina la imagen antigua
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            medico.img = nombreArchivo;

            medico.save((err, medicoActualizado) => {
                return res.status(200).json({
                    ok: true,
                    message: 'Imagen del medico Actualizada',
                    medico: medicoActualizado
                });
            });
        });
    }
    if (tipo === 'hospitales') {
        Hospital.findById(id, (err, hospital) => {
            var pathViejo = './uploads/hospitales/' + hospital.img;
            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    message: 'Hospital No existe en la base de datos',
                    errors: { message: 'Hospital No existe en la base de datos' }
                });
            }
            // si existe alimina la imagen antigua
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            hospital.img = nombreArchivo;

            hospital.save((err, hospitalActualizado) => {
                return res.status(200).json({
                    ok: true,
                    message: 'Imagen del hospital Actualizada',
                    hospital: hospitalActualizado
                });
            });
        });
    }



}


module.exports = app;
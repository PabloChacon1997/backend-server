var express = require('express');
const bcrypt = require('bcrypt');

var mdautenticacion = require('../middlewares/autenticacion');
var app = express();

var Usuario = require('../models/usuario');


// ==============================================================
// Obeteniendo los usuarios
// ==============================================================

app.get('/', (req, res, next) => {

    Usuario.find({},
        (err, usuarios) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: 'Error cargando usuarios',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                usuarios: usuarios
            });
        });
});





// ==============================================================
// Actualizar usuario
// ==============================================================

app.put('/:id', mdautenticacion.verificaToken, (req, res) => {


    var id = req.params.id;
    var body = req.body;
    Usuario.findById(id, (err, usuario) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al buscar usuario',
                errors: err
            });
        }


        if (!usuario) {
            return res.status(400).json({
                ok: false,
                message: 'El usuario con el id: ' + id + ' no existe',
                errors: { message: 'No existe un usuario con ese id' }
            });
        }


        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    message: 'Error al actualizar usuario usuario',
                    errors: err
                });
            }

            usuarioGuardado.password = ':)';

            res.status(201).json({
                ok: true,
                usuario: usuarioGuardado
            });
        });
    });
});

// ==============================================================
// Creando un usuario
// ==============================================================

app.post('/', mdautenticacion.verificaToken, (req, res) => {
    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                message: 'Error al crear usuario',
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


// ==============================================================
// Eliminando un usuario por el id
// ==============================================================

app.delete('/:id', mdautenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    Usuario.findByIdAndRemove(id, (err, userBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al borrar usuario',
                errors: err
            });
        }
        if (!userBorrado) {
            return res.status(400).json({
                ok: false,
                message: 'No hay usuario con este id',
                errors: { message: 'No hay usuario con este id' }
            });
        }
        res.status(200).json({
            ok: true,
            usuario: userBorrado
        });
    });
});

module.exports = app;
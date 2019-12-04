var express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

var seed = require('../config/config').SEED;

var app = express();


var Usuario = require('../models/usuario');


app.post('/', (req, res) => {

    var body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuariodb) => {


        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al buscar usuarios',
                errors: err
            });
        }

        if (!usuariodb) {
            return res.status(400).json({
                ok: false,
                message: 'Credenciales incorrectas - email',
                errors: err
            });
        }

        if (!bcrypt.compareSync(body.password, usuariodb.password)) {
            return res.status(400).json({
                ok: false,
                message: 'Credenciales incorrectas - password',
                errors: err
            });
        }

        // crear un token
        usuariodb.password = ':)';

        var token = jwt.sign({ usuario: usuariodb }, seed, { expiresIn: 14400 });

        res.status(200).json({
            ok: true,
            body: usuariodb,
            token: token,
            id: usuariodb._id
        });
    });



});



module.exports = app;
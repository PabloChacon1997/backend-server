var express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

var seed = require('../config/config').SEED;

var app = express();


var Usuario = require('../models/usuario');
// google
var CLIENT_ID = require('../config/config').CLIENT_ID;

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);


// =============================
// Autenticación Google
// =============================
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    // const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    };
}

app.post('/google', async(req, res) => {

    var token = req.body.token;
    var googleUser = await verify(token)
        .catch(e => {
            return res.status(403).json({
                ok: false,
                message: 'Token no válido: '
            });
        });

    Usuario.findOne({ email: googleUser.email }, (err, usuariodb) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al buscar usuarios',
                errors: err
            });
        }

        if (usuariodb) {

            if (usuariodb.google === false) {
                return res.status(400).json({
                    ok: false,
                    message: 'Debe de usar su auteticación nommal'
                });
            } else {
                var token = jwt.sign({ usuario: usuariodb }, seed, { expiresIn: 14400 });

                res.status(200).json({
                    ok: true,
                    body: usuariodb,
                    token: token,
                    id: usuariodb._id
                });
            }
        } else {
            // el usuario no existe
            var usuario = new Usuario();
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save((err, usuariodb) => {
                var token = jwt.sign({ usuario: usuariodb }, seed, { expiresIn: 14400 });

                res.status(200).json({
                    ok: true,
                    body: usuariodb,
                    token: token,
                    id: usuariodb._id
                });
            });
        }
    });

    // return res.status(200).json({
    //     ok: true,
    //     message: 'Login google',
    //     googleUser: googleUser
    // });
});


// =============================
// Autenticación Normal
// =============================

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
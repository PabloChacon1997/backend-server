const jwt = require('jsonwebtoken');

var seed = require('../config/config').SEED;


// ==============================================================
// Verificar token
// ==============================================================
exports.verificaToken = function(req, res, next) {
    var token = req.query.token;
    jwt.verify(token, seed, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                message: 'Token invalido',
                errors: err
            });
        }


        req.usuario = decoded.usuario;
        next();
        // res.status(401).json({
        //     ok: false,
        //     decoded: decoded
        // });
    });
};
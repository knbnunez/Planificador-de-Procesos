// Controller para atender las request

// IMPORTS
const express = require('express'); 
const formidable = require('formidable');
const fs = require('fs');
const parse = require('form-parse');

const services = require('./services');

// var path = require('path');

let router = express.Router();

// Endpoint para recibir archivos
router.post('/cargas', (request, response, next) => {
    const form = formidable({ multiples: true });
    
    // Busca los archivos y la planificación seleccionada enviados en el formulario
    form.parse(request, (err, fields, files) => {
        if (err) {
          next(err);
          return;
        }
        //
        if (files.archivo) services.tratarInputs(
            fields.planificacion,
            fields.tip, // Falta agregar estos campos en el formulario del Front
            fields.tcp, // ...
            fields.tfp, // ...
            fields.quantum,  // ...
            files.archivo
        );
    });
});

// Bitácora de smulación
router.get('/eventos', (request, response) => {
    response.send(services.getEventos()); // return array de arrays
    console.log(services.getEventos());
});

// Resultados finales
router.get('/resultados', (request, response) => {
    response.send(services.getResultados()); // return array de jsons
    response.send()
    console.log(services.getResultados());
});


module.exports = router;
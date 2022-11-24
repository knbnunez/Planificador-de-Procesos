// Controller para atender las request

// IMPORTS
const express = require('express'); 
const formidable = require('formidable');
const fs = require('fs');
const parse = require('form-parse');

// Funciones mías
// const tratarInputs = require('./services');
// const getEventos = require('./services');
// const getResultados = require('./services');
const services = require('./services');

//
var path = require('path');

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
        
        if (files.archivo) services.tratarInputs(fields.planificacion,
                                        fields.valorTip, // Falta agregar estos campos en el formulario del Front
                                        fields.valorTcp, // ...
                                        fields.valorTfp, // ...
                                        fields.quantum,  // ...
                                        files.archivo);
    });

});

// Bitácora de smulación
router.get('/eventos', (request, response) => {
    response.send(services.getEventos()); // return json
});

// Resultados finales pedidos
router.get('/resultados', (request, response) => {
    response.send(services.getResultados()); // return json
});


module.exports = router;
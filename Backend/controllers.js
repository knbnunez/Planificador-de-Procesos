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
// router.post('/cargas', (request, response) => {
    // console.log('Llego info al back');



    const form = formidable({ multiples: true });
    
  

    // Busca los archivos y la planificación seleccionada enviados en el formulario
    form.parse(request, (err, fields, files) => {
        
        // console.log('Entra en el form parse?');
        
        if (err) {
          next(err);
          return;
        }

        // console.log({
        //     planificacion: fields.planificacion,
        //     tip: fields.tip, // Falta agregar estos campos en el formulario del Front
        //     tcp: fields.tcp, // ...
        //     tfp: fields.tfp, // ...
        //     quantum: fields.quantum,  // ...
        //     archivo: files.archivo
        // });

        if (files.archivo) services.tratarInputs(
            fields.planificacion,
            fields.tip, // Falta agregar estos campos en el formulario del Front
            fields.tcp, // ...
            fields.tfp, // ...
            fields.quantum,  // ...
            files.archivo
        );

        // console.log('llamó a la función tratarInputs()');
    });

    // response.send({data: 'ok'})
});

// Bitácora de smulación
router.get('/eventos', (request, response) => {
    response.send(services.getEventos()); // return json
    console.log(services.getEventos());
});

// Resultados finales pedidos
router.get('/resultados', (request, response) => {
    // console.log('recibí una petición de resultados');
    response.send(services.getResultados()); // return json
    console.log(services.getResultados());
});


module.exports = router;
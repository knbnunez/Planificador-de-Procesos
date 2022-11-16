// Controller para atender las request

// IMPORTS
// const { response } = require('express');
const express = require('express'); 
const formidable = require('formidable');
const fs = require('fs');
const tratarArchivo = require('./services');
const parse = require('form-parse');
//
var path = require('path');
//

let router = express.Router();

// Endpoint para subir archivos
router.get('/', (request, response) => {
    
    // path.resolve resuelve la ruta del archivo antes de ser usado. Si tratamos de usarlo sin path.resolve puede ser considerado como un archivo malicioso y termina tirando error
    // __dirname nos da la ruta de la carpeta donde está el proyecto
    response.sendFile(path.resolve(__dirname+'/../Front-end/index.html'));
});

// Endpoint para recibir archivos
router.post('/upload', (request, response, next) => {
	const form = formidable({ multiples: true });
    // Busca los archivos y la planificación seleccionada enviados en el formulario
    form.parse(request, (err, fields, files) => {
        if (err) {
          next(err);
          return;
        }
        // console.log('Files:',files);
        // console.log('Fields:',fields);
        if (files.archivo) {
            tratarArchivo(fields.planificacion, files.archivo);
        }
    });
    response.send('POST REQUEST: enviaste un archivo');
});


router.get('/result', (request, response) => {
	response.download('../archivos-procesos-txt/resultado.txt', (err) => {
        if (err) {
            next(err);
            return;
        }
    });
    response.sendFile(__dirname+'/../archivos-procesos-txt/resultado.txt');
});


module.exports = router;
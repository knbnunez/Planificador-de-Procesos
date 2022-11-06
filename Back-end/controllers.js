// Controller para atender las request

// IMPORTS
// const { response } = require('express');
const express = require('express'); 
const formidable = require('formidable');
const fs = require('fs');
const tratarArchivo = require('./services');

let router = express.Router();

// // Creo un endpoint en / (Raíz) para las peticiones
// router.get('/', (request, response) => {
//     // response
//     response.send('Se hizo una GET request')
// });
// // Otro en la misma ruta para los envíos
// router.post('/', (request, response) => {
//     // response
//     response.send('Se hizo una POST request')
// });

// /////////////////////////////////////////////

// router.get('/uno', (request, response) => {
//     // response
//     response.send('uno')
// });
  
// router.get('/dos', (request, response) => {
//     // response
//     response.send('dos')
// });

// router.get('/uno/uno', (request, response) => {
//     // response
//     response.send('uno, uno')
// });

/////////////////////////////////////////////

// GET params
// router.get('/:user_id', function(req, res, next) {
// 	// Ejemplo: http://localhost:3000/98?mensaje=hola
// 	console.log(req.params);
// 	console.log(req.query);
//   res.send('mandaste una GET request');
// });

/////////////////////////////////////////////

// Endpoint para subir archivos
router.get('/', (request, response) => {
    response.send(`
        <h2>Prueba tp kevin</h2>
        <form action="/upload" enctype="multipart/form-data" method="post">
            <label>File: </label>
                <input type="file" name="archivo" multiple="multiple" /></div>
            <input type="submit" value="Enviar" />
        </form>
    `);
});

// Endpoint para recibir archivos
router.post('/upload', (request, response, next) => {
	const form = formidable();
    // Busca los archivos enviados en el formulario
    form.parse(request, (err, fields, files) => {
        if (err) {
          next(err);
          return;
        }
        if (files.archivo) {
            tratarArchivo(files.archivo);
        }
    });
    response.send('POST REQUEST: enviaste un archivo');
});

module.exports = router;
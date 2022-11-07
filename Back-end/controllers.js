// Controller para atender las request

// IMPORTS
// const { response } = require('express');
const express = require('express'); 
const formidable = require('formidable');
const fs = require('fs');
const tratarArchivo = require('./services');
const parse = require('form-parse');

let router = express.Router();

// Endpoint para subir archivos
router.get('/', (request, response) => {
    response.send(`
        <h2>Carga de archivo y elección de planificación</h2>
        <div>
            <form action="/upload" enctype="multipart/form-data" method="post">
                <label>Archivo: </label>
                <input type="file" name="archivo"/>
                <br>
                <label>Planificación: </label>
                <select name="planificacion">
                    <option value="fcfs">First Come First Served</option>
                    <option value="pe">Prioridad Externa</option>
                    <option value="rr">Round Robin</option>
                    <option value="spn">Shortest Process Next</option>
                    <option value="srt">Shortest Remaining Time</option>
                </select>
                <br>
                <input type="submit" value="Enviar"/>
            </form>
        </div>
    `);
});

// Endpoint para recibir archivos
router.post('/upload', (request, response, next) => {
	const form = formidable();
    // Busca los archivos y la planificación seleccionada enviados en el formulario
    form.parse(request, (err, fields, files) => {
        if (err) {
          next(err);
          return;
        }
        // console.log(files);
        if (files.archivo) {
            tratarArchivo(files.archivo);
        }
    });
    response.send('POST REQUEST: enviaste un archivo');
});

module.exports = router;
const express = require('express');
const router = require('./controllers.js');
var cors = require('cors');

const app = express(); // Creo una instacnia de express
const port = 3000;

app.use(cors()); // Enable CORS

// Las consultas se harán a partir de ésta ruta /uno, /dos, /...
app.use('/', router);

// Inicio la app en modo escucha
app.listen(port, () => {
  console.log(`API escuchando en el puerto: ${port}, ingrese a http://localhost:3000/`)
});


// Hardcod para no tener que hacer que inicie la ejecución desde el ingreso de un archivo en la web
// const tratarArchivo = require('./services');
// tratarArchivo({});

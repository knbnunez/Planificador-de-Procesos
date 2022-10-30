// Ejemplo sacado de stackoverflow, está en la barra de favoritos dentro de la carpeta TPI-SO


// Por cada línea del archivo, debería crear un obj Proceso

var input = myForm.myInput;
var reader = new FileReader;

input.addEventListener('change', onChange);

function onChange(event) {
    var file = event.target.files[0];
    reader.readAsText(file);
    reader.onload = onLoad;
}

function onLoad() {
    var result = reader.result; // Obtienes el texto
    // En tu ejemplo lo obtienes de una petición HTTP

    var lineas = result.split('\n');

    // o lineas.forEach(function(linea){ ... })
    // o lineas.find(function(linea){ return linea == contraseña })
    for (var linea of lineas) {
        console.log('[linea]', linea)
        //if(linea === passwordBuscar) {
        // Encontraste contraseña
        //}
    }

}
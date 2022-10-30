// REVISAR TEMA LECTURA DE ARCHIVOS
// Tengo que leer linea x linea quedándome con los subtstrings
// que esten separados por coma.





// FALTA PROBARLO
// Filtra los procesos en cola de nuevos y de bloqueados que están listos para ser movidos a la cola de listos
// Si los hubiera, los agrega a la cola de listos
function moverProcesosAColaListos(params) {
    let nuevosAMover = colaNuevos.filter(proceso => proceso.tArribo == tiempo);
    let bloqueadosAMover = colaBloqueados.filter(proceso => proceso.tComputoES == proceso.tRafagaES);
    
    nuevosAMover.forEach(proceso => {
        if (!colaListos.includes(proceso)) colaListos.push(proceso)        
    });

    bloqueadosAMover.forEach(proceso => {
        if (!colaListos.includes(proceso)) colaListos.push(proceso)        
    });
}









// MAIN
var cantProcesos = 0;
//
var colaNuevos = [];
var colaListos = [];
var colaBloqueados = [];
var colaTerminados = [];
//
var tiempo = 0;
//
var tInicio = 0;       //TIP
var tConmutacion = 0;  //TCP
var tFinalizacion = 0; //TFP
//
var cpuOcuapda = False;
var tCpuDesocupada = 0;
var quantum = 0;

// inicializarProcesos(cola_nuevos): Creo e inicializo los procesos por cada línea del archivo txt

while (colaTerminados != cantProcesos) {
    moverProcesosAColaListos();
    asignarCpu(planificacion); //
    terminarCiclo();
}
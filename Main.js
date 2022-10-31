// REVISAR TEMA LECTURA DE ARCHIVOS
// Tengo que leer linea x linea quedándome con los subtstrings
// que esten separados por coma.


// BORRAR //
//
this.id = id;
this.tArribo = tArribo;
this.cantRafagas = cantRafagas;
this.tRafagaCpu = tRafagaCpu;
this.tRafagaES = tRafagaES;
this.prioridad = prioridad;
//
this.tCpuTotal = tRafagaCpu * cantRafagas;
this.tESTotal = tRafagaES * (cantRafagas - 1);
//
this.tComputoParcialCpu = 0; // x ejecución de ráfaga.
this.tComputoParcialES = 0;  // x ejecución de ráfaga.
//
this.tComputoTotalCpu = 0;   // sumatoria de ráfagas parciales.
this.tComputoTotalES = 0;    // sumatoria de ráfagas parciales.
//


/////////////////////////////////////////////
function fcfs() {
    if (colaCorriendo.length != 0 && colaCorriendo[0].tComputoParcialCpu == tRafagaCpu) {
        desasignarCpu();
        let procesoACorrer = colaListos.shift();
        colaCorriendo.push(procesoACorrer);
    
    } else if (colaCorriendo.length == 0) {
        let procesoACorrer = colaListos.shift();
        colaCorriendo.push(procesoACorrer);
    } // Sino sigo esperando que finalice el proceso
}

function pe(procesosMovidos) {
    let prioridades = [];
    if (colaCorriendo.length != 0) {
        if (procesosMovidos.length != 0) {  // Si no hubo nuevos arribos a la cola de listos, no me interesa cambiar, por lo tanto seguiré de largo.
            
            procesosMovidos.forEach(proceso => prioridades.push(proceso.prioridad));
            let masAlta = Math.min.apply(null, prioridades);
            
            if (colaCorriendo[0].prioridad > masAlta) { // Si el proceso que está corriendo tiene un valor más alto, es porque tienen prioridad más baja.
                procesoACorrer = colaListos.filter(proceso => proceso.prioridad == masAlta);
                let idx = colaListos.indexOf(procesoACorrer);
                let procesoACorrer = colaListos.splice(idx, idx+1);
            
                let procesoCorriendo = colaCorriendo.pop();
                procesoCorriendo.fuePausado = True;
            
                colaCorriendo.push(procesoACorrer);
                colaListos.push(procesoCorriendo);
            } // Sino, sigue esperando en la cola de listos con el resto.
        
        
    } else {
        prioridades = [];
        colaListos.forEach(proceso => prioridades.push(proceso.prioridad));
        let masAlta = Math.min.apply(null, prioridades);
        let procesoACorrer = colaListos.filter(proceso => proceso.prioridad == masAlta); // Busco
        let idx = colaListos.indexOf(procesoACorrer);                                    // Obtengo el índice
        procesoACorrer = colaListos.splice(idx, idx+1);                                  // Lo popeo de la cola
        colaCorriendo.push(procesoACorrer);                                              // Le asigno la cpu
    }
    // Sino, dejo que el proceso que está corriendo siga ejecutando.
}                

function rr() {
    if (colaCorriendo.length != 0) {
        if (colaCorriendo[0].tComputoParcialQuantum == quantum && colaCorriendo[0].tComputoParcialQuantum == colaCorriendo[0].tRafagaCpu) { // Caso completó rafaga dentro del tiempo del quantum
            desasignarCpu();
            let procesoACorrer = colaListos.shift();
            colaCorriendo.push(procesoACorrer);

        } else if (colaCorriendo[0].tComputoParcialQuantum == quantum && colaCorriendo[0].tComputoParcialQuantum != colaCorriendo[0].tRafagaCpu) { // Caso no completó ráfaga y se agotó el quantum, debe ser "pausado"
            let procesoADesasignar = colaCorriendo.pop();
            procesoADesasignar.fuePausado = True;
            colaListos.push(procesoADesasignar);

            let procesoACorrer = colaListos.shift();
            colaCorriendo.push(procesoACorrer);
        }
    } else {
        let procesoACorrer = colaListos.shift();
        colaCorriendo.push(procesoACorrer);
    }
}

// Comparamos las duraciones de ráfagas para qudarnos con la más corta y asignar el proceso correspondiente a la cpu
function spn() {
    if (colaCorriendo.length != 0 && colaCorriendo[0].tComputoParcialCpu == tRafagaCpu) {
        desasignarCpu();
        let duracionRafagas = [];
        colaListos.forEach(p => duracionRafagas.push(p.tRafagaCpu));
        let masCorto = Math.min.apply(null, duracionRafagas);
        let idx = duracionRafagas.indexOf(masCorto);
        let procesoACorrer = colaListos.splice(idx, idx+1);
        colaCorriendo.push(procesoACorrer);
    
    } else if (colaCorriendo.length == 0) {
        let duracionRafagas = [];
        colaListos.forEach(p => duracionRafagas.push(p.tRafagaCpu));
        let masCorto = Math.min.apply(null, duracionRafagas);
        let idx = duracionRafagas.indexOf(masCorto);
        let procesoACorrer = colaListos.splice(idx, idx+1);
        colaCorriendo.push(procesoACorrer);
    }
}

function srt(procesosMovidos) {
    let duracionRafagas = [];
    if (procesosMovidos.length != 0) { // Si no hubo nuevos arribos a la cola de listos, no me interesa cambiar, por lo tanto seguiré de largo.
        if (colaCorriendo.length != 0) {
            
            if (colaCorriendo[0].tComputoParcialCpu != tRafagaCpu) {
                procesosMovidos.forEach(proceso => duracionRafagas.push(proceso.tRafagaCpu));
                let masCorta = Math.min.apply(null, duracionRafagas);
                
                if ((colaCorriendo[0].tRafagaCpu - colaCorriendo[0].tComputoParcialCpu) > masCorta) {
                    procesoACorrer = colaListos.filter(proceso => proceso.tRafagaCpu == masCorta);
                    let idx = colaListos.indexOf(procesoACorrer);
                    let procesoACorrer = colaListos.splice(idx, idx+1);

                    let procesoCorriendo = colaCorriendo.pop();
                    // guardar el tiempo de ráfaga en el que estaba para saber cuánto le falta por consumir la próxima vez que entre
                    // al desasignarCpu(), puedo consultar Si: computoRafaga == rafagaCpu => computoRafaga = 0; Sino: no reseteo computoRafaga
                    colaCorriendo.push(procesoACorrer);
                    colaListos.push(procesoCorriendo);
                }

            } else desasignarCpu();

        } else { // No hay procesos corriendo. Elijo el de duración de ráfga más corta para que continúe.
            duracionRafagas = [];
            colaListos.forEach(proceso => duracionRafagas.push(proceso.tRafagaCpu));
            let masCorta = Math.min.apply(null, duracionRafagas);
            let procesoACorrer = colaListos.filter(proceso => proceso.tRafagaCpu == masCorta);
            let idx = colaListos.indexOf(procesoACorrer);
            procesoACorrer = colaListos.splice(idx, idx+1);
            colaCorriendo.push(procesoACorrer);
        }
    }
}



///////////////////////////////////////////////

// Filtra los procesos nuevos y bloqueados que están listos para ser movidos a la cola de listos,
// si exisiteron procesos listos para mover, se mueven a la cola de listos.
function moverProcesosAColaListos() {
    let nuevosAMover = colaNuevos.filter(proceso => proceso.tArribo == tiempo);
    let bloqueadosAMover = colaBloqueados.filter(proceso => proceso.tComputoES == proceso.tRafagaES);    
    
    let procesosAMover = nuevosAMover.forEach(proceso => procesosAMover.push(proceso)); // Debería resetearse con cada llamada a la function
    procesosAMover = bloqueadosAMover.forEach(proceso => procesosAMover.push(proceso));
    
    colaListos = colaListos.concat(procesosAMover);
    
    return procesosAMover;
}

function asignarCpu(planificacion, procesosMovidos) {
    switch (planificacion) {
        case 1: //FCFS (First Come First Served)
            fcfs();
            break;
        case 2: //Prioridad Externa   
            pe(procesosMovidos);                
            break;
        case 3: //Round-Robin
            rr();
            break;
        case 4: //SPN (Shortest Process Next)
            spn();
            break;
        case 5: //SRTN (Shortest Remaining Time Next)
            srt(procesosMovidos);
            break;
    }
}

// Desasigna Cpu y decide si enviarlo a la cola de bloqueados, sino será enviado a la cola de terminados luego de unos ciclos
function desasignarCpu() {
    if (colaCorriendo[0].tComputoTotalES != colaCorriendo[0].tESTotal) {
        let procesoADesasignar = colaCorriendo.pop();

        procesoADesasignar.tComputoTotalCpu += procesoADesasignar.tComputoParcialCpu;
        procesoADesasignar.tComputoParcialCpu = 0;
        
        colaBloqueados.push(procesoADesasignar);
    } else {
        if (tComputoTfp != tfp) { // aplicar TFP
            tComputoTfp += 1;  
        } else {
            tComputoTfp = 0;
            let procesoADesasignar = colaCorriendo.pop();
            colaTerminados.push(procesoADesasignar);
            procesoADesasignar.tRetorno = tiempo;
        }
        
    }
}


// REVISAR //
// Seguramente me falte sumar más tiempos, y calcular más cosas...
function terminarCiclo() {
    if (colaCorriendo.length != 0) { // Hay proceso haciendo uso de cpu? 
        // Aplico TIP y TCP, TFP lo aplico al momento de desasignar cpu
        if (colaCorriendo[0].tComputoTotalCpu == 0 && tComputoTip != tip) {          // aplico TIP. Cuando termina ejecuta tcp, sin resetear todavía el tComputoTip, sino en la siguiente ronda va a entrar otra vez acá
            tComputoTip += 1;
            tCpuDesocupada += 1;
            tUsoSo += 1;
       } else if ((colaCorriendo[0].tComputoParcialCpu == 0 && tComputoTcp != tcp) || (colaCorriendo[0].fuePausado == True && tComputoTcp != tcp)) {
            tComputoTcp += 1;
            tCpuDesocupada += 1;
            tUsoSo += 1;
        } else {                                                                     //cuando temrina puede comenzar a computar rafaga parcial de cpu
            tComputoTip = 0;
            tComputoTcp = 0;
            colaCorriendo[0].fuePausado = False;
            colaCorriendo[0].tComputoParcialCpu += 1;
            tUsoCpu += 1;
        }
    } else {
        tCpuDesocupada += 1;
    }

    tiempo += 1;
}


// MAIN
var cantProcesos = 0;
//
var colaNuevos = [];
var colaListos = [];
var colaCorriendo = [];
var colaBloqueados = [];
var colaTerminados = [];
//
var tiempo = 0;
//
var tip = 0; // Tiempo de Inicio de Proceso (TIP)
var tcp = 0; // Tiempo de Conmutación entre Procesos (TCP)
var tfp = 0; // Tiempo de Finalización de Proceso (TFP)
var tComputoTip = 0;
var tComputoTcp = 0;
var tComputoTfp = 0;
//
var tCpuDesocupada = 0; // Ningún proceso en cpu o uso de SO
var tUsoSo = 0;         // Computo de TIP, TCP y TFP
var tUsoCpu = 0;        // Ejecución efectiva de cpu por los procesos
//
var quantum = 0;

// inicializarProcesos(cola_nuevos): Creo e inicializo los procesos por cada línea del archivo txt

while (colaTerminados != cantProcesos) {
    let procesosMovidos = moverProcesosAColaListos();
    asignarCpu(planificacion, procesosMovidos);
    terminarCiclo();
}
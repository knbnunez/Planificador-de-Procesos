// IMPORTS
const fs = require('fs');
const Proceso = require('./models');


// Definición de variables a usar
let cantProcesos = 0;
//
let colaNuevos = [];
let colaListos = [];
let colaCorriendo = [];
let colaBloqueados = [];
let colaTerminados = [];
//
let tiempo = 0;
//
let tip = 0;            // Tiempo de Inicio de Proceso (TIP) + Lo ingresa el usuario
let tcp = 0;            // Tiempo de Conmutación entre Procesos (TCP) + Lo ingresa el usuario
let tfp = 0;            // Tiempo de Finalización de Proceso (TFP) + Lo ingresa el usuario
let tComputoTip = 0;
let tComputoTcp = 0;
let tComputoTfp = 0;
//
let tCpuDesocupada = 0; // Ningún proceso en cpu o uso de SO
let tUsoSo = 0;         // Computo de TIP, TCP y TFP
let tUsoCpu = 0;        // Ejecución efectiva de cpu por los procesos
//
let quantum = 0;        // Lo ingresa el usuario


// Funciones de planificación
function fcfs() {
    console.log('Dentro de FCFS');
    // Puedo permiterme hacer esto en lugar de encadenar if's porque comparo con AND, entonces si en el recorrido de la condición encuentra que una no se cumple sale de inmediato (corto circuito)
    if ((colaCorriendo.length > 0) && (colaCorriendo[0].tComputoParcialCpu == colaCorriendo[0].tRafagaCpu)) {
        console.log("Se entró en el 1° if de fcfs");
        desasignarCpu();
        let procesoACorrer = colaListos.shift();
        colaCorriendo.push(procesoACorrer);
    
    } else if ((colaCorriendo.length == 0) && (colaListos.length > 0)) {
        let procesoACorrer = colaListos.shift();
        colaCorriendo.push(procesoACorrer);
    } // Sino sigo esperando que finalice el proceso
}

function pe(procesosMovidos) {
    console.log('Dentro de PE');
    let prioridades = [];

    if ((colaCorriendo.length > 0) && (procesosMovidos.length > 0)) { // Si no hubo nuevos arribos a la cola de listos, no me interesa cambiar, por lo tanto seguiré de largo.
        
        procesosMovidos.forEach(proceso => prioridades.push(proceso.prioridad));
        let masAlta = Math.min.apply(null, prioridades);
        
        if (colaCorriendo[0].prioridad > masAlta) { // Si el proceso que está corriendo tiene un valor más alto, es porque tienen prioridad más baja.
            procesoACorrer = colaListos.filter(proceso => proceso.prioridad == masAlta);
            let idx = colaListos.indexOf(procesoACorrer);
            let procesoACorrer = colaListos.splice(idx, idx+1);
        
            let procesoCorriendo = colaCorriendo.pop();
            procesoCorriendo.fuePausado = true;
        
            colaCorriendo.push(procesoACorrer);
            colaListos.push(procesoCorriendo);
        } // Sino, sigue esperando en la cola de listos con el resto.
        
    } else if (colaListos.length > 0) {
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
    console.log('Dentro de RR');

    if (colaCorriendo.length > 0) {
        if (colaCorriendo[0].tComputoParcialQuantum == quantum && colaCorriendo[0].tComputoParcialQuantum < colaCorriendo[0].tRafagaCpu) { // Todavía no completó la ráfaga pero se le agotó el quantum
            let procesoADesasignar = colaCorriendo.pop();
            procesoADesasignar.fuePausado = true;
            colaListos.push(procesoADesasignar);

            // Desasigno proceso en Cpu, pero lo ingreso a cola de listos, todavía le falta terminar su rafaga de Cpu
            let procesoACorrer = colaListos.shift();
            colaCorriendo.push(procesoACorrer);
        }
        else if (colaCorriendo[0].tComputoParcialQuantum == quantum && colaCorriendo[0].tComputoParcialQuantum == colaCorriendo[0].tRafagaCpu) { // Caso completó rafaga dentro del tiempo del quantum
            desasignarCpu();
            let procesoACorrer = colaListos.shift();
            colaCorriendo.push(procesoACorrer);
        } 
    } else if (colaListos.length > 0) {
        let procesoACorrer = colaListos.shift();
        colaCorriendo.push(procesoACorrer);
    }
}

// Comparamos las duraciones de ráfagas para qudarnos con la más corta y asignar el proceso correspondiente a la cpu
function spn() {
    console.log('Dentro de SPN');

    if ((colaCorriendo.length > 0) && (colaCorriendo[0].tComputoParcialCpu == tRafagaCpu)) {
        desasignarCpu();
        let duracionRafagas = [];
        colaListos.forEach(p => duracionRafagas.push(p.tRafagaCpu));
        let masCorto = Math.min.apply(null, duracionRafagas);
        let idx = duracionRafagas.indexOf(masCorto);
        let procesoACorrer = colaListos.splice(idx, idx+1);
        colaCorriendo.push(procesoACorrer);
    
    } else if ((colaCorriendo.length == 0) && (colaListos.length > 0)) {
        let duracionRafagas = [];
        colaListos.forEach(p => duracionRafagas.push(p.tRafagaCpu));
        let masCorto = Math.min.apply(null, duracionRafagas);
        let idx = duracionRafagas.indexOf(masCorto);
        let procesoACorrer = colaListos.splice(idx, idx+1);
        colaCorriendo.push(procesoACorrer);
    }
}

function srt(procesosMovidos) {
    console.log('Dentro de SRT');
    let duracionRafagas = [];

    if ((colaCorriendo.length > 0) && (procesosMovidos.length > 0)) {
        if (colaCorriendo[0].tComputoParcialCpu < tRafagaCpu) {
            procesosMovidos.forEach(proceso => duracionRafagas.push(proceso.tRafagaCpu));
            let masCorta = Math.min.apply(null, duracionRafagas);
            
            if ((colaCorriendo[0].tRafagaCpu - colaCorriendo[0].tComputoParcialCpu) > masCorta) {
                procesoACorrer = colaListos.filter(proceso => proceso.tRafagaCpu == masCorta);
                let idx = colaListos.indexOf(procesoACorrer);
                let procesoACorrer = colaListos.splice(idx, idx+1);

                // Desasigno Cpu, pero entra en cola de listos, por lo que volverá a ejectuar.
                let procesoCorriendo = colaCorriendo.pop();
                colaCorriendo.push(procesoACorrer);
                colaListos.push(procesoCorriendo);
            }
        } else desasignarCpu(); // Bloquea el proceso si todavía le faltan rafagas por ejecutar
    
    } else if ((colaCorriendo.length == 0) && (colaListos.length > 0)) { // No hay procesos corriendo y hay procesos en cola. Elijo el de duración de ráfga más corta para que continúe.
        duracionRafagas = [];
        colaListos.forEach(proceso => duracionRafagas.push(proceso.tRafagaCpu));
        let masCorta = Math.min.apply(null, duracionRafagas);
        let procesoACorrer = colaListos.filter(proceso => proceso.tRafagaCpu == masCorta);
        let idx = colaListos.indexOf(procesoACorrer);
        procesoACorrer = colaListos.splice(idx, idx+1);
        colaCorriendo.push(procesoACorrer);
    }
}

// Funciones comúnes

// Filtra los procesos nuevos y bloqueados que están listos para ser movidos a la cola de listos,
// si exisiteron procesos listos para mover, se mueven a la cola de listos.
function moverProcesosAColaListos() {
    console.log('Dentro de moviendo a cola listos');

    let nuevosAMover = colaNuevos.filter(proceso => proceso.tArribo == tiempo);
    let bloqueadosAMover = colaBloqueados.filter(proceso => proceso.tComputoES == proceso.tRafagaES);    
    
    let procesosAMover = [];
    nuevosAMover.forEach(proceso => procesosAMover.push(proceso));
    bloqueadosAMover.forEach(proceso => procesosAMover.push(proceso));
    
    colaListos = colaListos.concat(procesosAMover);
    
    return procesosAMover;
}

function asignarCpu(planificacion, procesosMovidos) {
    console.log('Dentro de asignar CPU');
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
    console.log('Dentro de Desasignar cpu');

    if (colaCorriendo[0].tComputoTotalES < colaCorriendo[0].tESTotal) {
        let procesoADesasignar = colaCorriendo.pop();
        procesoADesasignar.tComputoTotalCpu += procesoADesasignar.tComputoParcialCpu;
        procesoADesasignar.tComputoParcialCpu = 0;
        colaBloqueados.push(procesoADesasignar);
    } else {
        if (tComputoTfp < tfp) { // aplicar TFP
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
    console.log('Dentro de terminar ciclo');

    // Mejor (...length == 1)
    console.log(colaCorriendo[0]);
    // Hay proceso haciendo uso de cpu? 
    if (colaCorriendo.length > 0) { 
        // Aplico TIP y TCP, TFP lo aplico al momento de desasignar cpu
        // console.log("dentro de terminar ciclo");
        console.log(colaCorriendo[0].tComputoTotalCpu);
        // Aplico TIP. Cuando termina ejecuta tcp, sin resetear todavía el tComputoTip, sino en la siguiente ronda va a entrar otra vez acá
        if ((colaCorriendo[0].tComputoTotalCpu == 0) && (tComputoTip != tip)) {          
            console.log("Entré al if");
            tComputoTip += 1;
            tCpuDesocupada += 1;
            tUsoSo += 1;
       } else if (((colaCorriendo[0].tComputoParcialCpu == 0) && (tComputoTcp < tcp)) || ((colaCorriendo[0].fuePausado == true) && (tComputoTcp < tcp))) {
            tComputoTcp += 1;
            tCpuDesocupada += 1;
            tUsoSo += 1;
        } else {                                                                     //cuando temrina puede comenzar a computar rafaga parcial de cpu
            tComputoTip = 0;
            tComputoTcp = 0;
            colaCorriendo[0].fuePausado = false;
            colaCorriendo[0].tComputoParcialCpu += 1;
            tUsoCpu += 1;
        }
    } else {
        console.log("O entra acá?");
        tCpuDesocupada += 1;
    }

    tiempo += 1;
}

////////////////////////////////////////////////////////////////////////

function main() {
    console.log('dentro de main');
    const planificacion = 1; // Hardcodeado
    while (colaTerminados.length < cantProcesos) {
        console.log("Ejectua el while main: "+tiempo);
        let procesosMovidos = moverProcesosAColaListos();
        asignarCpu(planificacion, procesosMovidos);
        console.log("Asignó procesos a cpu");
        terminarCiclo();
        console.log("");
        console.log("-----------------------");
        console.log("");
    }
    console.log("Tiempo de uso de CPU: "+tUsoCpu);
}


// Desencadenador

function tratarArchivo(archivo) {
	const guardadoEn = archivo.filepath;
	const contenidoDelArchivo = fs.readFileSync(guardadoEn);
    const contenidoDelArchivoString = contenidoDelArchivo.toString()
    var listaProcesos = eval('(' + contenidoDelArchivoString + ')'); 
    // console.log(listaDeProcesos);
    listaProcesos.forEach(p => {
        const objAux = new Proceso(
            p.id, 
            p.tArribo, 
            p.cantRafagas, 
            p.tRafagaCpu, 
            p.tRafagaES,
            p.prioridad
        );
        // console.log(objAux);
        colaNuevos.push(objAux);
        cantProcesos += 1;
    });
    
    console.log({
        msg: "antes del main",
        colaNuevos,
        cantProcesos, 
        // listaProcesos
    });
    main();
}

module.exports = tratarArchivo;
// IMPORTS
const fs = require('fs');
const Proceso = require('./models');

// Para modularizar en el futuro
// const planificaciones = require('./prueba');
// No ocurrió por tiempo



// Definición de variables a usar
let cantProcesos = 0;
//
let colaNuevos = [];
let colaListos = [];
let colaCorriendo = []; // Siempre habrá 1 sólo proceso
let colaBloqueados = [];
let colaTerminados = [];
//
let tiempo = 0;
//
let tip = 0;            // Tiempo de Inicio de Proceso (TIP) + Lo ingresa el usuario
let tcp = 0;            // Tiempo de Conmutación entre Procesos (TCP) + Lo ingresa el usuario
let tfp = 0;            // Tiempo de Finalización de Proceso (TFP) + Lo ingresa el usuario
//
let tCpuDesocupada = 0; // Ningún proceso en cpu o uso de SO
let tUsoSo = 0;         // Computo de TIP, TCP y TFP
let tUsoCpu = 0;        // Ejecución efectiva de cpu por los procesos
//
let quantum = 0;        // Lo ingresa el usuario
//
let tipoPlanificacion = ''; // Default
//
let eventos = []; // Por cada instante de tiempo
let evento = [];  // Dentro de un mismo instante de tiempo

// Funciones de planificación
function fcfs() {
    // console.log('Dentro de FCFS');

    if (
        (colaCorriendo.length > 0) && 
        (colaCorriendo[0].tComputoParcialCpu < colaCorriendo[0].tRafagaCpu)
    ) {
        ejecutarRafaga();
    //
    } else if (
        (colaCorriendo.length > 0) && 
        (colaCorriendo[0].tComputoParcialCpu == colaCorriendo[0].tRafagaCpu)
    ) {
        // Ejecuto TCP si no tiene que ejecutar TFP
        if (colaCorriendo[0].tComputoTotalES < colaCorriendo[0].tESTotal) ejecutarTcp();
        else ejecutarTfp();
    } 

    // Caso Cpu libre y procesos en cola listos
    if (
        (colaCorriendo.length == 0) &&
        (colaListos.length > 0)
    ) {
        // Asignar Cpu
        let procesoACorrer = colaListos.shift();
        colaCorriendo.push(procesoACorrer);
        evento.push('P('+colaCorriendo[0].id+') Se le asignó la CPU');
        
        // Caso primera vez que ejecuta Cpu
        if ((tip > 0) && (colaCorriendo[0].tComputoTip < tip)) ejecutarTip();
        else fcfs(); // Vuelvo a entrar para computar uso de Cpu
    }
    
}


function pe() {

    // Si hay procesos en cola listos, puede que haya un proceso con mayor prioridad que el que está corriendo || o simplemente calculo la prioridad 
    if (colaListos.length > 0) masPrioritarioColaListos = getMayorPrioridad(); // Obj Proceso. Siempre entrará acá por lo menos una vez, por lo que siempre tendrá un valor definido "masPrioritario"
    // console.log({masPrioritarioColaListos});

    if (
        (colaCorriendo.length > 0) &&
        (colaCorriendo[0].tComputoParcialCpu < colaCorriendo[0].tRafagaCpu) && 
        (colaCorriendo[0].prioridad <= masPrioritarioColaListos.prioridad) // A MAYOR VALOR de prioridad, MENOR JERARQUÍA (prioridad) tiene el proceso...
    ) ejecutarRafaga(); 
    //
    else if (
        (colaCorriendo.length > 0) && 
        (colaCorriendo[0].tComputoParcialCpu < colaCorriendo[0].tRafagaCpu) && 
        (colaCorriendo[0].prioridad > masPrioritarioColaListos.prioridad)
    ) { 
        colaCorriendo[0].fuePausado = true;
        ejecutarTcp();
    }
    //
    else if (
        (colaCorriendo.length > 0) &&
        (colaCorriendo[0].tComputoParcialCpu == colaCorriendo[0].tRafagaCpu)
    ) {
        //
        colaCorriendo[0].fuePausado = false;
        if (colaCorriendo[0].tComputoTotalES < colaCorriendo[0].tESTotal) ejecutarTcp();
        else ejecutarTfp();
    }

    // Caso Cpu libre y procesos en cola listos
    if ((colaCorriendo.length == 0) && (colaListos.length > 0)) {
        // Asignar Cpu
        colaListos = colaListos.filter(p => p.id != masPrioritarioColaListos.id);
        colaCorriendo.push(masPrioritarioColaListos);
        evento.push('P('+colaCorriendo[0].id+') Se le asignó la CPU');
        
        // Caso primera vez que ejecuta Cpu
        if ((tip > 0) && (colaCorriendo[0].tComputoTip < tip)) ejecutarTip();
        else pe(); // Vuelvo a entrar para computar uso de Cpu
    }

}               

function rr() {

    if (
        (colaCorriendo.length > 0) &&
        (colaCorriendo[0].tComputoParcialCpu < quantum) && 
        (colaCorriendo[0].tComputoQuantum < colaCorriendo[0].tRafagaCpu)
    ) ejecutarRafaga(); 
    //
    else if (
        (colaCorriendo.length > 0) && 
        (colaCorriendo[0].tComputoParcialCpu == quantum) &&
        (colaCorriendo[0].tComputoQuantum < colaCorriendo[0].tRafagaCpu)
    ) {
        colaCorriendo[0].fuePausado = true;
        ejecutarTcp();
    } 
    //
    else if (
        (colaCorriendo.length > 0) &&
        (colaCorriendo[0].tComputoQuantum == colaCorriendo[0].tRafagaCpu)
    ) {
        //
        colaCorriendo[0].fuePausado = false;
        if (colaCorriendo[0].tComputoTotalES < colaCorriendo[0].tESTotal) ejecutarTcp();
        else ejecutarTfp();
    }

    if (
        (colaCorriendo.length == 0) &&
        (colaListos.length > 0)
    ) {
        // Asignar Cpu
        let procesoACorrer = colaListos.shift();
        colaCorriendo.push(procesoACorrer);
        evento.push('P('+colaCorriendo[0].id+') Se le asignó la CPU');
        
        // Caso primera vez que ejecuta Cpu
        if ((tip > 0) && (colaCorriendo[0].tComputoTip < tip)) ejecutarTip();
        else rr();
    }

}

// Comparamos las duraciones de ráfagas para qudarnos con la más corta y asignar el proceso correspondiente a la cpu
function spn() {
    // console.log('Dentro de SPN');

    if (
        (colaCorriendo.length > 0) && 
        (colaCorriendo[0].tComputoParcialCpu < colaCorriendo[0].tRafagaCpu)
    ) {
        ejecutarRafaga();
    //
    } else if (
        (colaCorriendo.length > 0) && 
        (colaCorriendo[0].tComputoParcialCpu == colaCorriendo[0].tRafagaCpu)
    ) {
        // Ejecuto TCP si no tiene que ejecutar TFP
        if (colaCorriendo[0].tComputoTotalES < colaCorriendo[0].tESTotal) ejecutarTcp();
        else ejecutarTfp();
    } 

    // Caso Cpu libre y procesos en cola listos
    if (
        (colaCorriendo.length == 0) &&
        (colaListos.length > 0)
    ) {
        // Asignar Cpu
        let procesoACorrer = getMasCorto();
        colaListos = colaListos.filter(p => p.id != procesoACorrer.id);
        colaCorriendo.push(procesoACorrer);
        evento.push('P('+colaCorriendo[0].id+') Se le asignó la CPU');
        
        // Caso primera vez que ejecuta Cpu
        if ((tip > 0) && (colaCorriendo[0].tComputoTip < tip)) ejecutarTip();
        else spn(); // Vuelvo a entrar para computar uso de Cpu
    }

}

function srt() {
    // console.log('Dentro de SRT');

    // Obtengo el proceso con duración de ráfaga más corta
    if (colaListos.length > 0) masCorto = getMasCorto(); // Obj Proceso

    if (
        (colaCorriendo.length > 0) &&
        (colaCorriendo[0].tComputoParcialCpu < colaCorriendo[0].tRafagaCpu) && 
        ((colaCorriendo[0].tRafagaCpu - colaCorriendo[0].tComputoParcialCpu) <= masCorto.tRafagaCpu) 
    ) ejecutarRafaga(); 
    //
    else if (
        (colaCorriendo.length > 0) && 
        (colaCorriendo[0].tComputoParcialCpu < colaCorriendo[0].tRafagaCpu) && 
        ((colaCorriendo[0].tRafagaCpu - colaCorriendo[0].tComputoParcialCpu) > masCorto.tRafagaCpu)
    ) { 
        colaCorriendo[0].fuePausado = true;
        ejecutarTcp();
    }
    //
    else if (
        (colaCorriendo.length > 0) &&
        (colaCorriendo[0].tComputoParcialCpu == colaCorriendo[0].tRafagaCpu)
    ) {
        //
        colaCorriendo[0].fuePausado = false;
        if (colaCorriendo[0].tComputoTotalES < colaCorriendo[0].tESTotal) ejecutarTcp();
        else ejecutarTfp();
    }

    // Caso Cpu libre y procesos en cola listos
    if ((colaCorriendo.length == 0) && (colaListos.length > 0)) {
        // Asignar Cpu
        colaListos = colaListos.filter(p => p.id != masCorto.id);
        colaCorriendo.push(masCorto);
        evento.push('P('+colaCorriendo[0].id+') Se le asignó la CPU');
        
        // Caso primera vez que ejecuta
        if ((tip > 0) && (colaCorriendo[0].tComputoTip < tip)) ejecutarTip();
        else srt(); // Vuelvo a entrar para computar uso de Cpu
    }

}

/* -------------------------------------------------------------------------------------------- */

// Funciones comúnes

// Filtra los procesos nuevos y bloqueados que están listos para ser movidos a la cola de listos,
// si exisiteron procesos listos para mover, se mueven a la cola de listos.
function moverProcesosAColaListos() {
    let nuevosAMover = [];
    let bloqueadosAMover = [];
    let procesosAMover = [];

    // Moviento de procesos nuevos
    if (colaNuevos.length > 0) {
        nuevosAMover = colaNuevos.filter(p => p.tArribo == tiempo);
        colaNuevos = colaNuevos.filter(p => p.tArribo != tiempo);
        // if (nuevosAMover.length > 0) {
        //     colaNuevos.forEach((p) => console.log('colaNuevos P'+p.id));
        //     nuevosAMover.forEach((p) => console.log('nuevosAMover P'+p.id));
        // }
    }

    // Moviento de procesos bloqueados
    if (colaBloqueados.length > 0) {
        bloqueadosAMover = colaBloqueados.filter(proceso => proceso.tComputoParcialES == proceso.tRafagaES);
        colaBloqueados = colaBloqueados.filter(proceso => proceso.tComputoParcialES != proceso.tRafagaES);
        // colaBloqueados.forEach((p) => console.log('colaBloqueados P'+p.id));
        if (bloqueadosAMover.length > 0) {
            bloqueadosAMover.forEach((p) => {
                p.tComputoTotalES += p.tComputoParcialES;
                p.tComputoParcialES = 0;   
                // console.log('bloqueadosAMover P'+p.id);
            });
        }
    }

    // Concatenación de ambos resultados
    if ((nuevosAMover.length > 0) || (bloqueadosAMover.length > 0)) {
        procesosAMover = procesosAMover.concat(nuevosAMover, bloqueadosAMover);
        // if (procesosAMover.length > 0) procesosAMover.forEach((p) => console.log('Moviendo procesos a cola de listos P'+p.id));
        procesosAMover.forEach(p => evento.push('P('+p.id+') Ingresó a Cola de Listos'));
        colaListos = colaListos.concat(procesosAMover);
    }

    return [procesosAMover];
}

/* -------------------------------------------------------------------------------------------- */

function ejecutarPlanificacion(tipoPlanificacion, procesosMovidos) {
    // Si tiene que ejecutar tip por más de una und, ejecuto y retorno sin seguir hacia las planificaciones
    if ((colaCorriendo.length > 0) && (colaCorriendo[0].tComputoTip < tip)) {
        ejecutarTip();
        return
    }
    
    // console.log(tipoPlanificacion);

    switch (tipoPlanificacion) {
        case 'fcfs': //FCFS (First Come First Served)
            fcfs();
            break;
        case 'pe': //Prioridad Externa   
            pe();                
            break;
        case 'rr': //Round-Robin
            if (quantum > 0) rr();
            else fcfs();
            break;
        case 'spn': //SPN (Shortest Process Next)
            spn();
            break;
        case 'srt': //SRTN (Shortest Remaining Time Next)
            srt();
            break;
        default:
            fcfs();
            break;
    }
}

/* -------------------------------------------------------------------------------------------- */

function getMayorPrioridad() {
    let prioridades = colaListos.map(p => p.prioridad);
    let prioritario = colaListos.find(p => p.prioridad == Math.min.apply(null, prioridades));
    return prioritario;
}

function getMasCorto() {
    let duracionesRafagas = colaListos.map(p => p.tRafagaCpu);
    let masCorto = colaListos.find(p => p.tRafagaCpu == Math.min.apply(null, duracionesRafagas));
    return masCorto;
}

/* -------------------------------------------------------------------------------------------- */

function ejecutarRafaga() {
    // console.log('Usando CPU... P'+colaCorriendo[0].id);
    if (colaCorriendo[0].tComputoParcialCpu == 0) evento.push('P('+colaCorriendo[0].id+') Comenzó a ejecutar ráfaga de CPU');

    if (tipoPlanificacion != 'rr') {
        evento.push('P('+colaCorriendo[0].id+') Ejecutando ráfaga de CPU');
        colaCorriendo[0].tComputoParcialCpu += 1;
        tUsoCpu += 1;
    //
    } else { // Se está ejecutando el tipo de planificación: round robin
        evento.push('P('+colaCorriendo[0].id+') Ejecutando ráfaga de CPU');
        colaCorriendo[0].tComputoParcialCpu += 1;
        colaCorriendo[0].tComputoQuantum += 1;
        tUsoCpu += 1;
    }
}

/* -------------------------------------------------------------------------------------------- */

function ejecutarTip() {
    // console.log("Entré al if");
    if (colaCorriendo[0].tComputoTip == 0) evento.push('P('+colaCorriendo[0].id+') El SO comenzó a ejecutar su TIP');

    colaCorriendo[0].tComputoTip += 1;
    tUsoSo += 1;
    // console.log('TIP aplicando a P'+colaCorriendo[0].id);
    
    // if (colaCorriendo[0].tComputoTip == tip) console.log('TIP En el próximo turno comenzará a hacer uso de CPU P'+colaCorriendo[0].id);
    if (colaCorriendo[0].tComputoTip == tip) evento.push('P('+colaCorriendo[0].id+') El SO terminó de ejecutar su TIP');
}

function ejecutarTcp() {
    if (colaCorriendo[0].tComputoTcp == 0) evento.push('P('+colaCorriendo[0].id+') El SO comenzó a ejecutar su TCP');

    if ((colaCorriendo[0].tComputoTcp < tcp) && (tcp > 0)) {
        // console.log('Ejecutando TCP... P'+colaCorriendo[0].id);
        colaCorriendo[0].tComputoTcp += 1;
        tUsoSo += 1;
    //
    } else {
        evento.push('P('+colaCorriendo[0].id+') El SO terminó de ejecutar su TCP');
        let procesoDesasignado = desasignarCpu();
        procesoDesasignado.tComputoTcp = 0;
        
        
        if (!procesoDesasignado.fuePausado) {
            if (tipoPlanificacion != 'rr') procesoDesasignado.tComputoTotalCpu += procesoDesasignado.tComputoParcialCpu;
            else procesoDesasignado.tComputoTotalCpu += procesoDesasignado.tComputoQuantum; // Caso rr
           
            procesoDesasignado.tComputoParcialCpu = 0; 
            procesoDesasignado.tComputoQuantum = 0; // Sólo tiene sentido en rr

            colaBloqueados.push(procesoDesasignado);
            // console.log('Finalizó el TCP, ingresó a cola de Bloqueados: P'+procesoDesasignado.id);
            evento.push('P('+procesoDesasignado.id+') Ingresó a Cola de Bloqueados');
        //
        } else { // Caso planificaciones pe, rr, srt (las preemptivas)
            if (tipoPlanificacion == 'rr') procesoDesasignado.tComputoParcialCpu = 0; // Sólo tiene sentido en rr 
            colaListos.push(procesoDesasignado);
            // console.log('Finalizó el TCP, ingresó a cola de Listos porque fue Pausado, no se resetean los computos: P'+procesoDesasignado.id);
            evento.push('P('+procesoDesasignado.id+') Ingresó a Cola de Listos (por Preemptive)');
        }
        
    }
}

function ejecutarTfp() {
    if (colaCorriendo[0].tComputoTfp == 0) evento.push('P('+colaCorriendo[0].id+') El SO comenzó a ejecutar su TFP');
    
    // Sumo cómputo de TFP hasta que sea = a TFP (total), luego entra a cola de terminados 
    if ((colaCorriendo[0].tComputoTfp < tfp) && (tfp > 0)) {
        // console.log('Ejecutando TFP... P'+colaCorriendo[0].id);
        colaCorriendo[0].tComputoTfp += 1;
        tUsoSo += 1; 

    } else {
        evento.push('P('+colaCorriendo[0].id+') El SO terminó de ejecutar su TFP');
        let procesoDesasignado = desasignarCpu();
        procesoDesasignado.tComputoTotalCpu += procesoDesasignado.tComputoParcialCpu;
        procesoDesasignado.tComputoParcialCpu = 0;
        procesoDesasignado.tRetorno = tiempo;
        

        colaTerminados.push(procesoDesasignado);
        // console.log('Finalizó el TFP, ingresó a la cola de TERMINADOS P'+procesoDesasignado.id);
        evento.push('P('+procesoDesasignado.id+') Ingresó a Cola de Terminados');
    }  
}

/* -------------------------------------------------------------------------------------------- */

// asignarCpu() se asigna Cpu dentro de cada planificación, porque depende de condiciones variables

function desasignarCpu() {
    let procesoADesasignar = colaCorriendo.pop();
    // console.log('Abandonando CPU... P'+procesoADesasignar.id);    
    evento.push('P('+procesoADesasignar.id+') Se le desasignó la CPU');
    return procesoADesasignar;
}

/* -------------------------------------------------------------------------------------------- */

// Computo de tiempos en terminarCiclo() a no ser que sea imprescindible hacerlo que otro lugar...
function terminarCiclo() {
    
    if (colaCorriendo.length == 0) tCpuDesocupada += 1;
    //
    if (colaBloqueados.length > 0) colaBloqueados.forEach(p => p.tComputoParcialES += 1);
    //
    if (colaListos.length > 0) colaListos.forEach(p => p.tEspera += 1);
    //
    if (colaTerminados.length < cantProcesos) tiempo += 1;
}

/* -------------------------------------------------------------------------------------------- */

function main() {
    console.log({
        evento,
        tipoPlanificacion,
        tip,
        tcp,
        tfp,
        quantum,
        colaNuevos
    });

    while (colaTerminados.length < cantProcesos) {
        evento = [];
        let movidos = moverProcesosAColaListos();
        ejecutarPlanificacion(tipoPlanificacion, movidos);
        terminarCiclo();
        simulaciones(evento);
    }
    console.log({eventos});
    
    // Generación de archivo resultado opcional...
    // const resultado = {
    // Agregar los objetos/arrays que quiera enviar por archivo.txt
    // };
    // console.log({resultado});
    // const resultadoStr = JSON.stringify(resultado);
    // fs.writeFileSync("../archivos-procesos-txt/resultado.txt", resultadoStr);
    // console.log(resultadoStr);
}


/* -------------------------------------------------------------------------------------------- */

function simulaciones(evento) {
    eventos.push(evento);
}

function getEventos() {
    return eventos;
}

function getResultados() {
    // Para cada Proceso
    let tRetornoProcesos = colaTerminados.map(p => ({
        Pid: p.id,
        tRetorno: p.tRetorno,
    }));

    // console.log({tRetornoProcesos});

    let tRetornoNormalizados = colaTerminados.map(p => ({
        Pid: p.id,
        tRetornoNormal: (p.tRetorno - p.tEspera),
    }));

    let tEstadoListos = colaTerminados.map(p => ({
            Pid: p.id,
            tEspera: p.tEspera,
    }));
    
    // Para la Tanda
    let tRetorno = tiempo;

    let total = 0;
    for (let i = 0; i < colaTerminados.length; i++) total += colaTerminados[i].tRetorno - colaTerminados[i].tEspera;
    
    let tMedioRetorno = (total / colaTerminados.length);
    
    // Para el uso de la CPU
    // tCpuDesocupada
    // tUsoSo
    let tAbsolutos = colaTerminados.map(p => ({
        Pid: p.id,
        tAbsoluto: p.tComputoTotalCpu,
    }));
    
    let tPorcentuales = colaTerminados.map(p => ({
        Pid: p.id,
        tPorcentual: Math.round((p.tComputoTotalCpu * 100)/tUsoCpu),
    }));
    
    return [
        tRetornoProcesos,     // array
        tRetornoNormalizados, // array
        tEstadoListos,        // array
        tRetorno,             // .valor
        tMedioRetorno,        // .valor
        tCpuDesocupada,       // .valor
        tUsoSo,               // .valor
        tAbsolutos,           // array
        tPorcentuales,        // array
        tipoPlanificacion,    // .valor
    ];  
}


/* -------------------------------------------------------------------------------------------- */

function tratarInputs(tipoPlanificacionInput, tipInput, tcpInput, tfpInput, quantumInput, archivo) {
    const guardadoEn = archivo.filepath;
	const contenidoDelArchivo = fs.readFileSync(guardadoEn);
    // console.log({contenidoDelArchivo});
    const contenidoDelArchivoString = contenidoDelArchivo.toString()
    console.log({contenidoDelArchivoString});
    var listaProcesos = eval('(' + contenidoDelArchivoString + ')'); 
    
    listaProcesos.forEach(p => {
        const objAux = new Proceso(
            p.id, 
            p.tArribo, 
            p.cantRafagas, 
            p.tRafagaCpu, 
            p.tRafagaES,
            p.prioridad
        );
        colaNuevos.push(objAux);
        evento.push('P('+p.id+') Ingresó a Cola de Nuevos');
        cantProcesos += 1;
    });
    simulaciones(evento);
    console.log({
        tipoPlanificacionInput,
        tipInput,
        tcpInput,
        tfpInput,
        quantumInput
    });

    tipoPlanificacion = 'fcfs';
    tip = 0;
    tcp = 0;
    tfp = 0;
    quantum = 5;

    if (tipoPlanificacionInput != undefined) tipoPlanificacion = tipoPlanificacionInput;
    if (tipInput != undefined) tip = tipInput;
    if (tcpInput != undefined) tcp = tcpInput;
    if (tfpInput != undefined) tfp = tfpInput;
    if (quantumInput != undefined) quantum = quantumInput;

    // ¡¡¡A SOLUCIONAR!!!
    // Si no se reinicia el servidor, no cambia la política de planificación... No comprendo por qué...
    // https://es.stackoverflow.com/questions/41771/como-reiniciar-un-proceso-con-nodejs
    
    main();
    
    // Reseteo valores
    colaNuevos = [];
    cantProcesos = 0;
    
}

module.exports = {
    tratarInputs: tratarInputs,
    getEventos: getEventos,
    getResultados: getResultados
}
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
    //
    // console.log('Dentro de FCFS');
    //
    // Puedo permiterme hacer esto en lugar de encadenar if's porque comparo con AND, entonces si en el recorrido de la condición encuentra que una no se cumple sale de inmediato (corto circuito)
    if ((colaCorriendo.length > 0) && (colaCorriendo[0].tComputoParcialCpu == colaCorriendo[0].tRafagaCpu)) { // Caso se completó la ráfaga de Cpu
        //
        // console.log("Se entró en el 1° if de fcfs");
        // if (colaCorriendo === undefined) return;
        // console.log({
        //     msg: "Contenido de colaListos",
        //     colaListos
        // });
        //
        desasignarCpu();
        // if (colaListos.length > 0) {
        //     let procesoACorrer = colaListos.shift();
        //     colaCorriendo.push(procesoACorrer);
        // }
        // console.log('En FCFS colaCorriendo Pid: '+colaCorriendo[0]?.id);
        //
    } 
    //
    if ((colaCorriendo.length == 0) && (colaListos.length > 0)) { // Caso Cpu libre y hay procesos en cola de listos
        let procesoACorrer = colaListos.shift();
        colaCorriendo.push(procesoACorrer);
        //
        // console.log('En FCFS colaCorriendo Pid: '+colaCorriendo[0].id);
        //
    }
    // Sino será tiempo de Cpu desperdiciado
}

function pe(procesosMovidos) {
    // console.log('Dentro de PE');
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
        
    } else if ((colaCorriendo.length == 0) && (colaListos.length > 0)) {
        prioridades = [];
        colaListos.forEach(proceso => prioridades.push(proceso.prioridad));
        let masAlta = Math.min.apply(null, prioridades);
        let procesoACorrer = colaListos.filter(proceso => proceso.prioridad == masAlta); // Busco
        let idx = colaListos.indexOf(procesoACorrer);                                    // Obtengo el índice
        procesoACorrer = colaListos.splice(idx, idx+1);                                  // Lo popeo de la cola
        colaCorriendo.push(procesoACorrer);                                              // Le asigno la cpu
    }
    // Sino, dejo que el proceso que está corriendo siga ejecutando o en caso de no haber ninguno, será Cpu desperdiaciada
}               

function rr() {
    // console.log('Dentro de RR');

    if (colaCorriendo.length > 0) {
        if ((colaCorriendo[0].tComputoParcialQuantum == quantum) && (colaCorriendo[0].tComputoParcialQuantum < colaCorriendo[0].tRafagaCpu)) { // Todavía no completó la ráfaga pero se le agotó el quantum
            let procesoADesasignar = colaCorriendo.pop();
            procesoADesasignar.fuePausado = true;
            colaListos.push(procesoADesasignar);

            // Desasigno proceso en Cpu, pero lo ingreso a cola de listos, todavía le falta terminar su rafaga de Cpu
            let procesoACorrer = colaListos.shift(); // Si no había otros procesos esperando, volverá a entrar a Cpu el mismo proceso que estaba corriendo recién. Será un push cola listos y pop cola listos del mismo elemento
            colaCorriendo.push(procesoACorrer);
        }
        else if ((colaCorriendo[0].tComputoParcialQuantum == quantum) && (colaCorriendo[0].tComputoParcialQuantum == colaCorriendo[0].tRafagaCpu)) { // Caso completó rafaga dentro del tiempo del quantum
            desasignarCpu();
        } 
    }

    if ((colaCorriendo.length == 0) && (colaListos.length > 0)) {
        let procesoACorrer = colaListos.shift();
        colaCorriendo.push(procesoACorrer);
    }
    //
    // Sino será tiempo de Cpu desperdiciado
}

// Comparamos las duraciones de ráfagas para qudarnos con la más corta y asignar el proceso correspondiente a la cpu
function spn() {
    // console.log('Dentro de SPN');

    if ((colaCorriendo.length > 0) && (colaCorriendo[0].tComputoParcialCpu == tRafagaCpu)) desasignarCpu();

    // Para no duplicar código no encadeno los if's  como hacía antes

    if ((colaCorriendo.length == 0) && (colaListos.length > 0)) {
        let duracionRafagas = [];
        colaListos.forEach(p => duracionRafagas.push(p.tRafagaCpu));
        let masCorto = Math.min.apply(null, duracionRafagas);
        let idx = duracionRafagas.indexOf(masCorto);
        let procesoACorrer = colaListos.splice(idx, idx+1);
        colaCorriendo.push(procesoACorrer);
    }
    //
    // Sino será tiempo de Cpu desperdiciado
}

function srt(procesosMovidos) {
    // console.log('Dentro de SRT');
    let duracionRafagas = [];

    if (colaCorriendo.length > 0) {
        if ((colaCorriendo[0].tComputoParcialCpu < tRafagaCpu) && (procesosMovidos.length > 0)) { // Sino hay procesos movidos, y la ráfaga de cpu todavía no se completó, no hago nada, seguiré ejecutando...
            procesosMovidos.forEach(proceso => duracionRafagas.push(proceso.tRafagaCpu));
            let masCorta = Math.min.apply(null, duracionRafagas);
            
            if ((colaCorriendo[0].tRafagaCpu - colaCorriendo[0].tComputoParcialCpu) > masCorta) {
                procesoACorrer = colaListos.filter(proceso => proceso.tRafagaCpu == masCorta);
                let idx = colaListos.indexOf(procesoACorrer);
                let procesoACorrer = colaListos.splice(idx, idx+1);

                let procesoCorriendo = colaCorriendo.pop(); // Desasigno Cpu, pero entra en cola de listos, por lo que volverá a ejectuar luego.
                procesoCorriendo.fuePausado = true;
                colaListos.push(procesoCorriendo);

                colaCorriendo.push(procesoACorrer);
            }
        
        } else if (colaCorriendo[0].tComputoParcialCpu == tRafagaCpu) desasignarCpu();
    }
    //
    if ((colaCorriendo.length == 0) && (colaListos.length > 0)) { // No hay procesos corriendo y hay procesos en cola. Elijo el de duración de ráfga más corta para que continúe.
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
    //
    // console.log('Moviendo procesos a cola de listos');
    //
    // No estoy popeando los procesos de la cola, debería sacarlos
    // let nuevosAMover = colaNuevos.filter(p => p.tArribo == tiempo);
    // nuevosAMover.forEach(i => {
    //     colaNuevos.forEach((j, idx) => {
    //         if (i.id == j.id) colaNuevos.splice(idx, idx+1);
    //     });
    // });
    // Lo mismo
    // let bloqueadosAMover = colaBloqueados.filter(proceso => proceso.tComputoParcialES == proceso.tRafagaES);    
    // let bloqueadosAMover = colaBloqueados.forEach(p => {
    //     if (p.tComputoParcialES == p.tRafagaES) return colaBloqueados.pop();
    // });
    // let bloqueadosAMover = colaBloqueados.filter(p => p.tComputoParcialES == p.tRafagaES);
    // bloqueadosAMover.forEach(i => {
    //     colaBloqueados.forEach((j, idx) => {
    //         if (i.id == j.id) colaBloqueados.splice(idx, idx+1);
    //     });
    // });
    let nuevosAMover = colaNuevos.filter(p => p.tArribo == tiempo);
    for (let i = 0; i < nuevosAMover.length; i++) {
        for (let j = 0; j < colaNuevos.length; j++) {
            if (nuevosAMover[i].id == colaNuevos[j].id) colaNuevos.splice(j, j+1);
        }
    }

    let bloqueadosAMover = colaBloqueados.filter(p => p.tComputoParcialES == p.tRafagaES);
    for (let i = 0; i < bloqueadosAMover.length; i++) {
        for (let j = 0; j < colaBloqueados.length; j++) {
            if (bloqueadosAMover[i].id == colaBloqueados[j].id) colaBloqueados.splice(j, j+1);
        }
    }
    
    let procesosAMover = [];
    // nuevosAMover.forEach(proceso => procesosAMover.push(proceso));
    // bloqueadosAMover.forEach(proceso => procesosAMover.push(proceso));
    for (const p of nuevosAMover) procesosAMover.push(p);
    for (const p of bloqueadosAMover) procesosAMover.push(p);

    // console.log('Tiempo '+tiempo);
    // console.log({
    //     colaNuevos,
    //     nuevosAMover,
    //     colaBloqueados,
    //     bloqueadosAMover,
    //     procesosAMover,

    // });
    
    colaListos = colaListos.concat(procesosAMover);
    
    // console.log({
    //     msg: "Procesos movidos",
    //     tiempo,
    //     procesosAMover,
    //     colaListos
    // });

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
    // console.log('Dentro de Desasignar cpu');

    if (colaCorriendo[0].tComputoTotalES < colaCorriendo[0].tESTotal) {
        let procesoADesasignar = colaCorriendo.pop();
        //
        // console.log('Proceso a desasignar Pid: '+procesoADesasignar.id);
        //
        procesoADesasignar.tComputoTotalCpu += procesoADesasignar.tComputoParcialCpu;
        procesoADesasignar.tComputoParcialCpu = 0;
        colaBloqueados.push(procesoADesasignar);
        //
        // console.log({
        //     msg: "Proceso movido a colaBloqueados",
        //     colaBloqueados,
        //     colaCorriendo
        // });
        // colaBloqueados.forEach(p => console.log('Procesos en colaBloqueados Pid: '+p.id));
        //
    } else if (colaCorriendo[0].tComputoTotalCpu == colaCorriendo[0].tCpuTotal) {
        console.log('Entra acá?');
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
    // console.log('Dentro de terminar ciclo');

    // Hay proceso haciendo uso de cpu? 
    if (colaCorriendo.length > 0) { // Aplico TIP y TCP, TFP lo aplico al momento de desasignar cpu
        
        // const largo = colaCorriendo.length;
        // if (colaCorriendo)
        // console.log({
            
        //     colaCorriendo,
        //     msg: "largo: ",
        //     largo
        // });

        // Aplico TIP. Cuando termina ejecuta tcp, sin resetear todavía el tComputoTip, sino en la siguiente ronda va a entrar otra vez acá
        if ((colaCorriendo[0]?.tComputoTotalCpu == 0) && (tComputoTip < tip)) {          
            // console.log("Entré al if");
            tComputoTip += 1;
            tCpuDesocupada += 1;
            tUsoSo += 1;

       } else if (((colaCorriendo[0].tComputoParcialCpu == 0) && (tComputoTcp < tcp)) || ((colaCorriendo[0].fuePausado == true) && (tComputoTcp < tcp))) {
            tComputoTcp += 1;
            tCpuDesocupada += 1;
            tUsoSo += 1;

        } else {                                                                     // Cuando temrina puede comenzar a computar rafaga parcial de cpu
            tComputoTip = 0;
            tComputoTcp = 0;
            colaCorriendo[0].fuePausado = false;
            colaCorriendo[0].tComputoParcialCpu += 1;
            tUsoCpu += 1;
            //
            // console.log({
            //     msg: "Proceso corriendo",
            //     colaCorriendo,
            //     tUsoCpu
            // });
            // console.log('Terminando Ciclo colaCorriendo Pid: '+colaCorriendo[0].id+' Uso de Cpu: '+tUsoCpu);
            //
        }

    } else {
        
        // console.log({
        //     msg: "Cpu desocupada",
        //     colaCorriendo
        // });
        
        tCpuDesocupada += 1;
    }

    if (colaBloqueados.length > 0) colaBloqueados.forEach(p => p.tComputoParcialES += 1);
    if (colaListos.length > 0) colaListos.forEach(p => p.tEspera += 1);

    tiempo += 1;
    //
    // console.log({
    //     msg: "Tiempo: ", tiempo,
    //     colaNuevos,
    //     colaListos,
    //     colaCorriendo,
    //     colaBloqueados,
    //     colaTerminados
    // });
    //
}

////////////////////////////////////////////////////////////////////////
function imprimirResultados() {
    // Luego pasar todo a html con varios a idElemento.innerHTML += ...
    
    console.log({
        msg1: `Tiempo de finalización ${tiempo}`,
        msg2: `Tiempo de CPU ${tUsoCpu}`,
        msg3: `Tiempo de SO ${tUsoSo}`,
        msg4: `Estado de la cola de terminados ${colaTerminados.length}`
    });

    colaTerminados.forEach(p => {
        console.log({
            msg1: `Para ${p.id}:`,
            msg2: `Tiempo de Retorno ${p.tRetorno}`,
            msg3: `Tiempo de Retorno Normalizado ${p.tRetorno - p.tEspera}`,
            msg4: `Tiempo en Estado de Listo ${p.tEspera}`
        });
    });
    
    let total = 0;
    for(var i = 0; i < colaTerminados.length; i++) total += colaTerminados[i].tRetorno;
    let avg = total / colaTerminados.length;
    console.log({
        msg1: `Para la tanda de procesos:`,
        msg2: `Tiempo de Retorno ${tiempo}`,
        msg3: `Tiempo Medio de Retorno ${avg}`
    });

    console.log({
        msg1: `Tiempos de CPU desocupada ${tCpuDesocupada}`,
        msg2: `Tiempo de CPU utilizada por el SO ${tUsoSo}`,
        msg3: `Tiempo de CPU utlizada por los procesos:`,
        // msg: `- Absoluto = ${tUsoCpu}`,
        // msg: `- Porcentual = ${tUsoCpu}`
    });
    
    colaTerminados.forEach(p => {
        console.log({
            msg1: `Absolutos:`,
            msg2: `Para ${p.id}: ${p.tComputoTotalCpu}`,
        });
    });
    colaTerminados.forEach(p => {
        console.log({
            msg1: `Porcentuales:`,
            msg2: `Para ${p.id}: ${(p.tComputoTotalCpu * 100)/tUsoCpu}`,
        });
    });
        
}


function main() {
    // console.log('Comenzando simulación...');
    const planificacion = 1; // Hardcodeado
    for (let index = 0; index < 120; index++) {
    // while (colaTerminados.length < cantProcesos) {
        // console.log('Length colaTerminados: '+colaTerminados.length);
        let procesosMovidos = moverProcesosAColaListos();
        asignarCpu(planificacion, procesosMovidos);
        terminarCiclo();
        // console.log('');
        // console.log('-----------------------');
        // console.log('');
        console.log('Tiempo: '+tiempo);
    }
    
    // Finalizando imprimo
    imprimirResultados();    
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
    
    // console.log({
    //     msg: "Procesos cargados en colaNuevos",
    //     colaNuevos,
    //     cantProcesos
    // });

    main();
}

module.exports = tratarArchivo;
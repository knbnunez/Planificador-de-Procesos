class Proceso {
    constructor (id, tArribo, cantRafagas, tRafagaCpu, tRafagaES, prioridad) {
        this.id = id;
        this.tArribo = tArribo;
        this.cantRafagas = cantRafagas;
        this.tRafagaCpu = tRafagaCpu;
        this.tRafagaES = tRafagaES;
        this.prioridad = prioridad;
        //
        this.tCpuTotal = tRafagaCpu * cantRafagas;
        
        this.tESTotal = tRafagaES * Math.round(cantRafagas - 1);
        //
        this.tComputoParcialCpu = 0; // x ejecución de ráfaga.
        this.tComputoParcialES = 0;  // x ejecución de ráfaga.
        //
        this.tComputoTotalCpu = 0;   // sumatoria de ráfagas parciales.
        this.tComputoTotalES = 0;    // sumatoria de ráfagas parciales.
        //
        this.tComputoTip = 0;        // para el TIP
        this.tComputoTcp = 0;        // para el TCP
        this.tComputoTfp = 0;        // para el TFP
        //
        this.fuePausado = false; // solo afecta en prioridad externa y round robin (a los preemptive)
        //
        this.tRetorno = 0;
        this.tEspera = 0;
    }
}

module.exports = Proceso;
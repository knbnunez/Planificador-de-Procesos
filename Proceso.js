// Constructor
function Proceso(id, tArribo, cantRafagas, tRafagaCpu, tRafagaES, prioridad) {
    this.id = id;
    this.tArribo = tArribo;
    this.cantRafagas = cantRafagas;
    this.tRafagaCpu = tRafagaCpu;
    this.tRafagaES = tRafagaES;
    this.prioridad = prioridad;
    //
    this.tCpuTotal = tRafagaCpu * cantRafagas;
    this.tESTotal = tRafagaES * cantRafagas;
    this.tComputoCpu = 0;
    this.tComputoES = 0;
}
function func1(param) {
    console.log('Print 1: param'+param);
}


function func2(cola) {
    console.log('Print 2'+{cola});
    cola = [1, 2, 3];
}


// Se debe exportar de esta manera
module.exports = {
    func1: func1,
    func2: func2
}
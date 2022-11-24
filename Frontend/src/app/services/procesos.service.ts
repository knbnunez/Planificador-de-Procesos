import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http'

@Injectable({
  providedIn: 'root'
})

export class ProcesosService {

  constructor(private servicio:HttpClient) {
    console.log('Servicio funcionando');
  }

  _url:string = 'http://localhost:3000/';

  getEventos() {
    return this.servicio.get(this._url+'eventos');
  }

  getResultados() {
    return this.servicio.get(this._url+'resultados');
  }

  postInputForm(): void {
    this.servicio.post(this._url+'cargas');
  }
}
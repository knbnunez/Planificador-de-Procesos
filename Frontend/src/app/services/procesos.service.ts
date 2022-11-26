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

  postInputForm(body: FormData): void {
    // console.log('Entró a hacer el POST');

    // this.servicio.post(this._url+'cargas', body);
    this.servicio.post<any>(this._url+'cargas', body).subscribe(data => console.log({data}));
  }
}
import { Component, OnInit } from '@angular/core';
import { ProcesosService } from '../services/procesos.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css']
})

export class ResultsComponent implements OnInit {
  
  eventos: any = [];
  resultados: any = [];

  constructor(private _servicio: ProcesosService, private _router: Router) {
    // this._servicio.getEventos().subscribe(data => {
    //   console.log(data);
    //   this.eventos = data;
    // }); 
    // //
    // this._servicio.getResultados().subscribe(data => {
    //   console.log(data);
    //   this.resultados = data;
    // }); 
  }

  ngOnInit() { }

  verDatos() {
    this._servicio.getEventos().subscribe(data => {
      console.log(data);
      this.eventos = data;
    }); 
    //
    this._servicio.getResultados().subscribe(data => {
      console.log(data);
      this.resultados = data;
    });
  }

  return() {
    this._router.navigate(['']);
  }

}

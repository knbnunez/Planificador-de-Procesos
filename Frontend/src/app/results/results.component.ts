import { Component, OnInit } from '@angular/core';
import { ProcesosService } from '../services/procesos.service';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css']
})

export class ResultsComponent implements OnInit {
  
  items: any = [];

  constructor(private _servicio:ProcesosService) { }

  ngOnInit() {
    // llamada al servicio get para traerme los datos
    // getEventos().suscrbe
    // getResultados()
    
    // Acá debería ir el Post, no los get
    this._servicio.getEventos().subscribe(data => {
      console.log(data);
      this.items = data;
    }); 

    this._servicio.getResultados().subscribe(data => {
      console.log(data);
      this.items = data;
    }); 
  }

}

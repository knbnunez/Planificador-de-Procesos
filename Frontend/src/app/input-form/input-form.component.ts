import { Component, OnInit } from '@angular/core';

import { ProcesosService } from '../services/procesos.service'

@Component({
  selector: 'app-input-form',
  templateUrl: './input-form.component.html',
  styleUrls: ['./input-form.component.css']
})

export class InputFormComponent implements OnInit{
  
  constructor(private _servicio:ProcesosService) { }

  ngOnInit(): void {
     
  }

  // función que encapsula los envíos de datos a la API
  // postInputForm() // Método para enviar datos desde el botón

}

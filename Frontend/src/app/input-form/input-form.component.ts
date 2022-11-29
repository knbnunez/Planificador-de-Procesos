import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { ProcesosService } from '../services/procesos.service'
import { Router } from '@angular/router';

@Component({
  selector: 'app-input-form',
  templateUrl: './input-form.component.html',
  styleUrls: ['./input-form.component.css']
})

export class InputFormComponent implements OnInit{
  
  form: any;
  private _fileTmp: any;
  body: FormData = new FormData();

  constructor(private _servicio: ProcesosService, private _router: Router) { 
    this.buildForm();
  }

  ngOnInit(): void {
     
  }

  private buildForm() {
    this.form = new FormGroup({
      planificacion: new FormControl('', [Validators.required]),
      tip: new FormControl(''),
      tcp: new FormControl(''),
      tfp: new FormControl(''),
      quantum: new FormControl(''),
      archivo: new FormControl('', [Validators.required])
    });
  }


  
  getFile($event: any): void {
    // console.log($event);
    const file = $event.target.files[0];
    console.log(file);
    this._fileTmp = {
      fileRaw: file,
      fileName: file.name
    }
    this.body.append('archivo', this._fileTmp.fileRaw, this._fileTmp.fileName);
  }

  getTarget(formControlName: string): void {
    // console.log(value);
    this.body.append(formControlName, this.form.controls[formControlName].value);
    console.log(this.form.controls[formControlName].value);
    
  }

  sendFile(): void {

    this.body.forEach(element => {
      console.log({element});
    });

    this._servicio.postInputForm(this.body);
    this._router.navigate(['/resultados']);

  }

}

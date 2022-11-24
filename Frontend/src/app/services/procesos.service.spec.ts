import { TestBed } from '@angular/core/testing';

import { ProcesosService } from './procesos.service';

describe('ProcesosService', () => {
  let service: ProcesosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProcesosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

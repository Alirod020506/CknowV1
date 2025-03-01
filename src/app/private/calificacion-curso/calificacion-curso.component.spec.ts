import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalificacionCursoComponent } from './calificacion-curso.component';

describe('CalificacionCursoComponent', () => {
  let component: CalificacionCursoComponent;
  let fixture: ComponentFixture<CalificacionCursoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalificacionCursoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalificacionCursoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

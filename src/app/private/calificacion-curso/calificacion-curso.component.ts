import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-calificacion-curso',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calificacion-curso.component.html',
  styleUrls: ['./calificacion-curso.component.css'],
})
export class CalificacionCursoComponent implements OnInit {
  @Input() data: any;

  constructor() {}

  ngOnInit() {
    // Los datos ahora se recibirán como entrada
  }

  cerrarVentana() {
    // Este método ya no es necesario para un modal
  }
}

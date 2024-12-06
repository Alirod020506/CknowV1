import { Component, HostListener } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatToolbarModule} from '@angular/material/toolbar';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule, MatIconModule, CommonModule],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.css'
})
export class ToolbarComponent {
  activeSection = '';
  //nueva pantalla
  openLogin() { 
    window.open('login','_blank', 'width=600,height=400,scrollbars=no,resizable=no,location=no,toolbar=no,menubar=no,status=no')}

  // Método para desplazarse a la sección y establecerla como activa
  scrollToSection(sectionId: string): void {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    this.activeSection = sectionId;
  }

  // Escuchar el evento de desplazamiento en la ventana
  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    const sections = ['inicio', 'nosotros', 'servicios', 'metodologia', 'preguntas', 'contacto'];
    for (let section of sections) {
      const element = document.getElementById(section);
      if (element) {
        const rect = element.getBoundingClientRect();
        // Verifica si la sección está en la ventana de visualización
        if (rect.top >= 0 && rect.top < window.innerHeight / 2) {
          this.activeSection = section;
          break;
        }
      }
    }
  }
}

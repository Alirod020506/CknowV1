import { Component } from '@angular/core';
import { FooterComponent } from '../footer/footer.component';
import { ContactoComponent } from '../contacto/contacto.component';
import { PreguntasComponent } from '../preguntas/preguntas.component';
import { ServiciosComponent } from '../servicios/servicios.component';
import { NosotrosComponent } from '../nosotros/nosotros.component';
import { ToolbarComponent } from '../toolbar/toolbar.component';
import { MetodologiaComponent } from '../metodologia/metodologia.component';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HeaderComponent,
    MetodologiaComponent, ToolbarComponent, NosotrosComponent, ServiciosComponent, PreguntasComponent, ContactoComponent, FooterComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

}

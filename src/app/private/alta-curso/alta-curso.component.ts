import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as CryptoJS from 'crypto-js';
import { environment } from '../../environments/environment';
import { PreguntasService } from '../../services/preguntas.service';

interface Especialidad {
  fi_id_especialidad: number;
  fc_descripcion: string;
}

@Component({
  selector: 'app-alta-curso',
  templateUrl: './alta-curso.component.html',
  styleUrls: ['./alta-curso.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class AltaCursoComponent implements OnInit {
  private url = 'questit-ws-core/api/v1/private/manager/interno/empresa/preguntas/listado';
  preguntas: any[] = [];
  mostrarModal = false;
  noPreguntas: string = 'noPreguntas';

  private urls = 'questit-ws-core/api/v1/private/manager/interno/empresa/especialidad/listado';
  
  // Variables del formulario
  especialidad: string = ''; // Se selecciona el ID de la especialidad
  tipo = 'abierta';          // Inicialmente "abierta"
  pregunta = '';             // Texto de la pregunta
  respuestaAbierta = '';     // Respuesta para pregunta abierta
  respuestasCerradas: string[] = ['', '', '', '']; // Opciones para pregunta cerrada
  
  especialidades: Especialidad[] = [];
  // Tipo de pregunta abierta (se obtiene de la primera que coincida, por ejemplo)
  tipoPreguntaAbierta: number | null = null;

  // Variables para el modal de mensaje (éxito o error)
  mostrarModalMensaje = false;
  mensajeModal = '';
  tipoMensajeModal: 'exito' | 'error' = 'exito';

  constructor(private http: HttpClient, private preguntasService: PreguntasService) {}

  ngOnInit(): void {
    this.fetchPreguntas();
    this.fetchEspecialidades();
    console.log('Especialidades en ngOnInit:', this.especialidades);
  }

  fetchPreguntas(): void {
    const accessToken = sessionStorage.getItem('access_token');
    if (!accessToken) {
      console.error('No se encontró el token en sessionStorage.');
      return;
    }
  
    this.http.get(this.url, {
      headers: { Authorization: `Bearer ${accessToken}` },
      responseType: 'text',
    }).subscribe({
      next: (encryptedData: string) => {
        try {
          const decryptedData = this.decrypt(encryptedData);
          if (decryptedData && Array.isArray(decryptedData.resultado)) {
            this.preguntas = decryptedData.resultado.map((pregunta: any) => ({
              ...pregunta,
              mostrarMenu: false,
            }));
            // Si aún no se ha definido el tipo de pregunta abierta, 
            // se toma del primer elemento que cumpla con el criterio.
            if (!this.tipoPreguntaAbierta && this.preguntas.length > 0) {
              // Suponemos que el primer registro corresponde a una pregunta abierta
              this.tipoPreguntaAbierta = this.preguntas[0].fi_id_tipo_pregunta;
            }
          } else {
            console.warn('No se encontraron datos válidos.');
          }
        } catch (error) {
          console.error('Error al desencriptar los datos:', error);
        }
      },
      error: (error) => {
        console.error('Error en la petición:', error);
      },
    });
  }

  fetchEspecialidades(): void {
    const accessToken = sessionStorage.getItem('access_token');
    if (!accessToken) {
      console.error('No se encontró el token en sessionStorage.');
      return;
    }

    this.http.get(this.urls, {
      headers: { Authorization: `Bearer ${accessToken}` },
      responseType: 'text',
    }).subscribe({
      next: (encryptedData: string) => {
        try {
          const decryptedData = this.decrypt(encryptedData);
          if (decryptedData && Array.isArray(decryptedData.resultado)) {
            this.especialidades = decryptedData.resultado;
            console.log('Especialidades:', this.especialidades);
          } else {
            console.warn('No se encontraron datos válidos.');
          }
        } catch (error) {
          console.error('Error al desencriptar los datos:', error);
        }
      },
      error: (error) => {
        console.error('Error en la petición:', error);
      },
    });
  }

  decrypt(data: string): any {
    try {
      const decrypted = CryptoJS.AES.decrypt(
        data,
        CryptoJS.enc.Utf8.parse('$3CR3T_p4$$w0rd_'),
        {
          mode: CryptoJS.mode.ECB,
          padding: CryptoJS.pad.NoPadding,
        }
      ).toString(CryptoJS.enc.Utf8);

      const cleanedResponse = decrypted.trim().replace(/[\x00-\x1F\x7F]/g, '');
      return JSON.parse(cleanedResponse);
    } catch (error) {
      console.error('Error al procesar la respuesta descifrada:', error);
      return null;
    }
  }

  abrirModal(): void {
    this.mostrarModal = true;
    this.limpiarCampos();
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.limpiarCampos();
  }

  onTipoChange(): void {
    if (this.tipo === 'cerrada') {
      this.respuestasCerradas = ['', '', '', ''];
    } else {
      this.respuestaAbierta = '';
    }
  }

  // Función para guardar la pregunta
  guardarPregunta(): void {
    // Validaciones de campos vacíos
    if (this.pregunta.trim() === '') {
      this.mostrarMensaje('error', 'La pregunta no puede estar vacía.');
      return;
    }
    if (this.tipo === 'abierta' && this.respuestaAbierta.trim() === '') {
      this.mostrarMensaje('error', 'Debe ingresar una respuesta para la pregunta abierta.');
      return;
    }
    if (this.tipo === 'cerrada' && this.respuestasCerradas.some(r => r.trim() === '')) {
      this.mostrarMensaje('error', 'Complete todas las opciones de respuesta para la pregunta cerrada.');
      return;
    }
    
    if (this.tipo === 'abierta') {
      if (!this.tipoPreguntaAbierta) {
        this.mostrarMensaje('error', 'No se encontró el tipo de pregunta abierta. Verifica el catálogo.');
        return;
      }
      const payload = {
        // CORRECCIÓN en el nombre de la propiedad:
        fi_id_empresa_especialidad: Number(this.especialidad),
        fi_id_tipo_pregunta: this.tipoPreguntaAbierta, // Se toma automáticamente desde el catálogo
        fc_descripcion_pregunta: this.pregunta,
        respuestas: [
          { fc_respuesta: this.respuestaAbierta }
        ]
      };
      this.enviarRespuesta(payload);
    } else {
      // Aquí podrías implementar la lógica para preguntas cerradas.
      console.log('Guardar pregunta cerrada no implementado.');
      // Ejemplo rápido de uso de mensaje:
      // this.mostrarMensaje('error', 'Funcionalidad de preguntas cerradas pendiente de implementación.');
    }
    
    this.cerrarModal();
  }

  // Función que encripta el payload y lo envía a la API
  enviarRespuesta(respuesta: any): void {
    const url = '/questit-ws-core/api/v1/private/manager/interno/respuesta/pregunta/guardar';
    const payload = respuesta;
    const encryptedPayload = this.encryptData(payload);
    console.log('Payload encriptado:', encryptedPayload);
    
    const accessToken = sessionStorage.getItem('access_token');
    if (!accessToken) {
      console.error('No se encontró el access_token en sessionStorage.');
      return;
    }
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    };
    
    this.http.post(url, encryptedPayload, { headers, responseType: 'text' })
      .subscribe({
        next: (response) => {
          console.log('Respuesta enviada exitosamente:', response);
          // Mostrar mensaje de éxito
          this.mostrarMensaje('exito', '¡Pregunta enviada con éxito!');
        },
        error: (error) => {
          console.error('Error al enviar la respuesta:', error);
          // Mostrar mensaje de error
          this.mostrarMensaje('error', 'Ocurrió un error al enviar la pregunta.');
        }
      });
  }

  // Función para encriptar datos
  encryptData(data: object): string {
    const json = JSON.stringify(data);
    const paddedJson = this.padString(json);
    const key = CryptoJS.enc.Utf8.parse(environment.encryptionKey);
    const encrypted = CryptoJS.AES.encrypt(paddedJson, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.NoPadding
    });
    return encrypted.toString();
  }

  private padString(str: string): string {
    const blockSize = 16;
    const padLength = blockSize - (str.length % blockSize);
    return str + String.fromCharCode(padLength).repeat(padLength);
  }

  limpiarCampos(): void {
    this.especialidad = '';
    this.tipo = 'abierta';
    this.pregunta = '';
    this.respuestaAbierta = '';
    this.respuestasCerradas = ['', '', '', ''];
  }

  // Funciones para el menú de edición/eliminación
  toggleMenu(preguntaId: number): void {
    this.preguntas = this.preguntas.map((pregunta) => ({
      ...pregunta,
      mostrarMenu: pregunta.fi_id_pregunta === preguntaId ? !pregunta.mostrarMenu : false,
    }));
  }

  editarPregunta(preguntaId: number): void {
    console.log('Editar pregunta:', preguntaId);
  }

  eliminarPregunta(preguntaId: number): void {
    console.log('Eliminar pregunta:', preguntaId);
  }

  // Funciones para mostrar/ocultar el modal de mensaje
  mostrarMensaje(tipo: 'exito' | 'error', mensaje: string): void {
    this.tipoMensajeModal = tipo;
    this.mensajeModal = mensaje;
    this.mostrarModalMensaje = true;
  }

  cerrarModalMensaje(): void {
    this.mostrarModalMensaje = false;
  }
}

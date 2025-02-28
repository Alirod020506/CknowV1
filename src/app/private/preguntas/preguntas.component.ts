import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import * as CryptoJS from 'crypto-js';
import { environment } from '../../environments/environment';


@Component({
  selector: 'app-preguntas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './preguntas.component.html',
  styleUrl: './preguntas.component.css'
})
export class PreguntasComponent implements OnInit, OnDestroy{
  fi_id_encuesta!: string;
  fi_id_encuesta_candidato!: string;
  tituloEncuesta: string = 'Cargando...';
  totalPreguntas: number = 0;
  preguntas: any[] = [];
  currentQuestionIndex: number = 0;
  // Ahora selectedAnswer es de tipo any para almacenar el objeto respuesta completo
  selectedAnswer: any = null;
  timeLeft: number = 0;
  timerInterval: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {
    this.fi_id_encuesta = this.route.snapshot.paramMap.get('id')!;
    this.tituloEncuesta = this.route.snapshot.queryParamMap.get('titulo') || 'Encuesta';
    this.totalPreguntas = Number(this.route.snapshot.queryParamMap.get('total')) || 0;
  }

  getProgressPercentage(): number {
    if (this.totalPreguntas === 0) {
      return 0;
    }
    const porcentaje = (this.currentQuestionNumber / this.totalPreguntas) * 100;
    return Math.min(100, porcentaje);
  }
  
  ngOnInit(): void {
    this.cargarPreguntas();
  }

  cargarPreguntas() {
    const url = `/questit-ws-core/api/v1/private/manager/interno/operacion/faltantes/preguntas/listar/${this.fi_id_encuesta}`;
    const accessToken = sessionStorage.getItem('access_token');

    if (!accessToken) {
      console.error('No se encontró el access_token en sessionStorage.');
      return;
    }

    const headers = {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    };

    const body = {};

    this.http.post<string>(url, body, { headers, responseType: 'text' as 'json' }).subscribe({
      next: (encryptedData) => {
        try {
          const decryptedData = this.decrypt(encryptedData);

          if (decryptedData && Array.isArray(decryptedData.resultado)) {
            if (decryptedData.resultado.length > 0 && decryptedData.resultado[0].fi_id_encuesta_candidato) {
              this.fi_id_encuesta_candidato = decryptedData.resultado[0].fi_id_encuesta_candidato;
            }

            this.preguntas = decryptedData.resultado.map((item: any) => {
              const preguntaObj = item.preguntas;
              const descripcion = (preguntaObj.fc_descripcion_pregunta &&
                typeof preguntaObj.fc_descripcion_pregunta === 'string' &&
                preguntaObj.fc_descripcion_pregunta.trim() !== '')
                ? preguntaObj.fc_descripcion_pregunta
                : 'Descripción no disponible';

              // Mapeamos las respuestas usando los nombres de campos requeridos por la API
              const respuestas = Array.isArray(item.respuestas)
                ? item.respuestas.map((r: any) => ({
                    fi_id_respuesta: r.fi_id_respuesta,          // Usamos el campo de la API
                    fc_respuesta: r.fc_respuesta,                  // Texto de la respuesta
                    fb_respuesta: r.fb_respuesta,                  // Valor adicional (si existe)
                    texto: r.fc_respuesta                          // Para mostrar en el template
                  }))
                : [];

              return {
                id: preguntaObj.fi_id_pregunta,
                fi_id_encuesta_pregunta_nivel: preguntaObj.fi_id_encuesta_pregunta_nivel,
                texto: descripcion,
                tiempo: preguntaObj.fi_tiempo || 1,
                tipo: preguntaObj.fi_id_tipo_pregunta || 1,
                respuestas: respuestas
              };
            });

            if (this.preguntas.length > 0) {
              this.startQuestion();
            }
          } else {
            console.warn('No se encontraron datos válidos en el resultado.');
          }
        } catch (error) {
          console.error('Error al procesar la respuesta:', error);
        }
      },
      error: (error) => {
        console.error('Error en la petición:', error);
      }
    });
  }

  startQuestion() {
    const currentQuestion = this.preguntas[this.currentQuestionIndex];
    this.timeLeft = (currentQuestion.tiempo * 60) || 60;
    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      if (this.timeLeft <= 0) {
        // Se envía la respuesta (aunque esté vacía) cuando se agota el tiempo
        this.submitAnswer();
      }
    }, 1000);
  }

  // Actualizamos onAnswerChange para recibir el objeto respuesta
  onAnswerChange(answer: any): void {
    this.selectedAnswer = answer;
  }

  /**
   * Registra y envía la respuesta actual a la API, y luego avanza a la siguiente pregunta.
   */
  submitAnswer() {
    const currentQuestion = this.preguntas[this.currentQuestionIndex];

    const respuestaGuardada = {
      fi_id_encuesta_candidato: this.fi_id_encuesta_candidato,
      fi_id_encuesta_pregunta_nivel: currentQuestion.fi_id_encuesta_pregunta_nivel, // Usamos el campo del mapeo
      fi_id_resuesta: this.selectedAnswer ? this.selectedAnswer.fi_id_respuesta : null,
      fc_respuesta: null,
      fb_respuesta: null
    };

    // Envía la respuesta inmediatamente
    this.enviarRespuesta(respuestaGuardada);

    // Reinicia la respuesta seleccionada y avanza a la siguiente pregunta
    this.selectedAnswer = null;
    this.nextQuestion();
  }

  /**
   * Realiza la petición POST a la API para enviar una respuesta.
   */
  enviarRespuesta(respuesta: any): void {
    const url = 'questit-ws-core/api/v1/private/manager/interno/operacion/privada/encuesta/respuesta';
    // Se envía la respuesta en un arreglo
    const payload = respuesta;

    const encryptedPayload = this.encryptData(payload);
    console.log(encryptedPayload);
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
        },
        error: (error) => {
          console.error('Error al enviar la respuesta:', error);
        }
      });
  }

  nextQuestion() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    this.currentQuestionIndex++;
    if (this.currentQuestionIndex < this.preguntas.length) {
      this.startQuestion();
    } else {
      console.log('Encuesta completada.');
      // Aquí puedes agregar acciones adicionales al finalizar la encuesta
    }
  }

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

  decrypt(data: string): any {
    try {
      const decrypted = CryptoJS.AES.decrypt(
        data,
        CryptoJS.enc.Utf8.parse(environment.encryptionKey),
        { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.NoPadding }
      ).toString(CryptoJS.enc.Utf8);

      console.log('Texto descifrado (crudo):', decrypted);
      const cleanedResponse = decrypted.replace(/[\x00-\x1F\x7F]+/g, '').trim();
      console.log('Texto descifrado limpio:', cleanedResponse);

      if (this.isValidJson(cleanedResponse)) {
        const jsonResponse = JSON.parse(cleanedResponse);
        console.log('JSON parseado:', jsonResponse);
        return jsonResponse;
      } else {
        console.warn('Texto descifrado no es un JSON válido.');
        return null;
      }
    } catch (error) {
      console.error('Error al procesar la respuesta descifrada:', error);
      return null;
    }
  }

  isValidJson(text: string): boolean {
    try {
      JSON.parse(text);
      return true;
    } catch {
      return false;
    }
  }

  get currentQuestionNumber(): number {
    const answered = this.totalPreguntas - this.preguntas.length;
    return answered + this.currentQuestionIndex + 1;
  }

  formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  goBack(): void {
    this.router.navigate(['/home/cursos']);
  }

  ngOnDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }
}

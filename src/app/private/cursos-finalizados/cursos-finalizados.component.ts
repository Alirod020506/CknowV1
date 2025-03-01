import { Component, Input, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, ActivatedRoute, RouterModule } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import * as CryptoJS from 'crypto-js';
import { CalificacionCursoComponent } from '../calificacion-curso/calificacion-curso.component';

@Component({
  selector: 'app-cursos-finalizados',
  standalone: true,
  imports: [CommonModule, RouterModule, CalificacionCursoComponent],
  templateUrl: './cursos-finalizados.component.html',
  styleUrls: ['./cursos-finalizados.component.css'],
})
export class CursosFinalizadosComponent implements OnInit {
  private url2 = 'questit-ws-core/api/v1/private/manager/interno/operacion/consulta/encuestasFecha';
  private urlDetalle = 'questit-ws-core/api/v1/private/manager/interno/operacion/encuesta/calificacionFinal/obtener/65';
  private routerSubscription!: Subscription;
  showCards: boolean = true;
  @Input() titulo: string = '';
  @Input() descripcion: string = '';
  @Input() logo: string = '';
  @Input() nombreComercial: string = '';
  encuestas: Array<any> = [];
  data: any = null;
  nombreUsuario: string = '';
  puestoUsuario: string = '';

  constructor(private http: HttpClient, private router: Router, private activatedRoute: ActivatedRoute) {}

  navegarACalificacionCurso(): void {
    this.router.navigate(['/calificacion-curso']);
  }

  ngOnInit(): void {
    this.fetchTest();
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        const childRoute = this.activatedRoute.firstChild;
        if (childRoute && childRoute.snapshot.routeConfig) {
          this.showCards = childRoute.snapshot.routeConfig.path !== 'calificacion-curso';
        } else {
          this.showCards = true;
        }
      });
  }

  fetchTest(): void {
    const accessToken = sessionStorage.getItem('access_token');
    if (!accessToken) {
      console.error('No se encontró el token en el sessionStorage.');
      return;
    }
    const headers = new HttpHeaders({ Authorization: `Bearer ${accessToken}` });
    this.http.get(this.url2, { headers: headers, responseType: 'text' }).subscribe({
      next: (encryptedData: string) => {
        const parsedData = this.decrypt(encryptedData);
        if (parsedData && parsedData.resultado) {
          this.encuestas = parsedData.resultado
            .filter((encuesta: any) => encuesta.fi_estatus === 1)
            .map((encuesta: any) => ({
              titulo: encuesta.fc_titulo_encuesta,
              descripcion: encuesta.fc_descripcion,
              logo: this.hexToBase64(encuesta.fa_logo),
              nombreComercial: encuesta.fc_nombre_comercial,
            }));
        } else {
          console.warn('No se pudieron procesar los datos descifrados.');
        }
      },
      error: (error) => {
        console.error('Error al obtener datos de la API:', error);
      },
    });
  }

  hexToBase64(hexString: string): string {
    if (!hexString || hexString.trim() === '') {
      return 'logo_java.png';
    }
    const binaryString = hexString
      .match(/.{1,2}/g)
      ?.map(byte => String.fromCharCode(parseInt(byte, 16)))
      .join('') || '';
    return `data:image/png;base64,${btoa(binaryString)}`;
  }

  verCalificacion(encuesta: any): void {
    const accessToken = sessionStorage.getItem('access_token');
    if (!accessToken) {
      console.error('No se encontró el token en el sessionStorage.');
      return;
    }
    const headers = new HttpHeaders({ Authorization: `Bearer ${accessToken}` });
    this.http.get(this.urlDetalle, { headers: headers, responseType: 'text' }).subscribe({
      next: (encryptedData: string) => {
        const parsedData = this.decrypt(encryptedData);
        if (parsedData && parsedData.resultado) {
          this.data = parsedData.resultado;
          this.abrirDialogo();
        } else {
          console.warn('No se pudieron procesar los datos descifrados.');
        }
      },
      error: (error) => {
        console.error('Error al obtener calificaciones de la API:', error);
      },
    });
  }

  abrirDialogo(): void {
    const modal = document.getElementById('calificacionModal');
    if (modal) {
      modal.classList.remove('hidden');
    }
  }

  cerrarDialogo(): void {
    const modal = document.getElementById('calificacionModal');
    if (modal) {
      modal.classList.add('hidden');
    }
  }

  decrypt(data: string): any {
    try {
      const decrypted = CryptoJS.AES.decrypt(data, CryptoJS.enc.Utf8.parse('$3CR3T_p4$$w0rd_'), {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.NoPadding,
      }).toString(CryptoJS.enc.Utf8);
      const cleanedResponse = decrypted.trim().replace(/[\x00-\x1F\x7F]/g, '');
      const jsonResponse = JSON.parse(cleanedResponse);
      return jsonResponse;
    } catch (error) {
      console.error('Error al procesar la respuesta descifrada:', error);
      return null;
    }
  }
}

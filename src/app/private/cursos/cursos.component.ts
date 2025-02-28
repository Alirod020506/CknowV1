import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import * as CryptoJS from 'crypto-js';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { environment } from '../../environments/environment';



@Component({
  selector: 'app-cursos',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cursos.component.html',
  styleUrl: './cursos.component.css'
})
export class CursosComponent implements OnInit, OnDestroy {
  private url = 'questit-ws-core/api/v1/private/manager/interno/operacion/consulta/encuestasFecha';
  encuestas: any[] = []; // Lista de encuestas
  showCards: boolean = true; // Controla la visualización de las cards
  private routerSubscription!: Subscription;

  constructor(
    private http: HttpClient,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.fetchTest();

    // Suscribirse a los eventos del router para saber si hay una ruta hija activa (por ejemplo, 'preguntas/:id')
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        // Se asume que el ActivatedRoute de este componente tiene rutas hijas
        const childRoute = this.activatedRoute.firstChild;
        if (childRoute && childRoute.snapshot.routeConfig) {
          // Si el path de la ruta hija es 'preguntas/:id', se ocultan las cards
          this.showCards = childRoute.snapshot.routeConfig.path !== 'preguntas/:id';
        } else {
          // Si no hay rutas hijas activas, se muestran las cards
          this.showCards = true;
        }
      });
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  fetchTest(): void {
    const accessToken = sessionStorage.getItem('access_token');

    if (!accessToken) {
      console.error('No se encontró el token en el sessionStorage.');
      return;
    }

    this.http.get(this.url, {
      headers: { Authorization: `Bearer ${accessToken}` },
      responseType: 'text' // La respuesta es una cadena cifrada
    }).subscribe({
      next: (encryptedData: string) => {
        try {
          const decryptedData = this.decrypt(encryptedData);
          if (decryptedData && Array.isArray(decryptedData.resultado)) {
            this.encuestas = decryptedData.resultado; // Asignar las encuestas
          } else {
            console.warn('No se encontraron datos válidos.');
          }
        } catch (error) {
          console.error('Error al desencriptar los datos:', error);
        }
      },
      error: (error) => {
        console.error('Error en la petición:', error);
      }
    });
  }

  decrypt(data: string): any {
    try {
      const decrypted = CryptoJS.AES.decrypt(
        data,
        CryptoJS.enc.Utf8.parse(environment.encryptionKey),
        { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.NoPadding }
      ).toString(CryptoJS.enc.Utf8);

      console.log('Texto descifrado:', decrypted);
      const cleanedResponse = decrypted.trim().replace(/[\x00-\x1F\x7F]/g, '');
      console.log('Texto descifrado limpio:', cleanedResponse);
      const jsonResponse = JSON.parse(cleanedResponse);
      console.log('JSON parseado:', jsonResponse);
      return jsonResponse;
    } catch (error) {
      console.error('Error al procesar la respuesta descifrada:', error);
      return null;
    }
  }

  convertHexToBase64(hex: string): string {
    // Convertir la cadena hexadecimal a un Uint8Array (binario)
    const byteArray = new Uint8Array(
      hex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
    );
    // Convertir el Uint8Array a Base64
    const base64String = btoa(String.fromCharCode(...byteArray));
    // Retornar la cadena Base64 con el prefijo adecuado para imágenes
    return `data:image/png;base64,${base64String}`;
  }
}
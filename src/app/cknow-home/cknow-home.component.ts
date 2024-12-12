import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as CryptoJS from 'crypto-js';


@Component({
  selector: 'app-cknow-home',
  standalone: true,
  imports: [],
  templateUrl: './cknow-home.component.html',
  styleUrl: './cknow-home.component.css'
})
export class CknowHomeComponent implements OnInit{

  private url2 = 'questit-ws-core/api/v1/private/manager/interno/candidato/datospersonales';

  constructor(private http: HttpClient, private router: Router) {}
  

  ngOnInit(): void {
      const token = sessionStorage.getItem('access_token');
      if (!token) {
        //Redirige al login si no existe el token
        console.error('Acceso denegado. Redirigiendo al login...');
        this.router.navigate(['/login']);
      } else {
        //Realiza la petición con el token de SessionStorage
        this.fetchEncryptedData(token);
      }
  }

  decrypt(data: string): any {
    try {
      const decrypted = CryptoJS.AES.decrypt(data, CryptoJS.enc.Utf8.parse('$3CR3T_p4$$w0rd_'), {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.NoPadding,
      }).toString(CryptoJS.enc.Utf8);

      console.log('Texto descifrado:', decrypted);

      // Limpiar caracteres no deseados
      const cleanedResponse = decrypted.trim().replace(/[\x00-\x1F\x7F]/g, '');

      // Convertir a JSON
      return JSON.parse(cleanedResponse);
    } catch (error) {
      console.error('Error al procesar la respuesta descifrada:', error);
      return null;
    }
  }

   // Método para hacer la petición
   fetchEncryptedData(token: string): void {
    this.http
      .get(this.url2, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'text', // La respuesta es una cadena (cifrada)
      })
      .subscribe({
        next: (encryptedData: string) => {
          console.log('Datos cifrados recibidos:', encryptedData);

          // Desencripta y parsea la respuesta
          const decryptedData = this.decrypt(encryptedData);
          if (decryptedData) {
            console.log('Datos descifrados y parseados:', decryptedData);
            // Aquí puedes mostrar los datos en una tarjeta o usarlos como quieras
          }
        },
        error: (error) => {
          console.error('Error al obtener datos de la API:', error);
        },
        complete: () => {
          console.log('Petición completada');
        }
      });
  }

}

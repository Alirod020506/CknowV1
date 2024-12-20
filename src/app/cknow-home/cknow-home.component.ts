import { NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import * as CryptoJS from 'crypto-js';
import { CardCursoComponent } from '../card-curso/card-curso.component';


@Component({
  selector: 'app-cknow-home',
  standalone: true,
  imports: [NgIf, RouterModule],
  templateUrl: './cknow-home.component.html',
  styleUrl: './cknow-home.component.css'
})
export class CknowHomeComponent implements OnInit{
  //menú desplegable
  menuOpen = false; 
  toggleMenu(): void { 
    this.menuOpen = !this.menuOpen; 
  }

  private url2 = 'questit-ws-core/api/v1/private/manager/interno/candidato/datospersonales';
  nombreUsuario: string = 'Nombre Usuario';
  puestoUsuario: string = 'Puesto en la Empresa'; // Valor predeterminado o extraído del API
  mostrarModal = false; // Controla la visibilidad del modal



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
          /*const decryptedData = this.decrypt(encryptedData);
          if (decryptedData) {
            console.log('Datos descifrados y parseados:', decryptedData);
            // Aquí puedes mostrar los datos en una tarjeta o usarlos como quieras

            const resultado = JSON.parse(decryptedData).resultado;
            this.nombreUsuario = `${resultado.fcNombre} ${resultado.fcPrimerApellido} ${resultado.fcSegundoApellido}`;
            this.puestoUsuario = resultado.puesto || 'Puesto en la Empresa'; // Ajusta según los datos que recibas
          }*/
            const parsedData = this.decrypt(encryptedData);
            if (parsedData && parsedData.resultado) {
              const resultado = parsedData.resultado;
              console.log('Resultado:', resultado);
    
              // Combina los datos del usuario
              this.nombreUsuario = `${resultado.fcNombre || 'Usuario'} ${resultado.fcPrimerApellido || ''} ${resultado.fcSegundoApellido || ''}`.trim();
            } else {
              console.warn('No se pudieron procesar los datos descifrados.');
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
      console.log('Texto descifrado limpio:', cleanedResponse);

      //return JSON.parse(cleanedResponse);
        // Convertir a JSON
      const jsonResponse = JSON.parse(cleanedResponse);
      console.log('JSON parseado:', jsonResponse);

      return jsonResponse;
      
    } catch (error) {
      console.error('Error al procesar la respuesta descifrada:', error);
      return null;
    }
  }

   // Método para abrir el modal
   abrirVentanaEmergente() {
    this.mostrarModal = true;
  }

  // Método para cerrar el modal sin hacer nada
  cerrarVentanaEmergente() {
    this.mostrarModal = false;
  }

  // Método para cerrar sesión y redirigir al login
  cerrarSesion() {
    // Eliminar el token del almacenamiento
    localStorage.removeItem('access_token');
    sessionStorage.removeItem('access_token');

    // Redirigir al login
    this.router.navigate(['/login']);

    // Cerrar el modal
    this.mostrarModal = false;
  }


}

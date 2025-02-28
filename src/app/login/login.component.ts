import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import * as CryptoJS from 'crypto-js';
import { environment } from '../environments/environment'; // Importa el archivo de entorno
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule, ReactiveFormsModule],
  styleUrls: ['./login.component.css'],
})

export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private httpService: AuthService 
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(5)]],
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const formData = this.loginForm.value;
      this.httpService.auth(formData.email, formData.password)
      .subscribe({
        next: (data) => {
          // Respuesta descifrada
          console.log(data);
          // Proceso de desencripción usando la clave de entorno
          const response = this.decrypt(data);
          if (response && response.access_token) {
            // Guarda el access_token en sessionStorage
            sessionStorage.setItem('access_token', response.access_token);
            console.log('Access token guardado:', response.access_token);
          } else {
            this.errorMessage = 'Error al procesar el token de acceso.';
          }
          console.log(response);
          this.router.navigate(['/home']); // Redirigir a la página protegida
        },
        error: (err) => {
          // Manejo de error
          if (err.status === 400) {
            this.errorMessage = 'Correo o contraseña incorrectos.';
            this.loginForm.reset();
          } else {
            this.errorMessage = 'Ocurrió un error inesperado. Revisa los campos e intenta nuevamente.';
          }
        },
      });
    } else {
      this.errorMessage = 'Por favor, completa todos los campos correctamente.';
    }
  }

  decrypt(data: string): any {
    try {

      /*
      Ali se modifico lo que es Cambiar la cadena a un enviroment Se creo lo ques es un archivo de configuración llamado environment.ts
      */

      // Desencripta la cadena usando la clave de entorno
      const decrypted = CryptoJS.AES.decrypt(data, CryptoJS.enc.Utf8.parse(environment.encryptionKey), {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.NoPadding,
      }).toString(CryptoJS.enc.Utf8);
    
      console.log('Texto descifrado:', decrypted);  // Imprime el resultado descifrado
    
      // Elimina posibles caracteres no deseados al final y al inicio
      const cleanedResponse = decrypted.trim().replace(/[\x00-\x1F\x7F]/g, '');
    
      // Intenta parsear la cadena descifrada a JSON
      const jsonResponse = JSON.parse(cleanedResponse);
      return jsonResponse;
    
    } catch (error) {
      console.error('Error al procesar la respuesta descifrada:', error);
      return null;
    }
  }
}
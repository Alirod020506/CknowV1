import { CommonModule } from '@angular/common'; // Importar CommonModule
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'; // Importar FormsModule aquí
import { Router, RouterModule } from '@angular/router'; // Importar RouterModule aquí
import { AuthService } from '../services/auth.service';
import * as CryptoJS from 'crypto-js';


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
      .subscribe({next: (data) =>{
        //Respuesta descifrada
        console.log(data);
        //Proceso de desencripción
        const response = this.decrypt(data)
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
        //Manejo de error
        if (err.status === 400) {
          //Credenciales incorrectas
          this.errorMessage = 'Correo o contraseña incorrectos.';

          // Limpia los campos del formulario
          this.loginForm.reset();
        } else {
          //Error genérico
          this.errorMessage='Ocurrió un error indesperado. Revisa los campos e intenta nuevamente.'
        }
      },
    });

      // Simular lógica de autenticación
      /*if (formData.email === 'emanuel@gmail.com' && formData.password === '12345678') {
        const token = 'fake-jwt-token'; // Token simulado

        // Guardar token en localStorage
        sessionStorage.setItem('authToken', token);
        sessionStorage.setItem('userData', JSON.stringify(formData)); // Opcional: guardar datos del usuario

        // Redirigir al home
        alert('Inicio de sesión exitoso.');*/

      /*  this.router.navigate(['/home']); // Cambia '/home' por la ruta deseada
      } else {
        this.errorMessage = 'Credenciales incorrectas. Inténtalo de nuevo.';
}*/
    } else {
      this.errorMessage = 'Por favor, completa todos los campos correctamente.';
    }
  }

  /*decrypt(data:string){
    // Desencriptar el mensaje en AES
    //Cambiar la cadena a un enviroment
    const decrypted = CryptoJS.AES.decrypt(data, CryptoJS.enc.Utf8.parse('$3CR3T_p4$$w0rd_'), {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.NoPadding,
    });
     
    // Convertir de texto plano
    return decrypted.toString(CryptoJS.enc.Utf8);   
  }*/
    decrypt(data: string): any {
      try {
        // Desencripta la cadena
        //Cambiar la cadena a un enviroment
        const decrypted = CryptoJS.AES.decrypt(data, CryptoJS.enc.Utf8.parse('$3CR3T_p4$$w0rd_'), {
          mode: CryptoJS.mode.ECB,
          padding: CryptoJS.pad.NoPadding,
        }).toString(CryptoJS.enc.Utf8);
    
        console.log('Texto descifrado:', decrypted);  // Imprime el resultado descifrado
    
        // Elimina posibles caracteres no deseados al final y al inicio
        const cleanedResponse = decrypted.trim().replace(/[\x00-\x1F\x7F]/g, '');  // Elimina caracteres de control y no imprimibles
    
        // Intenta parsear la cadena descifrada a JSON
        const jsonResponse = JSON.parse(cleanedResponse);
        return jsonResponse;
    
      } catch (error) {
        console.error('Error al procesar la respuesta descifrada:', error);
        return null;
      }
    }

}

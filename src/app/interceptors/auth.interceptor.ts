
import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../environments/environment'; // Importa el archivo de entorno

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  let headers = {};

  if (req.url.includes('oauth/token')) {

    /*
      Ali se modifico lo que es Cambiar la cadena a un enviroment Se creo lo ques es un archivo de configuración llamado environment.ts
      */
    headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${environment.basicAuthKey}`,  // Usa la clave de entorno
      'Accept': '*/*',
    };
  } else if (req.url.includes('api/v1/private/manager/interno/candidato/datospersonales')) {
    headers = {
      Authorization: `Bearer ${sessionStorage.getItem('access_token') || ''}`,
      'Content-Type': 'application/json',
    };
  }

  // Clona la solicitud con los encabezados correspondientes
  const reqWithHeader = req.clone({ setHeaders: headers });

  return next(reqWithHeader);
};

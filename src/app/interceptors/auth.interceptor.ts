import { HttpInterceptorFn, HttpHeaders } from '@angular/common/http';
 
export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  /*
  const headers = new HttpHeaders({
    'Content-Type': 'application/x-www-form-urlencoded',
    'Authorization': 'Basic cXVlc3RJdEFwcDpxdWVzdEl0QXBw',
    'Accept': '*//*',
    'responseType': 'text'
    
  })
 
  const reqWithHeader = req.clone({
    headers: headers
  })
  
  return next(reqWithHeader);
 */
    // Define los encabezados para cada URL
    let headers = {};

    if (req.url.includes('oauth/token')) {
      headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        //Transformar a un enviroment
        'Authorization': 'Basic cXVlc3RJdEFwcDpxdWVzdEl0QXBw',
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
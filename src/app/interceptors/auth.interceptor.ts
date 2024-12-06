import { HttpInterceptorFn, HttpHeaders } from '@angular/common/http';
 
export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const headers = new HttpHeaders({
    'Content-Type': 'application/x-www-form-urlencoded',
    'Authorization': 'Basic cXVlc3RJdEFwcDpxdWVzdEl0QXBw',
    'Accept': '*/*',
    'responseType': 'text'
    
  })
 
  const reqWithHeader = req.clone({
    headers: headers
  })
  
  return next(reqWithHeader);
 
};  

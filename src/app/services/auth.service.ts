import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient);
  //private url = "http://74.208.105.127/questit-ws-core/oauth/token"
  private url = "questit-ws-core/oauth/token" //Descomentar cuando sea por proxy
  private url2 = "questit-ws-core/api/v1/private/manager/interno/candidato/datospersonales"


  constructor() { }

  /*auth(email:string, password:string){
    let data = `username=${email}&password=${password}&grant_type=password`
    return this.http.post(this.url, data, {responseType: "text"})
  }
    */

  auth(email: string, password: string): Observable<string> {
    const data = `username=${email}&password=${password}&grant_type=password`;
    return this.http.post(this.url, data, { responseType: 'text' }).pipe(
      catchError((error) => {
        console.error('Error en la solicitud:', error);
        return throwError(() => error); // Propaga el error al componente
      })
    );
  }

}

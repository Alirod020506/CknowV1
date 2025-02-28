import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataServiceService {
  private http = inject(HttpClient);
    //private url = "http://74.208.105.127/questit-ws-core/api/v1/private/manager/interno/candidato/datospersonales"
  private url = 'questit-ws-core/api/v1/private/manager/interno/candidato/datospersonales';

  constructor() {}

  getDatosPersonales(): Observable<any> {
    return this.http.get(this.url).pipe(
      catchError((error) => {
        console.error('Error al obtener datos personales:', error);
        return throwError(() => error); // Propaga el error al componente
      })
    );
  }
}

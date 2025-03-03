import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PreguntasService {
  [x: string]: any;
  private http = inject(HttpClient);
  private url = 'questit-ws-core/api/v1/private/manager/interno/empresa/preguntas/listado';
  private urls = 'questit-ws-core/api/v1/private/manager/interno/empresa/especialidad/listado';

  
  constructor() { }

  getPreguntas(accessToken: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });

    return this.http.get(this.url, { headers }).pipe(
      catchError((error) => {
        console.error('Error al obtener las preguntas:', error);
        return throwError(() => error);
      })
    );
  }
  
  getEspecialidades(accessToken: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });

    return this.http.get(this.urls, { headers }).pipe(
      catchError((error) => {
        console.error('Error al obtener las especialidades:', error);
        return throwError(() => error);
      })
    );
  }
}

//Cambio para guardar


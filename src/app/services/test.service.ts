import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TestService {
  private http = inject(HttpClient);
  private url = 'questit-ws-core/api/v1/private/manager/interno/operacion/consulta/encuestasFecha';

  constructor() { }

  getTest(accessToken: string): Observable<any> {
    const headers = new HttpHeaders ({
      Authorization: `Bearer ${accessToken}`,
    })

    return this.http.get(this.url).pipe(
      catchError((error) => {
        console.error('Error al obtener el test:', error);
        return throwError(() => error);
      })
    )
  }
}

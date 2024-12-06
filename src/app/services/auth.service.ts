import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient);
  //private url = "http://74.208.105.127/questit-ws-core/oauth/token"
  private url = "questit-ws-core/oauth/token" //Descomentar cuando sea por proxy


  constructor() { }

  auth(email:string, password:string){
    let data = `username=${email}&password=${password}&grant_type=password`
    return this.http.post(this.url, data, {responseType: "text"})
  }

}

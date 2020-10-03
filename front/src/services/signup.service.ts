import config from 'src/config.json';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SignupService {

  url = `http://${config.http.ip}:${config.http.port}/api/signup`;
  token: string;

  constructor(private httpClient: HttpClient) {
  }

  signup(email, user, password) {
    return this.httpClient.post<any[]>(this.url, {
        user: user,
        password: password,
        email: email
    }, {
        headers: new HttpHeaders({
            'Content-Type': 'application/json'
        })
    });
  }
}

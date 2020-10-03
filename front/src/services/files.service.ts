import config from 'src/config.json';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class FilesService {

  baseUrl = `http://${config.http.ip}:${config.http.port}/api/files`;
  downloadUrl = `http://${config.http.ip}:${config.http.port}/api/download`;
  constructor(private httpClient: HttpClient) { }

  listFiles(token: string, path?: string) {
    if (!path) {
      return this.httpClient.get<any[]>(this.baseUrl, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        })
      });
    }else{
      return this.httpClient.get<any[]>(`${this.baseUrl}/${path}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        })
      });
    }
  }

  listFileDetails(token: string, filename: string) {
    return this.httpClient.get<any[]>(`http://${config.http.ip}:${config.http.port}/api/file/${filename}`, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      })
    });
  }

  downloadFile(token: string, path: string) {
    return this.httpClient.get<any[]>(`${this.downloadUrl}/${path}`, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      })
    });
  }

  removeFile(token: string, path: string) {
    return this.httpClient.delete<any[]>(`${this.baseUrl}/${path}`, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      })
    });
  }

  createFolder(token: string, path: string) {
    return this.httpClient.post<any[]>(`${this.baseUrl}/${path}`, {
      path
    }, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      })
    });
  }
}

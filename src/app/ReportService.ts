import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  // Cambia la porta se il tuo BE non gira sulla 8080
  private baseUrl = 'http://localhost:8080'; 

  constructor(private http: HttpClient) { }

  // --- METODO DOWNLOAD (GET) ---
  downloadReport(year: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/get/${year}`, {
      // FONDAMENTALE: Dice ad Angular di non aspettarsi JSON ma dati binari
      responseType: 'blob' 
    });
  }

  // --- METODO UPLOAD (POST) ---
  uploadReport(file: File, year: number): Observable<string> {
    const formData: FormData = new FormData();
    
    // Le chiavi "file" e "year" devono coincidere con i @RequestParam del Java
    formData.append('file', file);
    formData.append('year', year.toString());

    return this.http.post(`${this.baseUrl}/upload`, formData, {
      // Impostiamo responseType a 'text' perché il tuo BE restituisce una stringa semplice, non un JSON
      responseType: 'text' 
    });
  }
}
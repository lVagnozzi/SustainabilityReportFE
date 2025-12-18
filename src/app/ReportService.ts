import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const baseUrl = 'http://localhost:8080/api/reports';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  constructor(private http: HttpClient) { }

  // --- METODO DOWNLOAD (GET) ---
  downloadReport(year: number): Observable<Blob> {
    return this.http.get(baseUrl + `/get/${year}`, {
      responseType: 'blob' 
    });
  }

  // --- METODO UPLOAD (POST) ---
  uploadReport(file: File, year: number): Observable<string> {
    const formData: FormData = new FormData();
    
    // Le chiavi "file" e "year" devono coincidere con i @RequestParam del Java
    formData.append('file', file);
    formData.append('year', year.toString());

    return this.http.post(baseUrl + `/upload`, formData, {
      responseType: 'text' 
    });
  }

  getAvailableYears(): Observable<number[]> {
    // Assicurati che nel backend esista questo endpoint @GetMapping("/list")
    return this.http.get<number[]>(baseUrl + `/list`);
  }
}
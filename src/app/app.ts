import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ReportService } from './ReportService';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('SustainabilityReportFE');

  selectedFile: File | null = null;
  yearToUpload: number = 2024; // Default
  yearToDownload: number = 2024;
  message: string = '';

  constructor(private reportService: ReportService) {}

  // Gestisce la selezione del file dall'input HTML
  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  // --- AZIONE UPLOAD ---
  onUpload() {
    if (!this.selectedFile) {
      this.message = "Seleziona prima un file!";
      return;
    }

    this.reportService.uploadReport(this.selectedFile, this.yearToUpload)
      .subscribe({
        next: (responseMsg) => {
          this.message = "Successo: " + responseMsg;
          this.selectedFile = null; // Reset
        },
        error: (err) => {
          console.error(err);
          this.message = "Errore durante l'upload.";
        }
      });
  }

  // --- AZIONE DOWNLOAD ---
  onDownload() {
    this.reportService.downloadReport(this.yearToDownload)
      .subscribe({
        next: (blob: Blob) => {
          // Trucco per scaricare il file dal browser
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          // Nome del file suggerito
          a.download = `Eni_Sustainability_Report-${this.yearToDownload}.pdf`; 
          document.body.appendChild(a);
          a.click(); // Simula il click
          document.body.removeChild(a); // Pulisce il DOM
          window.URL.revokeObjectURL(url); // Libera memoria
          this.message = "Download avviato!";
        },
        error: (err) => {
          console.error(err);
          if (err.status === 404) {
            this.message = `Report del ${this.yearToDownload} non trovato.`;
          } else {
            this.message = "Errore durante il download.";
          }
        }
      });
  }

}

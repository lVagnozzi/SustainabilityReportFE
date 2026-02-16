import { Component, signal, ChangeDetectorRef } from '@angular/core';
import { ReportService } from './ReportService';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

const baseUrl = 'http://localhost:8080/api/reports';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})

export class App {

  protected readonly title = signal('SustainabilityReportFE');


  selectedFile: File | null = null;
  yearToUpload: number = 2024; // Default
  yearToDownload: number = 2024;
  message: string = '';
  isModalOpen: boolean = false;
  isDownloadModalOpen: boolean = false;
  archiveYear: number = 2023;
  availableYears = signal<number[]>([]);

  constructor(
    private cdr: ChangeDetectorRef,
    private reportService: ReportService) { }

  // Gestisce la selezione del file dall'input HTML
  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  openModal() {
    this.isModalOpen = true;
    this.message = '';
  }
  closeModal() {
    this.isModalOpen = false;
    this.selectedFile = null;
    this.message = '';
  }

  // Aggiungo una variabile per gestire il loading
isLoading: boolean = false;

// app.ts

openDownloadModal() {
    this.isDownloadModalOpen = true;

    this.reportService.getAvailableYears().subscribe({
        next: (years) => {
            const filtered = years.filter(y => y !== 2024);
            // Aggiornare un signal notifica istantaneamente la UI
            this.availableYears.set([...new Set(filtered)]);

            if (this.availableYears().length > 0) {
                this.archiveYear = this.availableYears()[0];
            }
        }
    });
}

  // 2. CHIUDE IL MODAL ARCHIVIO
  closeDownloadModal() {
    this.isDownloadModalOpen = false;
    this.message = '';
  }



  // 3. SCARICA IL REPORT DALL'ARCHIVIO
  onDownloadArchive() {
    this.reportService.downloadReport(this.archiveYear).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Eni_Sustainability_Report-${this.archiveYear}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        this.message = `Download del ${this.archiveYear} avviato!`;
        this.closeDownloadModal(); // Chiude il modal dopo il click
      },
      error: (err) => {
        console.error(err);
        this.message = `Errore: Report del ${this.archiveYear} non disponibile.`;
      }
    });
  }

  // --- AZIONE UPLOAD ---
// --- AZIONE UPLOAD ---
onUpload() {
  if (!this.selectedFile) {
    this.message = "Seleziona prima un file!";
    alert("Per favore, seleziona un file prima di procedere."); // Optional: alert for validation
    return;
  }

  this.reportService.uploadReport(this.selectedFile, this.yearToUpload)
    .subscribe({
      next: (responseMsg) => {
        this.message = "Successo: " + responseMsg;
        alert(`Caricamento completato con successo per l'anno ${this.yearToUpload}!`);
        this.selectedFile = null;


      },
      error: (err) => {
        console.error(err);
        this.message = "Errore durante l'upload.";
        alert("Si è verificato un errore durante il caricamento del file.");
      }
    });
    this.closeModal();
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

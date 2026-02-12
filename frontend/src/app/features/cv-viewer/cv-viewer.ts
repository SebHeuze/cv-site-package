import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-cv-viewer',
  imports: [CommonModule],
  templateUrl: './cv-viewer.html',
  styleUrl: './cv-viewer.scss',
})
export class CvViewer {
  cvPath = 'CV_Sébastien_HEUZE.pdf';
  safeCvUrl: SafeResourceUrl;

  constructor(private sanitizer: DomSanitizer) {
    this.safeCvUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.cvPath);
  }

  downloadCV(): void {
    const link = document.createElement('a');
    link.href = this.cvPath;
    link.download = 'CV_Sébastien_HEUZE.pdf';
    link.click();
  }
}

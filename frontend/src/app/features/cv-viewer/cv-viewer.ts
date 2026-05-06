import { Component, Input, OnInit } from '@angular/core';

import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-cv-viewer',
  imports: [],
  templateUrl: './cv-viewer.html',
  styleUrl: './cv-viewer.scss',
})
export class CvViewer implements OnInit {
  @Input() language: 'fr' | 'en' = 'fr';

  cvPath = '';
  safeCvUrl!: SafeResourceUrl;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.cvPath = this.language === 'en'
      ? 'Resume_Sébastien_HEUZE.pdf'
      : 'CV_Sébastien_HEUZE.pdf';
    this.safeCvUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.cvPath);
  }

  downloadCV(): void {
    const link = document.createElement('a');
    link.href = this.cvPath;
    link.download = this.cvPath;
    link.click();
  }
}

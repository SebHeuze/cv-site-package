import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-desktop-icon',
  imports: [CommonModule],
  templateUrl: './desktop-icon.html',
  styleUrl: './desktop-icon.scss',
})
export class DesktopIcon {
  @Input() icon: string = '';
  @Input() label: string = '';
}

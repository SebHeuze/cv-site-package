import { Component, Input } from '@angular/core';


@Component({
  selector: 'app-desktop-icon',
  imports: [],
  templateUrl: './desktop-icon.html',
  styleUrl: './desktop-icon.scss',
})
export class DesktopIcon {
  @Input() icon: string = '';
  @Input() label: string = '';
}

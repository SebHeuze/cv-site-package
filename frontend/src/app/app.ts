import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Desktop } from './features/desktop/desktop';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Desktop],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  title = 'cv-site';
}

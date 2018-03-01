import { Component } from '@angular/core';

declare var _user;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Wifi';
  user: string;

  constructor() {
    this.user = _user.displayName;
  }
}

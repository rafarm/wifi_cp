import { Component } from '@angular/core';

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.css'],
})
export class ContentComponent {
  tabs = [
    { link: 'schedules', label: 'Autoritzacions' },
    { link: 'groups', label: 'Agrupaments' },
  ];
}

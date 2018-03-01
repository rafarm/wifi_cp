import { Component, OnInit } from '@angular/core';

@Component({
    template: ''
})

export class LogoutComponent implements OnInit {

  ngOnInit() {
    window.location.href = "logout";
  }

}

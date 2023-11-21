// header.component.ts

import { Component, OnInit } from '@angular/core';
import { BackEndService } from '../back-end.service';
import { PostService } from '../post.service';
import { DarkModeService } from '../dark-mode.service'; // Import the DarkModeService

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  constructor(private backendservice: BackEndService, private darkModeService: DarkModeService) {} 

  ngOnInit(): void {
    this.backendservice.fetchData();
  }

  onFetch() {
    this.backendservice.fetchData();
  }

  toggleDarkMode() {
    this.darkModeService.toggleDarkMode();
  }

  isDarkModeEnabled() {
    return this.darkModeService.isDarkModeEnabled();
  }
}

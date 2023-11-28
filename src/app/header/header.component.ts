// header.component.ts

import { Component, OnInit } from '@angular/core';
import { BackEndService } from '../back-end.service';
import { PostService } from '../post.service';
import { DarkModeService } from '../dark-mode.service'; // Import the DarkModeService
import { Post } from '../post.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  searchTerm: string = '';
  dropdownOpen: boolean = false;
  notifications: string[] = [];

  constructor(private backendservice: BackEndService, private postService: PostService, private darkModeService: DarkModeService) {} 

  ngOnInit(): void {
    this.backendservice.fetchData();
    this.postService.notificationCreated.subscribe((notification: {title: string, date: string, time: string}) => { // Subscribe to the notificationCreated event
      this.onNewPostCreated(notification); // Call onNewPostCreated when a new notification is created
    });
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

  onSearch(value: string) {
    console.log('Search:', value);
    // Implement your search logic here
  }
  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  onNewPostCreated(notification: {title: string, date: string, time: string}) {
    
    this.notifications.push(`${notification.title} on ${notification.date} at ${notification.time}`);
  }

  openRecycleBinModal() {
    // Code to open the recycle bin modal
  }
  
  closeRecycleBinModal() {
    // Code to close the recycle bin modal
  }
  

}
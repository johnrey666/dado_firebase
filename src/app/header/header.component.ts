import { Component, OnInit } from '@angular/core';
import { BackEndService } from '../back-end.service';
import { PostService } from '../post.service';
import { DarkModeService } from '../dark-mode.service'; // Import the DarkModeService
import { Post } from '../post.model';
import { ViewChild, ElementRef } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  searchTerm: string = '';
  searchSubject: Subject<string> = new Subject();
  dropdownOpen: boolean = false;
  notifications: string[] = [];
  @ViewChild('recycleBinModal') recycleBinModal!: ElementRef;
  user$ = this.authService.user$;
  deletedPosts: Post[] = []; 
  listOfPost: any;
  searchKeyword: string;

  

  constructor(private backendservice: BackEndService, private postService: PostService, private darkModeService: DarkModeService, private authService: AuthService, private router: Router) {this.searchKeyword = '';} 

  ngOnInit(): void {
    this.backendservice.fetchData();
    this.postService.notificationCreated.subscribe((notification: {title: string, date: string, time: string}) => { // Subscribe to the notificationCreated event
      this.onNewPostCreated(notification);
    });
    this.postService.listChangedEvent.subscribe((posts: Post[]) => {
      this.deletedPosts = posts.filter(post => post.deleted);
    });  
  
    // Subscribe to the searchSubject here
  
  }
  
  searchPosts() {
    this.postService.searchPosts(this.searchKeyword);
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



  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  onNewPostCreated(notification: {title: string, date: string, time: string}) {
    this.notifications.push(`${notification.title} on ${notification.date} at ${notification.time}`);
  }

  openRecycleBinModal() {
    this.recycleBinModal.nativeElement.style.display = 'block';
  }
  
  closeRecycleBinModal() {
    this.recycleBinModal.nativeElement.style.display = 'none';
  }
  
  logout() {
    this.authService.signOut().then(() => {
      this.router.navigate(['/login']);
    });
  }

  restorePost(index: number) {
    this.postService.restorePost(index);
  }
  
  permanentlyDeletePost(index: number) {
    const post = this.deletedPosts[index];
    const postIndex = this.postService.getPost().indexOf(post);
    this.postService.permanentlyDeletePost(postIndex);
  }


}
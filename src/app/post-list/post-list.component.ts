import { Component, OnInit } from '@angular/core';
import { Post } from '../post.model';
import { PostService } from '../post.service';
import { BackEndService } from '../back-end.service';
import { AuthService, AppUser } from '../auth.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Observable, finalize } from 'rxjs';  
import { StoryService } from '../story.service';
import { map } from 'rxjs/operators'
import { of } from 'rxjs';
import { catchError, take } from 'rxjs/operators';
import $ from 'jquery';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit {
  listOfPosts: Post[] = [];
  searchResults: Post[] = [];
  user: any;
  users: AppUser[] = [];
  currentUser: any;
  selectedUserStories: string[] = []; // Change this to an array
  currentStoryIndex: number = 0;

  constructor(
    private postService: PostService,
    private backEndService: BackEndService,
    private authService: AuthService,
    private storage: AngularFireStorage,
    private storyService: StoryService
  ) { 
    this.currentUser = this.authService.getCurrentUser(); 
  }

  ngOnInit(): void {
    this.authService.getUsers().subscribe(users => {
      this.users = users;
  
      this.users.forEach(user => {
        this.userHasStory(user).subscribe(hasStory => {
          user.hasStory = hasStory;
        });
      });
    });
  
    this.backEndService.fetchData().subscribe((posts: Post[])=> {
      this.listOfPosts = posts;
    });
  
    this.postService.listChangedEvent.subscribe((posts: Post[]) => {
      this.listOfPosts = posts;
    });
  }

  onFileSelected(event: Event, currentUser: any): void {
    const element = event.target as HTMLInputElement;
    const file = element.files ? element.files[0] : null;
    if (file) {
      const filePath = `images/${new Date().getTime()}_${file.name}`;
      const fileRef = this.storage.ref(filePath);
      const task = this.storage.upload(filePath, file);
  
      task.percentageChanges().subscribe((percentage) => {
        console.log(percentage);
      });
  
      task.snapshotChanges().pipe(
        finalize(() => fileRef.getDownloadURL().subscribe((url) => {
          console.log(url);
          const storyData = { userId: currentUser.uid };
          this.storyService.createStory(storyData, url);        
        }))
      ).subscribe();
    }
  }

  userHasStory(user: any): Observable<boolean> {
    return this.storyService.getStoriesByUser(user.uid).pipe(
      map(stories => {
        console.log('User:', user.email, 'Stories:', stories);
        return stories.length > 0;
      }),
      catchError(error => {
        console.error('Error in userHasStory:', error);
        return of(false);
      }),
      take(1)
    );
  }

  openModal(user: AppUser): void {
    this.storyService.getStoriesByUser(user.uid).subscribe(stories => {
        if (stories.length > 0) {
            this.selectedUserStories = stories.map(story => story.photoURL);
            this.currentStoryIndex = 0;
        } else {
            this.selectedUserStories = ['No story available for this user.'];
        }
        (document.getElementById('myModal') as any).style.display = 'block';
    });
  }

  closeModal(): void {
    (document.getElementById('myModal') as any).style.display = 'none';
  }

  nextStory(): void {
    if (this.currentStoryIndex < this.selectedUserStories.length - 1) {
      this.currentStoryIndex++;
    }
  }

  previousStory(): void {
    if (this.currentStoryIndex > 0) {
      this.currentStoryIndex--;
    }
  }
}
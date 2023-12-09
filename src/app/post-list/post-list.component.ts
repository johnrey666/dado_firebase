import { Component, OnInit } from '@angular/core';
import { Post } from '../post.model';
import { PostService } from '../post.service';
import { BackEndService } from '../back-end.service';
import { AuthService, AppUser } from '../auth.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Observable, finalize } from 'rxjs';  
import { StoryService } from '../story.service';
import { map } from 'rxjs/operators'

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit {
  listOfPosts: Post[] = [];
  searchResults: Post[] = [];
  user: any;
  users: AppUser[] = []; // Declare users array

  constructor(
    private postService: PostService,
    private backEndService: BackEndService,
    private authService: AuthService,
    private storage: AngularFireStorage,
    private storyService: StoryService
  ) { }

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      this.user = user;
      if (user) {
        // Fetch the list of friends for the current user
        this.authService.getFriends(user.uid).subscribe(friends => {
          // Fetch the posts made by the friends
          this.postService.getPostsByUsers(friends).subscribe(posts => {
            this.listOfPosts = posts;
          });
        });
      }
    });

    this.backEndService.fetchData().subscribe((posts: Post[])=> {
      this.listOfPosts = posts;
    });

    // Subscribe to the listChangedEvent
    this.postService.listChangedEvent.subscribe((posts: Post[]) => {
      this.listOfPosts = posts;
    });

    this.listOfPosts = this.postService.getPost();
    this.backEndService.fetchData().subscribe((posts: Post[])=> {
      this.listOfPosts = posts;
    });

    // Subscribe to the listChangedEvent
    this.postService.listChangedEvent.subscribe((posts: Post[]) => {
      this.listOfPosts = posts;
    });

    // Subscribe to getUsers() and assign the result to users
    this.authService.getUsers().subscribe(users => {
      this.users = users;
    });
  }


  onFileSelected(event: Event) {
    console.log('User:', this.user); // Add this line to log the user object
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files && inputElement.files.length > 0) {
      const file: File = inputElement.files[0];
  
      if (file && this.user && this.user._delegate.uid) { // Check that user and user._delegate.uid are defined
        const filePath = `images/${new Date().getTime()}_${file.name}`;
        const fileRef = this.storage.ref(filePath);
        const task = this.storage.upload(filePath, file);
  
        // observe percentage changes
        task.percentageChanges().subscribe((percentage) => {
          console.log(percentage);
        });
  
        // get notified when the download URL is available
        task.snapshotChanges().pipe(
          finalize(() => fileRef.getDownloadURL().subscribe((url) => {
            console.log(url);
            // Create a story with the download URL
            const storyData = { userId: this.user._delegate.uid }; // Add additional story data as needed
            this.storyService.createStory(storyData, url);
          }))
        ).subscribe();
      }
    }
  }

  userHasStory(user: any): Observable<boolean> {
    return this.storyService.getStoriesByUser(user.uid).pipe(
      map(stories => {
        console.log('User:', user.uid, 'Stories:', stories);
        return stories.length > 0;
      })
    );
  }
}
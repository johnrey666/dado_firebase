import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Post } from '../post.model';
import { PostService } from '../post.service';
import { BackEndService } from '../back-end.service';
import { AuthService, AppUser } from '../auth.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Observable, finalize } from 'rxjs';  
import { StoryService } from '../story.service';
import { map, tap } from 'rxjs/operators'
import { of } from 'rxjs';
import { catchError, take } from 'rxjs/operators';
import $ from 'jquery';
import { ChangeDetectorRef } from '@angular/core';
import { Reaction } from '../reaction.model';

type ReactionType = 'like' | 'unlike' | 'angry' | 'sad' | 'heart';
interface Story {
  storyId: string;
  photoURL: string;
  timestamp: any; // Consider using a more specific type here if possible
  mediaType: string;
  reactions: Reaction[];
  reactionsCount: { [key in ReactionType]: number };
  
  
}

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit {
  listOfPosts: Post[] = [];
  searchResults: Post[] = [];
  user: any;
  users$: Observable<AppUser[]> = of([]);
  currentUser: any;
  currentStoryIndex: number = 0;
  selectedUserStories: Story[] = []; // Change this to an array
  isLoading: boolean = false;
  selectedUser: AppUser | null = null;
  dropdownVisible = false;
  showTextBox = false;
  userStatus: string = '';

  @ViewChild('videoElement') videoElement!: ElementRef;
    @ViewChild('canvasElement') canvasElement!: ElementRef;

    constructor(
      private postService: PostService,
      private backEndService: BackEndService,
      private authService: AuthService,
      private storage: AngularFireStorage,
      private storyService: StoryService,
      private cdr: ChangeDetectorRef
    ) { 
      const currentUser = this.authService.getCurrentUser();
      if (currentUser) {
        this.authService.getUser(currentUser.uid).subscribe(user => {
          this.currentUser = user;
          this.userStatus = user.status;
        });
      }
    }
    ngOnInit(): void {
      this.users$ = this.authService.getUsers().pipe(
        tap(users => {
          users.forEach(user => {
            this.userHasStory(user).subscribe(hasStory => {
              user.hasStory = hasStory;
            });
          });
        })
      );
  
    this.backEndService.fetchData().subscribe((posts: Post[])=> {
      this.listOfPosts = posts;
    });
  
    this.postService.listChangedEvent.subscribe((posts: Post[]) => {
      this.listOfPosts = posts;
    });
    this.authService.user$.subscribe(user => {
      if (user) {
        this.authService.getUser(user.uid).subscribe(dbUser => {
          this.userStatus = dbUser.status; // Set the status to the fetched status
        });
      }
    });
  }

  onFileSelected(event: Event, currentUser: any): void {
    const element = event.target as HTMLInputElement;
    const file = element.files ? element.files[0] : null;
    if (file) {
      const filePath = `media/${new Date().getTime()}_${file.name}`;
      const fileRef = this.storage.ref(filePath);
      const task = this.storage.upload(filePath, file);
  
      task.percentageChanges().subscribe((percentage) => {
        console.log(percentage);
      });
  
      task.snapshotChanges().pipe(
        finalize(() => fileRef.getDownloadURL().subscribe((url) => {
          console.log(url);
          const storyData = { userId: currentUser.uid, mediaType: file.type.startsWith('image') ? 'image' : 'video' };
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
    this.selectedUser = user;
    this.isLoading = true;
    this.storyService.getStoriesByUser(user.uid).subscribe(stories => {
      // Clear the array
      this.selectedUserStories.length = 0;
  
      if (stories.length > 0) {
        stories.forEach(story => {
          const reactionsCount = { 'like': 0, 'unlike': 0, 'angry': 0, 'sad': 0, 'heart': 0 };
          if (story.reactions) {
            story.reactions.forEach(reaction => {
              reactionsCount[reaction.type]++;
            });
          }
          this.selectedUserStories.push({
            storyId: story.storyId,
            photoURL: story.photoURL, 
            timestamp: story.timestamp, 
            mediaType: story.mediaType,
            reactions: story.reactions,
            reactionsCount: reactionsCount
          });
        });
        this.currentStoryIndex = 0;
      } else {
        this.selectedUserStories.push({
          storyId: 'placeholder',
          photoURL: 'No story available for this user.', 
          timestamp: null, 
          mediaType: '', 
          reactions: [],
          reactionsCount: { 'like': 0, 'unlike': 0, 'angry': 0, 'sad': 0, 'heart': 0 }
        });
      }
      (document.getElementById('myModal') as any).style.display = 'block';
      this.cdr.detectChanges();
      this.isLoading = false;
    });
  }

  openCameraModal(): void {
    const video: HTMLVideoElement = this.videoElement.nativeElement;
    if (navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          video.srcObject = stream;
          video.play();
          (document.getElementById('cameraModal') as any).style.display = 'block';
        })
        .catch((err) => {
          console.error("Error accessing camera: ", err);
        });
    }
  }
  
  closeCameraModal(): void {
    const video: HTMLVideoElement = this.videoElement.nativeElement;
    const stream = video.srcObject as MediaStream;
    const tracks = stream.getTracks();
  
    tracks.forEach(track => {
      track.stop();
    });
  
    video.srcObject = null;
    (document.getElementById('cameraModal') as any).style.display = 'none';
  }
  
  capture(): void {
    const canvas: HTMLCanvasElement = this.canvasElement.nativeElement;
    const context = canvas.getContext('2d');
    const video: HTMLVideoElement = this.videoElement.nativeElement;
    if (context !== null) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
    }
    const capturedImage = canvas.toDataURL('image/png');
    const blob = this.dataURLToBlob(capturedImage);
  
    // Upload the captured image to Firebase storage
    const filePath = `media/${new Date().getTime()}_captured_image.png`;
    const fileRef = this.storage.ref(filePath);
    const task = this.storage.upload(filePath, blob);
  
    task.percentageChanges().subscribe((percentage) => {
      console.log(percentage);
    });
  
    task.snapshotChanges().pipe(
      finalize(() => fileRef.getDownloadURL().subscribe((url) => {
        console.log(url);
        const storyData = { userId: this.currentUser.uid, mediaType: 'image' };
        this.storyService.createStory(storyData, url);        
      }))
    ).subscribe();
  
    // Close the camera modal
    this.closeCameraModal();
  }
  
  dataURLToBlob(dataurl: string): Blob {
    const arr = dataurl.split(',');
    const match = arr[0].match(/:(.*?);/);
    const mime = match ? match[1] : '';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while(n--){
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {type:mime});
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

  getTimeDifference(timestamp: number): string {
    const difference = Date.now() - timestamp;
    const minutes = Math.floor(difference / 60000);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);
  
    if (minutes < 60) {
      return `${minutes} minutes ago`;
    } else if (hours < 24) {
      return `${hours} hours ago`;
    } else {
      return `${days} days ago`;
    }
  }
  addReaction(type: ReactionType) {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      const reaction: Reaction = { userId: currentUser.uid, type: type };
      const currentStory = this.selectedUserStories[this.currentStoryIndex];
      if (currentStory) {
        if (!currentStory.reactions) {
          currentStory.reactions = [];
        }
        
        const userReaction = currentStory.reactions.find(r => r.userId === currentUser.uid && r.type === type);
        if (!userReaction) {
          // User hasn't reacted with this type yet, so add their reaction
          currentStory.reactions.push(reaction);
          currentStory.reactionsCount[type]++;
        } else {
          // User has already reacted with this type, so remove their reaction
          const index = currentStory.reactions.indexOf(userReaction);
          if (index > -1) {
            currentStory.reactions.splice(index, 1);
            if (currentStory.reactionsCount[type] > 0) {
              currentStory.reactionsCount[type]--;
            }
          }
        }
        
        // Update the story in Firebase
        this.storyService.updateStory(currentStory);
  
        // Trigger change detection
        this.cdr.detectChanges();
      }
    }
  }
  deleteStory(story: Story): void {
    this.storyService.deleteStory(story.storyId).then(() => {
      console.log('Story deleted successfully');
    }).catch(error => {
      console.error('Error deleting story:', error);
    });
  }
  toggleDropdown(): void {
    this.dropdownVisible = !this.dropdownVisible;
  }
  updateUserStatus(user: AppUser, status: string): void {
    // Update the user's status in your database
    this.authService.updateUserStatus(user.uid, status).then(() => {
      console.log('User status updated successfully');
      // Update the userStatus property of the user object in the component's local state
      user.userStatus = status;
    }).catch(error => {
      console.error('Error updating user status:', error);
    });
  }
}
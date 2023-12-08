import { Component, OnInit } from '@angular/core';
import { BackEndService } from '../back-end.service';
import { PostService } from '../post.service';
import { DarkModeService } from '../dark-mode.service';
import { Post } from '../post.model';
import { ViewChild, ElementRef } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ChatService } from '../chat.service'; // Import ChatService
import { ChangeDetectorRef } from '@angular/core';

interface FriendRequest {
  senderEmail: string;
  id: string;
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  searchTerm: string = '';
  notificationsDropdownOpen: boolean = false;
  friendsDropdownOpen: boolean = false;
  searchDropdownOpen: boolean = false;
  notifications: string[] = [];
  @ViewChild('recycleBinModal') recycleBinModal!: ElementRef;
  user$ = this.authService.user$;
  deletedPosts: Post[] = [];
  listOfPost: any;
  searchKeyword: string;
  users: any[] = [];
  filteredUsers: any[] = [];
  users$: Observable<any[]>;
  allNotifications: { message: string; type: string; senderPhotoURL?: string;}[] = [];

  constructor(private fns: AngularFireFunctions, private backendservice: BackEndService, private postService: PostService, private darkModeService: DarkModeService, private authService: AuthService, private router: Router, private firestore: AngularFirestore, private chatService: ChatService, private cdr: ChangeDetectorRef) { // Inject ChatService
    this.searchKeyword = '';
    const callable = fns.httpsCallable('getAllUsers');
    this.users$ = callable({}).pipe(
      map(users => {
        console.log('Users from getAllUsers:', users);
        return users.filter((user: { email: string }) => user.email.includes(this.searchTerm));
      })
    );
  }

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    this.authService.user$.subscribe(currentUser => {
      if (currentUser && currentUser.email) {
        console.log('Current user email:', currentUser.email);
        this.authService.getFriendRequestsForUser(currentUser.email).subscribe(friendRequests => {
          console.log('Received friend requests:', friendRequests);
          friendRequests.forEach(friendRequest => {
            const notification = {
              message: `${friendRequest.senderEmail} Sent a Friend Request`,
              type: 'friendRequest',
              senderPhotoURL: friendRequest.senderPhotoURL,
              requestId: friendRequest.id  // Add this line
            };
            this.notifications.push(notification.message);
            this.allNotifications.push(notification);
          });
          console.log('All notifications:', this.allNotifications);
        });
      }
    });

    this.authService.getUsers().subscribe(users => {
      console.log('Users:', users);
      this.users = users;
    
      this.users.forEach(user => {
        if (currentUser) {
            this.chatService.getUnreadMessagesCount(currentUser.uid, user.uid).subscribe(count => {
                user.unreadMessagesCount = count;
                this.cdr.detectChanges(); // manually trigger change detection
            });
        }
    });
    });
    this.firestore.collection('users').snapshotChanges().subscribe(users => {
      this.users = users.map(user => {
        const data = user.payload.doc.data() as any;
        const id = user.payload.doc.id;
        return { id, ...data };
      });
    });
    this.backendservice.fetchData();
    this.postService.notificationCreated.subscribe((notification: {title: string, date: string, time: string}) => {
      this.onNewPostCreated(notification);
    });
    this.postService.listChangedEvent.subscribe((posts: Post[]) => {
      this.deletedPosts = posts.filter(post => post.deleted);
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

  onNewPostCreated(notification: {title: string, date: string, time: string}) {
    const newNotification = `${notification.title} on ${notification.date} at ${notification.time}`;
    this.notifications.push(newNotification);
    this.allNotifications.push({message: newNotification, type: 'postCreated'});
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

  searchFunction(event: Event) {
    event.preventDefault();
    console.log('searchFunction called with keyword:', this.searchKeyword);
    // Fetch all users from Firestore
    this.firestore.collection('users').valueChanges().subscribe(users => {
      // Filter the users based on the search term
      this.filteredUsers = users.filter((user: any) => user.email.includes(this.searchKeyword));
    });
    this.toggleSearchDropdown();
  }
  navigateToProfile(email: string) {
    this.router.navigate(['/profile', email]);
  }

  toggleSearchDropdown() {
    this.searchDropdownOpen = !this.searchDropdownOpen;
  }

  toggleNotificationsDropdown() {
    this.notificationsDropdownOpen = !this.notificationsDropdownOpen;
  }

  toggleFriendsDropdown() {
    this.friendsDropdownOpen = !this.friendsDropdownOpen;
  }
  startChatWith(user: any): void {
    let currentUser = this.authService.getCurrentUser();
    console.log('Current user:', currentUser);
    console.log('User to chat with:', user);
    if(currentUser !== null) {
      this.router.navigate(['/chat', currentUser.uid, user.id]);
    } else {
      // Handle the case when currentUser is null
    }
  }

  acceptFriendRequest(notification: any) {
    console.log('Notification:', notification);
    this.authService.acceptFriendRequest(notification.requestId);
  }

  declineFriendRequest(notification: any) {
    console.log('Notification:', notification);
    this.authService.declineFriendRequest(notification.requestId);
  }
  
}

import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { PostService } from '../post.service';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { finalize } from 'rxjs/operators';
import { Post } from '../post.model';
import { Router, ActivatedRoute } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: any;
  selectedFile: File | null = null;
  storage = getStorage();
  userPosts: Post[] = [];
  searchTerm: string = '';
  editingCommentIndex: number | null = null;
  comments: string[] = []; // Add this line
  isCurrentUser: boolean = false;
  friendRequestSent: boolean = false;
  

  constructor(private authService: AuthService, private postService: PostService, private router: Router, private route: ActivatedRoute, private firestore: AngularFirestore) { }

  ngOnInit(): void {
    const email = this.route.snapshot.paramMap.get('email');
    if (email) {
      // Fetch the user's data using the email
      this.authService.getUserByEmail(email).subscribe(user => {
        console.log('User Data:', user);
        this.user = user;
        this.isCurrentUser = false;
        console.log('this.user after getUserByEmail:', this.user);
        // Fetch the posts for this user
        this.userPosts = this.postService.getPost().filter(post => post.postedBy === user.email);
        // Retrieve the user's photoURL from the database
        this.authService.getUserPhotoURL(user.uid).then(photoURL => {
          this.user.photoURL = photoURL;
        });
      });
      
    } else {
      // Display the profile of the currently logged in user
      this.user = this.authService.getCurrentUser();
      this.isCurrentUser = true;
      this.authService.user$.subscribe(user => {
        if (user) {
          this.userPosts = this.postService.getPost().filter(post => post.postedBy === user.email);
          // Retrieve the user's photoURL from the database
          this.authService.getUserPhotoURL(user.uid).then(photoURL => {
            console.log('Photo URL:', photoURL);
            this.user.photoURL = photoURL;
          });
        }
      });
    }
  }

  


  onFileSelected(event: Event) {
    const target = <HTMLInputElement>event.target;
    if (target && target.files && target.files.length > 0) {
      this.selectedFile = <File>target.files[0];
    }
  }

  onUpload() {
    if (this.selectedFile) {
      const filePath = `/files/${this.user.uid}`;
      const storageRef = ref(this.storage, filePath);
      const uploadTask = uploadBytesResumable(storageRef, this.selectedFile);
  
      uploadTask.on('state_changed', 
        (snapshot) => {
          // Handle progress
        }, 
        (error) => {
          // Handle error
          console.error(error);
        }, 
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            console.log('File available at', downloadURL);
            this.user = { ...this.user, photoURL: downloadURL };
            // Save the user's data with the new photoURL
            this.authService.updateUserData(this.user);
            // Save the photoURL in Firestore
            this.firestore.collection('users').doc(this.user.uid).update({ photoURL: downloadURL });
          });
        }
      );
    }

  }

  delete(index: number) {
    const confirmDelete = window.confirm('Are you sure you want to delete this post?');
    if (confirmDelete) {
      this.postService.deleteButton(index);
    } else {
      console.log('Deletion canceled.');
    }
  }

  onEdit(index: number) {
    this.router.navigate(['/post-edit', index]);
  }

 onLike(index: number) {
  this.postService.likePost(this.user.id, index);
}

  onAddComment(index: number, comment: string) {
    this.postService.addComment(index, comment);
    this.userPosts[index].comments = this.postService.getComments(index);
  }

  onEditComment(index: number) {
    this.editingCommentIndex = index;
  }

  onSaveComment(postIndex: number, commentIndex: number, newComment: string) {
    if (this.editingCommentIndex !== null) {
      this.postService.editComment(postIndex, commentIndex, newComment);
      // Refresh the comments
      this.userPosts[postIndex].comments = this.postService.getComments(postIndex);
      this.editingCommentIndex = null;
    }
  }

  onDeleteComment(postIndex: number, commentIndex: number) {
    const confirmDelete = window.confirm('Are you sure you want to delete this comment?');
    if (confirmDelete) {
      this.postService.deleteComment(postIndex, commentIndex);
      // Refresh the comments
      this.userPosts[postIndex].comments = this.postService.getComments(postIndex);
    }
  }

  sendFriendRequest() {
    console.log('this.user in sendFriendRequest:', this.user);
    if (this.user && this.user.email) {
      this.authService.sendFriendRequest(this.user.email);
      this.friendRequestSent = true;

    } else {
      console.error('User or user Email is undefined');
    }
  }
  cancelFriendRequest() {
    this.authService.cancelFriendRequest(this.user.email).then(() => {
      this.friendRequestSent = false;
    });
  }
}
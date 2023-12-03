import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: any;
  selectedFile: File | null = null;
  storage = getStorage();

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
  }

  onFileSelected(event: Event) {
    const target = <HTMLInputElement>event.target;
    if (target && target.files && target.files.length > 0) {
      this.selectedFile = <File>target.files[0];
    }
  }

  onUpload() {
    if (this.selectedFile) {
      const filePath = `/files/${this.selectedFile.name}`;
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
            this.user.photoURL = downloadURL;
            // Save the user's data with the new photoURL
            this.authService.updateUserData(this.user);
          });
        }
      );
    }
  }
}
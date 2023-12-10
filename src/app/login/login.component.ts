import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class SignInComponent implements AfterViewInit {
  @ViewChild('videoElement') videoElement!: ElementRef;  email: string;
  password: string;

  constructor(private authService: AuthService, private router: Router) {
    this.email = '';
    this.password = '';
  }

  ngAfterViewInit() {
  }

  startCamera() {
    if (this.videoElement.nativeElement.srcObject) {
      this.stopCamera();
    } else {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
          this.videoElement.nativeElement.srcObject = stream;
          this.videoElement.nativeElement.play();
        });
      }
    }
  }

  stopCamera() {
    const stream = this.videoElement.nativeElement.srcObject;
    const tracks = stream.getTracks();
  
    tracks.forEach(function(track: MediaStreamTrack) {
      track.stop();
    });
  
    this.videoElement.nativeElement.srcObject = null;
  }

  capture() {
    const canvas = document.createElement('canvas');
    canvas.width = this.videoElement.nativeElement.videoWidth;
    canvas.height = this.videoElement.nativeElement.videoHeight;
    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(this.videoElement.nativeElement, 0, 0);
    }
    const image = canvas.toDataURL('image/png');
    // Now you have the image captured from the webcam. You can send this image to your facial recognition service.
  }

  signIn(event: Event) {
    event.preventDefault();
    this.authService.login(this.email, this.password).then((user) => {
      if (user) {
        this.router.navigate(['/post-list'])
          .then(success => console.log('Navigation success:', success))
          .catch(error => console.log('Navigation error:', error));
      } else {
        console.log('invalid user');
      }
    }).catch(error => {
      console.error('Error during sign in:', error);
      alert('Incorrect username or password');
    });
  }
}
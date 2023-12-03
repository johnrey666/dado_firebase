import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../auth.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent {
  email: string;
  password: string;

  constructor(private authService: AuthService, private router: Router) {
    this.email = '';
    this.password = '';
  }

  signUp() {
    this.authService.signUp(this.email, this.password).then(() => {
      this.router.navigate(['/login']);
      console.log(this.email)
    }).catch(error => {
      console.error('Error during sign up:', error);
      alert('Sign up failed. Please try again.'); // display an alert
    });
  }
} 
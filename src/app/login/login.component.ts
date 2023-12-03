import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class SignInComponent {
  email: string;
  password: string;

  constructor(private authService: AuthService, private router: Router) {
    this.email = '';
    this.password = '';
  }

  signIn(event: Event) {
    event.preventDefault();
    this.authService.login(this.email, this.password).then((user) => {
      if (user) {
        console.log('User logged in:', user);
        this.router.navigate(['/post-list'])
          .then(success => console.log('Navigation success:', success))
          .catch(error => console.log('Navigation error:', error));
      } else {
        console.log('No user logged in');
      }
    }).catch(error => {
      console.error('Error during sign in:', error);
      alert('Incorrect username or password'); // display an alert
    });
  }
}
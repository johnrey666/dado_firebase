import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class NoAuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) { }

  canActivate(): Observable<boolean> {
    return this.authService.getIdToken().pipe(      take(1),
      tap(token => console.log('Token:', token)), // Log the current token
      map(token => {
        if (token) {
          console.log('already logged in')
          this.router.navigate(['/post-list']); // replace '/' with the route to your home page or the page you want to redirect to when the user is already logged in
          return false;
        }
        return true;
      }), // map to boolean, but negate it
      tap(notLoggedIn => {
        console.log('Not logged in:', notLoggedIn); // Log the result of the map operation
      })
    );
  }
}
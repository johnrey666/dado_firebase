import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable } from 'rxjs';
import { User, UserInfo  } from 'firebase/auth';
import { map } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { getAuth } from "firebase/auth";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _user$ = new BehaviorSubject<User | null>(null);
  user$ = this._user$.asObservable();

  constructor(private firebaseAuth: AngularFireAuth) { 
    this.firebaseAuth.authState.pipe(
      map(user => user ? { ...user, providerData: user.providerData.filter(pd => pd !== null) as UserInfo[] } : null)
    ).subscribe(user => {
      console.log('Auth state changed:', user);
      this._user$.next(user);});
  }

  public getIdToken() {
    return this.firebaseAuth.idToken;
  }

  async login(email: string, password: string): Promise<User | null> {
    try {
      console.log('Logging in with email:', email);
      const credential = await this.firebaseAuth.signInWithEmailAndPassword(email, password);
      console.log('Credential:', credential);
  
      if (credential.user) {
        const user = {
          ...credential.user,
          providerData: credential.user.providerData.filter(pd => pd !== null) as UserInfo[]
        };
        this._user$.next(user);
        return user;
      }
      return null;
    } catch (error) {
      console.error('Error during login:', error);
      return null;
    }
  }
  
  
  public updateUserData(user: User | null) {
    this._user$.next(user);
  }

  signUp(email: string, password: string) {
    return this.firebaseAuth.createUserWithEmailAndPassword(email, password);
  }

  async signOut() {
    await this.firebaseAuth.signOut();
    this._user$.next(null); // Add this line
  }

  getCurrentUser() {
    const auth = getAuth();
    return auth.currentUser;
  }
}
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable } from 'rxjs';
import { UserInfo  } from 'firebase/auth';
import { map, take, tap } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { User } from 'firebase/auth';
import { getAuth, updateProfile } from "firebase/auth";
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { filter } from 'rxjs/operators';

interface FriendRequest {
  senderEmail: string;
  senderPhotoURL: string;
  id: string;
  senderId: string;
  receiverId: string;
  receiverEmail: string;
}

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  private _user$ = new BehaviorSubject<User | null>(null);
  user$ = this._user$.asObservable();

  constructor(private firebaseAuth: AngularFireAuth, private firestore: AngularFirestore) {     
    this.firebaseAuth.authState.pipe(
      map(user => user ? { ...user, email: user.email, providerData: user.providerData.filter(pd => pd !== null) as UserInfo[] } : null)
    ).subscribe(user => {
      console.log('Auth state changed:', user);
      this._user$.next(user);
    });
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
  
  public async updateUserData(user: User | null) {
    if (user) {
      const auth = getAuth();
      const userAuth = auth.currentUser;
      if (userAuth) {
        await updateProfile(userAuth, {
          photoURL: user.photoURL
        }).then(() => {
          console.log('Profile updated successfully');
          this._user$.next(user);
        }).catch((error) => {
          console.error('Error updating profile:', error);
        });
      }
    }
  }

  signUp(email: string, password: string) {
    return this.firebaseAuth.createUserWithEmailAndPassword(email, password).then((result) => {
      return this.firestore.collection('users').doc(result.user?.uid).set({
        email: result.user?.email,
        // Add any other user properties you need
      });
    });
  }

  async signOut() {
    await this.firebaseAuth.signOut();
    this._user$.next(null); // Add this line
  }

  getCurrentUser() {
    const auth = getAuth();
    return auth.currentUser;
  }

  getUserPhotoURL(uid: string): Promise<string> {
    const storage = getStorage();
    const photoRef = ref(storage, `${uid}`);
    return getDownloadURL(photoRef);
  }

  getUserByEmail(email: string): Observable<User> {
    return this.firestore.collection('users', ref => ref.where('email', '==', email))
      .snapshotChanges()
      .pipe(
        map(users => {
          const user = users[0].payload.doc.data() as User;
          const id = users[0].payload.doc.id;
          return { ...user, uid: id };
        })
      );
  }
  getUserAndPhotoByEmail(email: string): Observable<User> {
    return this.firestore.collection('users', ref => ref.where('email', '==', email))
      .valueChanges()
      .pipe(
        map(users => {
          console.log('Users:', users);
          return users[0] as User;
        }),
        switchMap(user => {
          return from(this.getUserPhotoURL(user.uid)).pipe(
            map(photoURL => {
              console.log('Photo URL:', photoURL);
              return { ...user, photoURL: photoURL };
            })
          );
        })
      );
  }

  getUserById(id: string): Observable<User> {
    return this.firestore.doc<User>(`users/${id}`).snapshotChanges().pipe(
      filter(snapshot => !!snapshot.payload.data()),
      map(snapshot => ({ uid: snapshot.payload.id, ...snapshot.payload.data() } as User))
    );
  }

  getUsers(): Observable<User[]> {
    return this.firestore.collection<User>('users').valueChanges().pipe(
      tap(users => console.log('Users from Firestore:', users))
    );
  }

  sendFriendRequest(receiverEmail: string) {
    if (receiverEmail) {
      const currentUser = this.getCurrentUser();
      const senderEmail = currentUser ? currentUser.email : null;
      // Check if a friend request already exists
      this.firestore.collection('friendRequests', ref => ref.where('senderEmail', '==', senderEmail).where('receiverEmail', '==', receiverEmail))
        .valueChanges()
        .pipe(take(1)) // Only take the first emission
        .subscribe(requests => {
          if (requests.length === 0) {
            // If no friend request exists, add a new one
            this.firestore.collection('friendRequests').add({ senderEmail, receiverEmail });
          } else {
            console.error('A friend request from this user already exists');
          }
        });
    } else {
      console.error('Receiver Email is undefined');
    }
  }

  cancelFriendRequest(receiverEmail: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (receiverEmail) {
        const currentUser = this.getCurrentUser();
        const senderEmail = currentUser ? currentUser.email : null;
        // Get the friend request document
        this.firestore.collection('friendRequests', ref => ref.where('senderEmail', '==', senderEmail).where('receiverEmail', '==', receiverEmail))
          .snapshotChanges()
          .pipe(take(1)) // Only take the first emission
          .subscribe(requests => {
            if (requests.length > 0) {
              // If a friend request exists, delete it
              const requestId = requests[0].payload.doc.id;
              this.firestore.collection('friendRequests').doc(requestId).delete().then(() => {
                resolve();
              }).catch((error) => {
                reject(error);
              });
            } else {
              console.error('No friend request from this user exists');
              reject('No friend request from this user exists');
            }
          });
      } else {
        console.error('Receiver Email is undefined');
        reject('Receiver Email is undefined');
      }
    });
  }

  acceptFriendRequest(requestId: string) {
    console.log('Accepting friend request with ID:', requestId);
    // Get the friend request document
    this.firestore.collection('friendRequests').doc(requestId).get().toPromise().then(doc => {
      if (doc && doc.exists) {
        const { senderEmail, receiverEmail } = doc.data() as FriendRequest;
        console.log('Friend request data:', { senderEmail, receiverEmail });
  
        // Fetch the sender and receiver user documents

        Promise.all([
          this.getUserByEmail(senderEmail).pipe(take(1)).toPromise(),
          this.getUserByEmail(receiverEmail).pipe(take(1)).toPromise()
        ]).then(([sender, receiver]) => {
          console.log('Sender:', sender);
          console.log('Receiver:', receiver);
          if (sender && receiver && sender.uid && receiver.uid) {
            // Add a document to the 'friends' collection
            this.firestore.collection('friends').add({ userId1: sender.uid, userId2: receiver.uid });
          } else {
            console.error('Could not fetch sender or receiver user document');
          }
        });
  
        // Delete the friend request
        doc.ref.delete();
      }
    });
  }
  
  declineFriendRequest(requestId: string) {
    console.log('Declining friend request with ID:', requestId);
    // Delete the friend request document
    this.firestore.collection('friendRequests').doc(requestId).delete();
  }
  
  getFriendRequestsForUser(email: string): Observable<FriendRequest[]> {
    return this.firestore.collection<FriendRequest>('friendRequests', ref => ref.where('receiverEmail', '==', email))
      .snapshotChanges()
      .pipe(
        map(actions => actions.map(a => {
          const data = a.payload.doc.data() as FriendRequest;
          const id = a.payload.doc.id;
          return { ...data, id };
        })),
        tap(requests => console.log('Friend requests:', requests)) // Add this line
      );
  }
  areFriends(userId1: string, userId2: string): Observable<boolean> {
    return this.firestore.collection('friends', ref => ref
      .where('userId1', 'in', [userId1, userId2])
      .where('userId2', 'in', [userId1, userId2]))
      .valueChanges()
      .pipe(map(friends => friends.length > 0));
  }

  

  

  
}
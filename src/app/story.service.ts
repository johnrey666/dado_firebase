import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { Reaction } from './reaction.model';
import firebase from 'firebase/compat/app';
import { tap } from 'rxjs/operators';

interface Story {
  storyId: string;
  photoURL: string;
  timestamp: any;
  mediaType: string;
  reactions: Reaction[];
}

@Injectable({ providedIn: 'root' })
export class StoryService {
  stories: any[] = [];

  constructor(private http: HttpClient, private firestore: AngularFirestore) {}

  createStory(storyData: any, photoURL: string) {
    const timestamp = new Date().getTime();
    const story = { ...storyData, photoURL, timestamp };
    return this.firestore.collection('stories').add(story);
  }

  getStoriesByUser(userId: string): Observable<{storyId: string, photoURL: string, timestamp: any, mediaType: string, reactions: Reaction[] }[]> {
    const oneDayAgo = new Date().getTime() - 24 * 60 * 60 * 1000;
    const stories$ = this.firestore.collection('stories', ref => ref.where('userId', '==', userId).where('timestamp', '>', oneDayAgo))
        .snapshotChanges()
        .pipe(
            map(actions => actions.map(a => {
                const data = a.payload.doc.data() as {photoURL: string, timestamp: any, mediaType: string, reactions: Reaction[] };
                const storyId = a.payload.doc.id;
                return { storyId, ...data };
            }))
        );
    stories$.subscribe(stories => console.log(`Stories for user ${userId}:`, stories));
    return stories$;
  }

  updateStory(story: Story) {
    this.firestore.collection('stories').doc(story.storyId).update(story);
  }

  deleteStory(storyId: string): Promise<void> {
    return this.firestore.collection('stories').doc(storyId).delete();
  }
  getExpiredStoriesByUser(userId: string) {
    let oneMinuteAgoMillis = firebase.firestore.Timestamp.now().toMillis() - 60 * 1000;
  
    return this.firestore.collection('stories', ref => ref
      .where('userId', '==', userId)
      .where('timestamp', '<', oneMinuteAgoMillis))
      .snapshotChanges()
      .pipe(
        map(actions => actions.map(a => {
          const data = a.payload.doc.data() as Story;
          const id = a.payload.doc.id;
          return { id, ...data };
        })),
        tap(expiredStories => console.log(`Number of expired stories: ${expiredStories.length}`))
      );
  }
}
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class StoryService {
  stories: any[] = [];

  constructor(private http: HttpClient, private firestore: AngularFirestore) {}

  createStory(storyData: any, photoURL: string) {
    const story = { ...storyData, photoURL, timestamp: new Date().getTime() };
    return this.firestore.collection('stories').add(story);
  }

  getStoriesByUser(userId: string): Observable<{photoURL: string}[]> {
    const oneDayAgo = new Date().getTime() - 24 * 60 * 60 * 1000;
    const stories$ = this.firestore.collection('stories', ref => ref.where('userId', '==', userId).where('timestamp', '>', oneDayAgo)).valueChanges() as Observable<{photoURL: string}[]>;
    stories$.subscribe(stories => console.log(`Stories for user ${userId}:`, stories));
    return stories$;
}
}

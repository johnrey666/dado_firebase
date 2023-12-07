import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(private firestore: AngularFirestore) { }

  getMessages(userId: string, otherUserId: string) {
    return this.firestore.collection('messages', ref => ref
      .where('senderId', 'in', [userId, otherUserId])
      .where('receiverId', 'in', [userId, otherUserId])
      .orderBy('timestamp'))
      .snapshotChanges().pipe(
        map(actions => actions.map(a => {
          const data = a.payload.doc.data() as Object;
          const id = a.payload.doc.id;
          return { id, ...data };
        }))
      );
  }

  sendMessage(senderId: string, receiverId: string, content: string) {
    console.log('senderId:', senderId);
    console.log('receiverId:', receiverId);
    console.log('content:', content);
    console.log('timestamp:', Date.now());
    return this.firestore.collection('messages').add({
      senderId,
      receiverId,
      content,
      timestamp: Date.now(),
      seen: false
    });
  }
  }
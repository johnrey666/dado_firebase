import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { finalize, map, switchMap } from 'rxjs/operators';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { firstValueFrom } from 'rxjs';
import { getStorage, ref, getDownloadURL } from "firebase/storage";



@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(private firestore: AngularFirestore, private storage: AngularFireStorage) { }
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
sendMessage(senderId: string, receiverId: string, content: string, fileUrl?: string) {
  console.log('ChatService.sendMessage called with:', { senderId, receiverId, content, fileUrl });
  const message: { senderId: string; receiverId: string; content: string; timestamp: number; seen: boolean; fileUrl?: string; } = {
    senderId,
    receiverId,
    content,
    timestamp: Date.now(),
    seen: false
  };
  if (fileUrl) {
    message['fileUrl'] = fileUrl;
  }
  return this.firestore.collection('messages').add(message);
}

  markAsSeen(messageId: string) {
    return this.firestore.collection('messages').doc(messageId).update({
      seen: true
    });
  }

  getUnreadMessagesCount(userId: string, otherUserId: string) {
    return this.firestore.collection('messages', ref => ref
      .where('senderId', '==', otherUserId)
      .where('receiverId', '==', userId)
      .where('seen', '==', false))
      .snapshotChanges().pipe(
        map(actions => actions.length)
      );
  }

  uploadFile(file: File): Promise<string> {
    const filePath = `uploads/${new Date().getTime()}_${file.name}`;
    const fileRef = this.storage.ref(filePath);
    const task = this.storage.upload(filePath, file);
    return task.snapshotChanges().pipe(
      switchMap(() => fileRef.getDownloadURL()),
    ).toPromise();
  }
  async sendImage(senderId: string, receiverId: string, content: string, file: File): Promise<void> {
    const fileUrl = await this.uploadFile(file);
    console.log('Uploaded file URL:', fileUrl);
    return new Promise((resolve) => {
      setTimeout(() => {
        this.sendMessage(senderId, receiverId, content, fileUrl);
        resolve();
      }, 5000);  // Wait for 5 seconds before sending the message
    });
  }
  fetchImageUrl(imagePath: string): Promise<string> {
    const storage = getStorage();
    const imageRef = ref(storage, imagePath);

    return getDownloadURL(imageRef)
      .then((url) => {
        // `url` is the download URL for your image
        console.log(url);
        return url;
      })
      .catch((error) => {
        console.error('Error fetching image:', error);
        throw error;
      });
  }

  }
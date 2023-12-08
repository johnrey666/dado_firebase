import { Component, OnInit } from '@angular/core';
import { ChatService } from '../chat.service';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth.service';
import { BehaviorSubject } from 'rxjs';
import { listAll, ListResult } from "firebase/storage";
import { getStorage, ref } from '@firebase/storage';
import { getDownloadURL } from '@firebase/storage';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  imageUrl$ = new BehaviorSubject<string | null>(null);
  userId: string = '';
  user: any;
  messages: any[] = [];
  newMessageContent: string = '';
  currentUser: any;
  selectedFile: File | null = null;

  constructor(private chatService: ChatService, private route: ActivatedRoute, private authService: AuthService) { }

  
  ngOnInit(): void {
    this.fetchImage();

    const currentUserUid = this.route.snapshot.paramMap.get('currentUserUid')!;
    const userId = this.route.snapshot.paramMap.get('userId')!;
    this.userId = userId;
    this.authService.getUserById(currentUserUid).subscribe((currentUser: any) => {
      this.currentUser = currentUser;
    });
    this.authService.getUserById(userId).subscribe((user: any) => {
      this.user = user;
    });
    this.chatService.getMessages(currentUserUid, userId).subscribe(messages => {
      this.messages = messages;
      this.markMessagesAsSeen();
      // Add this line
      this.messages.forEach(message => console.log('Message file URL:', message.fileUrl));
    });
  }
  fetchImage(): void {
    this.chatService.fetchImageUrl('uploads/')
    .then((url) => {
      // `url` is the download URL for the image
      console.log(url);
    })
    .catch((error) => {
      console.error('Error fetching image:', error);
    });
  }


  markMessagesAsSeen(): void {
    this.messages.forEach(message => {
      if (message.receiverId === this.currentUser.uid && !message.seen) {
        this.chatService.markAsSeen(message.id);
      }
    });
  }

  async sendMessage(): Promise<void> {
    console.log('sendMessage called');
    if (this.newMessageContent.trim() !== '' && this.currentUser && this.currentUser.uid) {
      if (this.selectedFile) {
        // If a file is selected, send it as an image
        await this.chatService.sendImage(this.currentUser.uid, this.userId, this.newMessageContent, this.selectedFile);
      } else {
        // If no file is selected, send the message as usual
        this.chatService.sendMessage(this.currentUser.uid, this.userId, this.newMessageContent);
      }
      console.log(`Message sent to ${this.userId}: ${this.newMessageContent}`);
      this.newMessageContent = '';
      this.markMessagesAsSeen();
    }
  }
  onFileSelected(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.selectedFile = inputElement.files && inputElement.files.length > 0 ? inputElement.files[0] : null;
    console.log(this.selectedFile);
  }
  async fetchAllImages(): Promise<string[]> {
    const storage = getStorage();
    const uploadsRef = ref(storage, 'uploads/');
  
    const listResult: ListResult = await listAll(uploadsRef);
    const urls: string[] = [];
  
    for (const itemRef of listResult.items) {
      const url = await getDownloadURL(itemRef);
      urls.push(url);
    }
  
    return urls;
  }
}
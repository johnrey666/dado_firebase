import { Component, OnInit } from '@angular/core';
import { ChatService } from '../chat.service';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  userId: string = '';
  user: any;
  messages: any[] = [];
  newMessageContent: string = '';
  currentUser: any;

  constructor(private chatService: ChatService, private route: ActivatedRoute, private authService: AuthService) { }
  ngOnInit(): void {
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
    });
  }
  sendMessage(): void {
    if (this.newMessageContent.trim() !== '' && this.currentUser && this.currentUser.uid) {
      this.chatService.sendMessage(this.currentUser.uid, this.userId, this.newMessageContent);
      console.log(`Message sent to ${this.userId}: ${this.newMessageContent}`);
      this.newMessageContent = '';
    }
  }
}
import { Injectable, EventEmitter } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Injectable({
    providedIn: 'root'
  })
  export class SignalingService {
    private ws: WebSocket | null = null;
    public offerReceived = new EventEmitter<any>();
    public answerReceived = new EventEmitter<any>();
  
    constructor(private afAuth: AngularFireAuth) { }
  
    startCall(userId: string) {
      this.ws = new WebSocket('ws://localhost:8080');
      
      this.ws.onopen = () => {
        console.log('onopen called by', this);
        const message = {
          type: 'new-user',
          user: userId
        };
        this.ws && this.ws.send(JSON.stringify(message));
      };
      
      this.ws.onmessage = (message) => {
        const data = JSON.parse(message.data);
        console.log('Received message:', data);
        if (data.type === 'offer') {
          this.offerReceived.emit(data);
        } else if (data.type === 'answer') {
          this.answerReceived.emit(data);
        }
      };
    }


sendIceCandidate(candidate: RTCIceCandidate, user: any) {
  const message = {
    type: 'ice-candidate',
    candidate: candidate,
    user: user
  };
  console.log('Sending ice-candidate message:', message); // Add this line
  this.ws && this.ws.send(JSON.stringify(message));
}

  sendOffer(offer: any, user: any) {
    const message = {
      type: 'offer',
      offer: offer,
      user: user
    };
    console.log('Sending offer message:', message); // Add this line
    this.ws && this.ws.send(JSON.stringify(message));
  }

  sendAnswer(answer: any, user: any) {
    const message = {
      type: 'answer',
      answer: answer,
      user: user
    };
    console.log('Sending answer message:', message); // Added this line
    this.ws && this.ws.send(JSON.stringify(message));
  }


}
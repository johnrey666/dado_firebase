import { Injectable, EventEmitter } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { HttpClient } from '@angular/common/http';


@Injectable({
    providedIn: 'root'
  })
  export class SignalingService {
    private ws: WebSocket | null = null;
    public offerReceived = new EventEmitter<any>();
    public answerReceived = new EventEmitter<any>();
    public callRequestReceived = new EventEmitter<any>();
  
    constructor(private afAuth: AngularFireAuth, private http: HttpClient) { }
  
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
        if (data.type === 'call-request') {
          this.callRequestReceived.emit(data);
        } else if (data.type === 'offer') {
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

  sendCallRequest(calledUserId: string, callingUserId: string) {
    const message = {
      type: 'call-request',
      calledUser: calledUserId,
      callingUser: callingUserId
    };
    this.ws && this.ws.send(JSON.stringify(message));
  }

  sendCallDeclined(callingUser: any, currentUserID: any) {
    const url = 'https://fcm.googleapis.com/fcm/send';
    const body = {
      data: {
        message: 'Your call was declined.'
      },
      to: callingUser.deviceToken // Replace this with the actual device token of the calling user
    };
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `key=your-server-key` // Replace this with your actual server key
    };

    this.http.post(url, body, { headers }).subscribe(response => {
      console.log(response);
    }, error => {
      console.error(error);
    });
  }

  
}
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AuthService } from '../auth.service';
import { SignalingService } from '../signaling.service';

@Component({
  selector: 'app-video-call',
  templateUrl: './video-call.component.html',
  styleUrls: ['./video-call.component.css']
})
export class VideoCallComponent implements OnInit {
  @ViewChild('localVideo') localVideo!: ElementRef;
  @ViewChild('remoteVideo') remoteVideo!: ElementRef;
  users: any[] = [];

  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private peerConnection: RTCPeerConnection | null = null;

  isCallStarted = false; // Add this line

  constructor(private authService: AuthService, private signalingService: SignalingService) { }

  ngOnInit(): void {
    this.authService.getUsers().subscribe(users => {
      this.users = users;
      console.log('Users:', users);
    });
  
    this.signalingService.offerReceived.subscribe(async (offer) => {
      console.log('Received a call:', offer);
      if (confirm('You have received a call. Do you want to accept it?')) {
        // User accepted the call. Handle the offer here.
        this.peerConnection = new RTCPeerConnection();
    
        this.peerConnection.addEventListener('icecandidate', event => {
          if (event.candidate) {
            this.signalingService.sendIceCandidate(event.candidate, offer.user);
          }
        });
    
        this.peerConnection.addEventListener('track', event => {
          this.remoteStream?.addTrack(event.track);
        });
    
        await this.peerConnection.setRemoteDescription(offer);
        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);
    
        // Send the answer to the caller through your signaling server
        this.signalingService.sendAnswer(answer, offer.user);
      } else {
        // User declined the call. Handle this case here.
      }
    });
  
    this.signalingService.answerReceived.subscribe(async (answer) => {
      if (this.peerConnection) {
        await this.peerConnection.setRemoteDescription(answer);
      }
    });
  }

  async startCall(user: any)  {
    console.log('startCall called by', this, 'Calling user with ID:', user.uid);
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      this.remoteStream = new MediaStream();
  
      this.localVideo.nativeElement.srcObject = this.localStream;
      this.remoteVideo.nativeElement.srcObject = this.remoteStream;
  
      this.peerConnection = new RTCPeerConnection();
  
      this.peerConnection.addEventListener('icecandidate', event => {
        if (event.candidate) {
          this.signalingService.sendIceCandidate(event.candidate, user);
        }
      });
  
      this.peerConnection.addEventListener('track', event => {
        this.remoteStream?.addTrack(event.track);
      });
  
      this.localStream.getTracks().forEach(track => {
        this.peerConnection?.addTrack(track, this.localStream!);
      });
  
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
  
      // Send the offer to the other peer through your signaling server
      this.signalingService.sendOffer(offer, user);

      this.isCallStarted = true; // Add this line
    } catch (error) {
      console.error('Error starting call:', error);
    }
  }

  endCall() {
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
  
    // Stop all tracks of the localStream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
  
    this.isCallStarted = false; // Add this line
  }
}
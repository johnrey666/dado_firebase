import { EventEmitter, Injectable } from "@angular/core";
import { Post } from "./post.model";
import { HttpClient } from "@angular/common/http";
import { map } from 'rxjs/operators'

@Injectable({ providedIn: 'root' })
export class PostService {
  constructor(private http:HttpClient){}
  listChangedEvent: EventEmitter<Post[]> = new EventEmitter();
  postCreated = new EventEmitter<Post>();
  postDeleted = new EventEmitter<string>();
  notificationCreated = new EventEmitter<{title: string, date: string, time: string}>(); // New event emitter for notifications
  listOfPosts: Post[] = [];
  notifications: {title: string, date: string, time: string}[] = [];

  addNotification(post: Post) {
    const date = post.dateCreated.toLocaleDateString(); // Format the date
    const time = post.dateCreated.toLocaleTimeString(); // Format the time
    const notification = {title: `You have posted "${post.title}"`, date, time};
    this.notifications.push(notification);
    return notification; // Return the new notification
  }
  
  addDeleteNotification(post: Post) {
    const date = new Date().toLocaleDateString(); // Format the date
    const time = new Date().toLocaleTimeString(); // Format the time
    const notification = {title: `You deleted "${post.title}"`, date, time};
    this.notifications.push(notification);
    return notification; // Return the new notification
  }
  getNotifications() { // Added getNotifications method
    return this.notifications;
    // Here you can add code to retrieve the notifications array from the backend
  }

  getPost() {
    return this.listOfPosts;
  }

  deleteButton(index: number) {
    const deletedPost = this.listOfPosts[index];
    this.http.delete(`https://fir-aac7d-default-rtdb.asia-southeast1.firebasedatabase.app/posts/${index}.json`).subscribe(() => {
      console.log('Post deleted from Firebase');
      this.listOfPosts.splice(index, 1);
      const notification = this.addDeleteNotification(deletedPost); // Get the new notification
      this.notificationCreated.emit(notification); // Emit the new notification
    });
  }
  addPost(post: Post) {
    this.listOfPosts.push(post);
    this.postCreated.emit(post); // Emit the new post
    const notification = this.addNotification(post); // Get the new notification
    this.notificationCreated.emit(notification); // Emit the new notification
  }

  updatePost(index: number, post: Post) {
    this.listOfPosts[index] = post;
  }



  getSpecPost(index: number) {
    return this.listOfPosts[index];
  }

  likePost(index: number) {
    this.listOfPosts[index].numberOfLikes++;
    this.http.put(`https://fir-aac7d-default-rtdb.asia-southeast1.firebasedatabase.app/posts/${index}.json`, this.listOfPosts[index])
      .subscribe(() => {
        console.log('Post updated in Firebase');
      });
  }

  addComment(index: number, comment: string) {
    this.listOfPosts[index].comments.push(comment);
    this.http.patch(`https://fir-aac7d-default-rtdb.asia-southeast1.firebasedatabase.app/posts/${index}.json`, { comments: this.listOfPosts[index].comments })
      .subscribe(() => {
        console.log('Comment added to Firebase');
      });
  }

  getComments(index: number) {
    return this.listOfPosts[index].comments;
  }

  setPosts(listOfPosts: Post[]) {
    this.listOfPosts = listOfPosts;
    this.listChangedEvent.emit(listOfPosts);
  }

  editComment(postIndex: number, commentIndex: number, newComment: string) {
    this.listOfPosts[postIndex].comments[commentIndex] = newComment;
    this.http.put(`https://fir-aac7d-default-rtdb.asia-southeast1.firebasedatabase.app/posts/${postIndex}.json`, this.listOfPosts[postIndex])
      .subscribe(() => {
        console.log('Comment updated in Firebase');
      });
  }
  
  deleteComment(postIndex: number, commentIndex: number) {
    this.listOfPosts[postIndex].comments.splice(commentIndex, 1);
    this.http.put(`https://fir-aac7d-default-rtdb.asia-southeast1.firebasedatabase.app/posts/${postIndex}.json`, this.listOfPosts[postIndex])
      .subscribe(() => {
        console.log('Comment deleted from Firebase');
      });
  }

  
}
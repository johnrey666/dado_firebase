import { EventEmitter, Injectable } from "@angular/core";
import { Post } from "./post.model";
import { HttpClient } from "@angular/common/http";
import { map } from 'rxjs/operators'
import { Subject } from "rxjs";

@Injectable({ providedIn: 'root' })
export class PostService {
  constructor(private http:HttpClient){}
  listChangedEvent: EventEmitter<Post[]> = new EventEmitter();
  postCreated = new EventEmitter<Post>();
  postDeleted = new EventEmitter<string>();
  notificationCreated = new EventEmitter<{title: string, date: string, time: string}>(); // New event emitter for notifications
  listOfPosts: Post[] = [];
  notifications: {title: string, date: string, time: string}[] = [];


  getDeletedPosts() {
    return this.listOfPosts.filter(post => post.deleted);
  }

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
    deletedPost.deleted = true;
    this.http.put(`https://fir-3-6b65e-default-rtdb.asia-southeast1.firebasedatabase.app/posts/${index}.json`, deletedPost)
      .subscribe(() => {
        console.log('Post marked as deleted in Firebase');
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

  likePost(userId: string, index: number) {
    const post = this.listOfPosts[index];
    if (!post.likedBy) {
      post.likedBy = [];
    }
    const userIndex = post.likedBy.indexOf(userId);
    if (userIndex === -1) {
      // User has not liked the post yet, so add their ID to the array
      post.likedBy.push(userId);
    } else {
      // User has already liked the post, so remove their ID from the array
      post.likedBy.splice(userIndex, 1);
    }
    post.numberOfLikes = post.likedBy.length;
    this.http.put(`https://fir-3-6b65e-default-rtdb.asia-southeast1.firebasedatabase.app/posts/${index}.json`, post)
      .subscribe(() => {
        console.log('Post updated in Firebase');
      });
  }

  addComment(index: number, comment: string) {
    this.listOfPosts[index].comments.push(comment);
    this.http.patch(`https://fir-3-6b65e-default-rtdb.asia-southeast1.firebasedatabase.app/posts/${index}.json`, { comments: this.listOfPosts[index].comments })
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
    this.http.put(`https://fir-3-6b65e-default-rtdb.asia-southeast1.firebasedatabase.app/posts/${postIndex}.json`, this.listOfPosts[postIndex])
      .subscribe(() => {
        console.log('Comment updated in Firebase');
      });
  }
  
  deleteComment(postIndex: number, commentIndex: number) {
    this.listOfPosts[postIndex].comments.splice(commentIndex, 1);
    this.http.put(`https://fir-3-6b65e-default-rtdb.asia-southeast1.firebasedatabase.app/posts/${postIndex}.json`, this.listOfPosts[postIndex])
      .subscribe(() => {
        console.log('Comment deleted from Firebase');
      });
  }


  restorePost(index: number) {
    this.listOfPosts[index].deleted = false;
    this.http.put(`https://fir-3-6b65e-default-rtdb.asia-southeast1.firebasedatabase.app/posts/${index}.json`, this.listOfPosts[index])
      .subscribe(() => {
        console.log('Post restored in Firebase');
      });
  }
permanentlyDeletePost(index: number) {
  this.http.delete(`https://fir-3-6b65e-default-rtdb.asia-southeast1.firebasedatabase.app/posts/${index}.json`)
    .subscribe(() => {
      console.log('Post permanently deleted from Firebase');
      // Remove the post from the listOfPosts array
      this.listOfPosts.splice(index, 1);
      // Emit the new list of posts
      this.listChangedEvent.emit(this.listOfPosts);
    });
}


createPost(postData: any, photoURL: string) {
  // Add the photoURL to the post data
  const post = { ...postData, photoURL };

  // Save the post data
  // ...
}

  
  
}
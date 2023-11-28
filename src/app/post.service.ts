import { EventEmitter, Injectable } from "@angular/core";
import { Post } from "./post.model";
import { HttpClient } from "@angular/common/http";

@Injectable({ providedIn: 'root' })
export class PostService {
  constructor(private http:HttpClient){}
  listChangedEvent: EventEmitter<Post[]> = new EventEmitter();
  postCreated = new EventEmitter<string>();
  listOfPosts: Post[] = [];

  getPost() {
    return this.listOfPosts;
  }

  deleteButton(index: number) {
    this.http.delete(`https://fir-aac7d-default-rtdb.asia-southeast1.firebasedatabase.app/posts/${index}.json`).subscribe(() => {
      console.log('Post deleted from Firebase');
      this.listOfPosts.splice(index, 1);
    });
  }

  addPost(post: Post) {
    this.listOfPosts.push(post);
    this.postCreated.emit(`You have posted "${post.title}" on ${new Date().toLocaleDateString()}`);
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
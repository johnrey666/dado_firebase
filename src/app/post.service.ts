import { EventEmitter, Injectable } from "@angular/core";
import { Post } from "./post.model";
import { HttpClient } from "@angular/common/http";


@Injectable({ providedIn: 'root' })
export class PostService {
  constructor(private http:HttpClient){}
  listChangedEvent: EventEmitter<Post[]> = new EventEmitter();
  listOfPosts: Post[] = [

  ];
  getPost() {
    return this.listOfPosts;
  }
  deleteButton(index: number) {


    
    this.http.delete(`https://crud-cbf8b-default-rtdb.asia-southeast1.firebasedatabase.app/posts/${index}.json`).subscribe(() => {
      console.log('Post deleted from Firebase');
      this.listOfPosts.splice(index, 1);
    });
  }
  addPost(post: Post) {
    this.listOfPosts.push(post);
    
  }
  updatePost(index: number, post: Post) {
    this.listOfPosts[index] = post;
  }
  getSpecPost(index: number) {
    return this.listOfPosts[index];
  }
  likePost(index: number) {
    this.listOfPosts[index].numberOfLikes++;
    this.http.put(`https://crud-cbf8b-default-rtdb.asia-southeast1.firebasedatabase.app/posts/${index}.json`, this.listOfPosts[index])
      .subscribe(() => {
        console.log('Post updated in Firebase');
      });
  
  
  }
  addComment(index: number, comment: string) {
    this.listOfPosts[index].comments.push(comment);
    this.http.patch(`https://crud-cbf8b-default-rtdb.asia-southeast1.firebasedatabase.app/posts/${index}.json`, { comments: this.listOfPosts[index].comments })
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
}



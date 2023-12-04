import { Component, OnInit, Input } from '@angular/core';
import { Post } from '../post.model';
import { PostService } from '../post.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit {
  user: any;

  memberName = "Lan";
  constructor(private postService: PostService, private router: Router) {
  }
  @Input() index: number = 0;
  @Input() post?: Post;
  comments: string[] = [];

  ngOnInit(): void {
    console.log(this.post);
    this.comments = this.postService.getComments(this.index);
  }
  delete() {
    // Display a confirmation dialog
    const confirmDelete = window.confirm('Are you sure you want to delete this post?');
  
    // Check the user's response
    if (confirmDelete) {
      // User clicked OK, proceed with deletion
      this.postService.deleteButton(this.index);
    } else {
      // User clicked Cancel, do nothing or handle as needed
      console.log('Deletion canceled.');
    }
  }
  searchTerm: string = '';
  onEdit() {
    this.router.navigate(['/post-edit', this.index])
  }
  onLike() {
    this.postService.likePost(this.index)
  }
  onAddComment(comment: string) {
    this.postService.addComment(this.index, comment);
    this.comments = this.postService.getComments(this.index); // Refresh the comments
  }

  onEditComment(index: number) {
    this.editingCommentIndex = index;
  }
  editingCommentIndex: number | null = null;
  
  onSaveComment(newComment: string) {
    if (this.editingCommentIndex !== null) {
      this.postService.editComment(this.index, this.editingCommentIndex, newComment);
      this.comments = this.postService.getComments(this.index); // Refresh the comments
      this.editingCommentIndex = null;
    }
  }
  
  onDeleteComment(index: number) {
    const confirmDelete = window.confirm('Are you sure you want to delete this comment?');
    if (confirmDelete) {
      this.postService.deleteComment(this.index, index);
      this.comments = this.postService.getComments(this.index); // Refresh the comments
    }
  }
}
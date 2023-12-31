import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { AuthComponent } from './auth/auth.component';
import { HeaderComponent } from './header/header.component';
import { PostComponent } from './post/post.component';
import { PostEditComponent } from './post-edit/post-edit.component';
import { PostListComponent } from './post-list/post-list.component';
import { Routes } from '@angular/router';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { HighlightPipe } from './highlight.pipe';
import { SignInComponent } from './login/login.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { environment } from 'src/environments/environment';
import { AngularFireModule } from '@angular/fire/compat';
import { AuthGuard } from './auth.guard';
import { NoAuthGuard } from './noauth.guard';
import { ProfileComponent } from './profile/profile.component'; // import NoAuthGuard
import { Ng2SearchPipe } from 'ng2-search-filter';
import { ChatComponent } from './chat/chat.component';
import { VideoCallComponent } from './video-call/video-call.component';
import { Chat1Component } from './chat1/chat1.component';

const routes: Routes = [
  { path: '', redirectTo: 'post-list', pathMatch: 'full' },
  { path: 'post-list', component: PostListComponent, canActivate: [AuthGuard] },
  { path: 'post-add', component: PostEditComponent, canActivate: [AuthGuard] },
  { path: 'Authentication', component: AuthComponent },
  { path: 'post-edit', component: PostEditComponent, canActivate: [AuthGuard] },
  { path: 'post-edit/:index', component: PostEditComponent, canActivate: [AuthGuard] },
  { path: 'login', component: SignInComponent, canActivate: [NoAuthGuard] }, // use NoAuthGuard
  { path: 'signup', component: SignUpComponent, canActivate: [NoAuthGuard] }, // use NoAuthGuard
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'post/:id', component: PostComponent },
  { path: 'profile/:email', component: ProfileComponent },
  { path: 'chat/:userId', component: ChatComponent },
  { path: 'chat/:currentUserUid/:userId', component: ChatComponent },
  { path: 'chat', component: ChatComponent },
  { path: 'video-call', component: VideoCallComponent }
]

@NgModule({
  declarations: [
    AppComponent,
    AuthComponent,
    HeaderComponent,
    PostComponent,
    PostEditComponent,
    PostListComponent,
    HighlightPipe,
    SignUpComponent,
    SignInComponent,
    ProfileComponent,
    ChatComponent,
    VideoCallComponent,
    Chat1Component
  ],
  imports: [
    BrowserModule,
    AngularFireModule.initializeApp(environment.firebase),
    RouterModule.forRoot(routes),
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [AuthGuard, NoAuthGuard], // add NoAuthGuard to providers
  bootstrap: [AppComponent]
})
export class AppModule { }
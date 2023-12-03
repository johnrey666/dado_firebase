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
import { NoAuthGuard } from './noauth.guard'; // import NoAuthGuard

const routes: Routes = [
  { path: '', redirectTo: 'post-list', pathMatch: 'full' },
  { path: 'post-list', component: PostListComponent, canActivate: [AuthGuard] },
  { path: 'post-add', component: PostEditComponent, canActivate: [AuthGuard] },
  { path: 'Authentication', component: AuthComponent },
  { path: 'post-edit', component: PostEditComponent, canActivate: [AuthGuard] },
  { path: 'post-edit/:index', component: PostEditComponent, canActivate: [AuthGuard] },
  { path: 'login', component: SignInComponent, canActivate: [NoAuthGuard] }, // use NoAuthGuard
  { path: 'signup', component: SignUpComponent, canActivate: [NoAuthGuard] }, // use NoAuthGuard
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
    SignInComponent
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
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { RegisterComponent } from './register/register.component';
import { AuthComponent } from './auth/auth.component';
import { FileServerComponent } from './file-server/file-server.component';

const routes: Routes = [
        { path: '', component: AuthComponent },
        { path: 'register', component: RegisterComponent },
        { path: 'file-server', component: FileServerComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    onSameUrlNavigation: 'reload'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }

import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { CknowHomeComponent } from './cknow-home/cknow-home.component';

export const routes: Routes = [
    { path: '', component: HomeComponent},
    {path: 'login', component: LoginComponent},
    { path: 'home', component: CknowHomeComponent},


];

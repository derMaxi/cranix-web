import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateService  } from '@ngx-translate/core';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { CanActivateViaAcls } from '../../../services/auth-guard.service';
import { CranixSharedModule } from '../../../shared/cranix-shared.module';
import { PipesModule } from '../../../pipes/pipe-modules';
import { UsersPage } from './users.page';

const routes: Routes = [
  {
    path: 'users',
    canActivate: [CanActivateViaAcls],
    component: UsersPage
  },
  {
    path: 'users/:id',
    canLoad: [CanActivateViaAcls],
    loadChildren: () => import('./details/user-details.module').then( m => m.UserDetailsPageModule)
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
    IonicModule,
    CranixSharedModule
  ],
  declarations: [ UsersPage],
  providers: [TranslateService, PipesModule]
})
export class UsersPageModule {}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateService  } from '@ngx-translate/core';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { CanActivateViaAcls } from '../../../services/auth-guard.service';
import { CranixSharedModule } from '../../../shared/cranix-shared.module';
import { PipesModule } from '../../../pipes/pipe-modules';
import { GroupsPage } from './groups.page';

const routes: Routes = [
  {
    path: 'groups',
    canActivate: [CanActivateViaAcls],
    component: GroupsPage
  },
  {
    path: 'groups/:id',
    canLoad: [CanActivateViaAcls],
    loadChildren: () => import('./details/group-details.module').then( m => m.GroupDetailsPageModule)
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
  declarations: [ GroupsPage ],
  providers: [TranslateService, PipesModule]
})
export class GroupsPageModule {}

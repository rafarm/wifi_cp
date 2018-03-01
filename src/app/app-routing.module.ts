import { NgModule } from '@angular/core';
import { Routes, RouterModule } 	from '@angular/router';

import { CanDeactivateGuard } 		from './core/can-deactivate-guard.service';

import { LogoutComponent } 		from './logout.component';
import { PageNotFoundComponent } 	from './not-found.component';

const appRoutes: Routes = [
    {
	path: '', redirectTo: 'content', pathMatch: 'full'
    },
    {
	path: 'logout', component: LogoutComponent
    },
    {
	path: '**', component: PageNotFoundComponent
    }
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes)
  ],
  exports: [
    RouterModule
  ],
  providers: [
    CanDeactivateGuard
  ]
})

export class AppRoutingModule {}

import { NgModule } from '@angular/core';
import { Routes, RouterModule } 	from '@angular/router';

import { CanDeactivateGuard }		from '../core/can-deactivate-guard.service';

import { ContentComponent } 		from './content.component';
import { SchedulesComponent } 		from './schedules/schedules.component';
import { GroupsComponent }	 	from './groups/groups.component';

const contentRoutes: Routes = [
    { 
      path: 'content',
      component: ContentComponent,
      children: [
        {
	  path: '',
          redirectTo: 'schedules',
	  pathMatch: 'full'
        },
        {
	  path: 'schedules',
          component: SchedulesComponent
        },
        {
	  path: 'groups',
          component: GroupsComponent,
          canDeactivate: [CanDeactivateGuard]
        }
      ]
    }
];

@NgModule({
    imports: [
	RouterModule.forChild(contentRoutes)
    ],
    exports: [
	RouterModule
    ]
})

export class ContentRoutingModule {}

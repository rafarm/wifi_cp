import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { WifiMaterialModule } from '../wifi-material/wifi-material.module';

import { ContentRoutingModule } from './content-routing.module';

import { ContentService } from './content.service';

import { ContentComponent } from './content.component';
import { SchedulesComponent } from './schedules/schedules.component';
import { ScheduleDetailComponent } from './schedules/schedule-detail.component';
import { GroupsComponent } from './groups/groups.component';
import { GroupDetailComponent } from './groups/group-detail.component';
import { MemberListComponent } from './member-list.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    WifiMaterialModule,
    ContentRoutingModule
  ],
  declarations: [
    ContentComponent,
    SchedulesComponent,
    ScheduleDetailComponent,
    GroupsComponent,
    GroupDetailComponent,
    MemberListComponent
  ],
  providers: [
    ContentService
  ]
})
export class ContentModule { }

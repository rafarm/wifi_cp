import { Component,
         ViewChild,
         OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog,
         MatDialogRef,
         MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs/Observable';

import { ContentService } from '../content.service';
import { CanComponentDeactivate } from '../../core/can-deactivate-guard.service';

import { Schedule } from '../../data-model';
import { ScheduleDetailComponent } from './schedule-detail.component';
import { ConfirmationComponent } from '../../utils/confirmation.component';


@Component({
  selector: 'app-schedules',
  templateUrl: './schedules.component.html',
  styleUrls: ['./schedules.component.css']
})
export class SchedulesComponent implements OnInit/*, CanComponentDeactivate*/ {
  @ViewChild(ScheduleDetailComponent)
  scheduleDetail: ScheduleDetailComponent;

  selectedSchedule: Schedule = null;

  schedulesDataSource = new MatTableDataSource();

  constructor(private contentService: ContentService,
              public dialog: MatDialog ) {
  }

  ngOnInit() {
    this.contentService.getSchedules()
      .subscribe(schedules => this.schedulesDataSource.data = schedules);
  }

  canDeactivate(): Observable<boolean> | boolean {
    if (this.scheduleDetail.scheduleForm.dirty) {
      return this.scheduleDetail.revertDialog();
    }

    return true;
  }

  addNewSchedule() {
    this.selectedSchedule = new Schedule();
  }

  deleteSchedule(schedule: Schedule) {

    let dialogRef = this.dialog.open(ConfirmationComponent, {
      data: {
        title: 'Eliminar autorització',
        content: "Voleu eliminar l'autorització per a l'agrupament " + schedule.grouping_name + "?",
        cancel: 'Cancel·la',
        action: 'Elimina'
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.contentService.deleteSchedule(schedule)
          .subscribe(resp => this.ngOnInit());
      }
    });
  }

  onSaved(saved: boolean) {
    this.selectedSchedule = null;
    if (saved) {
      this.ngOnInit();
    }
  }
}

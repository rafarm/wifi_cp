import { Component,
	 Input,
	 Output,
	 OnInit,
	 OnChanges,
         //ViewChild,
	 EventEmitter } from '@angular/core';
import { FormBuilder,
	 FormGroup,
	 Validators } from '@angular/forms';
import { MatDialog,
         MatDialogRef,
         MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs/Observable';

import { ConfigService } from '../../core/config.service';
import { ContentService } from '../content.service';

import { Schedule } from '../../data-model';
import { Grouping } from '../../data-model';
import { ConfirmationComponent } from '../../utils/confirmation.component';


declare var _user;

class DurationItem {
  constructor(public value: number, public label: string){};
}

@Component({
  selector: 'schedule-detail',
  templateUrl: './schedule-detail.component.html',
  styleUrls: ['./schedule-detail.component.scss']
})
export class ScheduleDetailComponent implements OnInit, OnChanges {
  @Input() schedule: Schedule;
  @Output() onSaved = new EventEmitter<boolean>();

  dateInputType: string = 'text';

  scheduleForm: FormGroup;

  groupings: Grouping[] = null;
  durations: DurationItem[] = [];

  isAdmin: boolean = false;

  constructor(private fb: FormBuilder,
              private configService: ConfigService,
              private contentService: ContentService,
              public dialog: MatDialog) {
    this.isAdmin = _user.isAdmin;
    this.createForm();
  }

  ngOnInit() {
    this.contentService.getGroupings(true).subscribe((groupings:Grouping[]) => this.groupings = groupings);
    this.populateDurationsArray();
  }

  ngOnChanges() {
    const sch = this.schedule || new Schedule();
    let start = null;
    if (sch.start != null) {
      start = new Date(sch.start);
      let zoneOffset = start.getTimezoneOffset();
      start = this.computeEnd(start, - zoneOffset).toISOString().slice(0, -1);
      
    }
    let end = null;
    if (sch.end != null) {
      end = new Date(sch.end);
      let zoneOffset = end.getTimezoneOffset();
      end = this.computeEnd(end, - zoneOffset).toISOString().slice(0, -1);
    }

    let reset = null;
    if (this.isAdmin) {
      reset = {
        grouping_id: sch.grouping_id,
        start:       start,
        end:         end
      };
    }
    else {
      reset = {
        gruping_id: sch.grouping_id,
        start:       start,
        duration:    this.computeDuration(sch)
      };
    }
    
    this.scheduleForm.reset(reset);
    if (this.schedule != null) {
      this.scheduleForm.enable() 
      this.dateInputType = 'datetime-local';
    }
    else {
      this.scheduleForm.disable();
      this.dateInputType = 'text';
    }
  }

  createForm() {
    let form = null;
    if (this.isAdmin) {
      form = {
        grouping_id: ['', Validators.required],
        start: [null, Validators.required],
        end: [null, Validators.required]
      };
    }
    else {
      form = {
        grouping_id: ['', Validators.required],
        start: [null, Validators.required],
        duration: [null, Validators.required]
      };
    }

    this.scheduleForm = this.fb.group(form);
    this.scheduleForm.disable();
  }

  private populateDurationsArray() {
    const minDuration = this.configService.minAllowed;
    const maxDuration = this.configService.maxAllowed;
    const durationStep = this.configService.allowedStep;

    for (var i = minDuration; i <= maxDuration; i += durationStep) {
      this.durations.push(new DurationItem(i, '' + i + ' min.'));
    }
  }

  private computeDuration(sch: Schedule): number | null {
    const minDuration = this.configService.minAllowed;
    const maxDuration = this.configService.maxAllowed;
    const durationStep = this.configService.allowedStep;
    
    if (sch.start != null && sch.end != null) {
        // Duration in minutes
        let start = new Date(sch.start);
        let end = new Date(sch.end);
        let duration = (end.getTime() - start.getTime()) / 60000;

        // Round to corresponding step
        duration =  Math.floor(duration / durationStep) * durationStep;

        return Math.min(maxDuration, Math.max(minDuration, duration));
    }

    return null;
  }

  submit() {
    this.contentService.updateSchedule(this.prepareSaveSchedule())
      .subscribe((resp: any) => {
        this.onSaved.emit(true);
      });
  }

  revert() {
    if (this.scheduleForm.dirty) {
      this.revertDialog().subscribe(result => {
        if (result) {     
          this.onSaved.emit(false);
        }
      });
      return;
    }
    this.onSaved.emit(false);  
  }

  revertDialog(): Observable<boolean> {
    let dialogRef = this.dialog.open(ConfirmationComponent, {
      data: {
        title: 'Descartar canvis',
        content: "Voleu descartar els canvis de l'autorització per a l'agrupament " + this.schedule.grouping_name + "?",
        cancel: 'Cancel·la',
        action: 'Descarta'
      },
      disableClose: true
    });
    return dialogRef.afterClosed()
  }

  private prepareSaveSchedule(): Schedule {
    const formModel = this.scheduleForm.value;

    const saveSchedule = new Schedule();
    if (this.schedule) {
      saveSchedule._id = this.schedule._id;
      saveSchedule.owner_id = this.schedule.owner_id;
    }
    saveSchedule.grouping_id = formModel.grouping_id as string;
    saveSchedule.start = new Date(formModel.start);
    saveSchedule.end = this.isAdmin ? new Date(formModel.end) : this.computeEnd(saveSchedule.start, formModel.duration);
    
    return saveSchedule
  }

  private computeEnd(start: Date, duration: number): Date {
    return new Date(start.getTime() + duration * 60000);
  }
}

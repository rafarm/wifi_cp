import { Component,
	 Input,
	 Output,
	 OnInit,
	 OnChanges,
	 EventEmitter } from '@angular/core';
import { FormBuilder,
	 FormGroup,
	 Validators } from '@angular/forms';
import { MatDialog,
         MatDialogRef,
         MAT_DIALOG_DATA } from '@angular/material/dialog';
//import { MatSelectChange } from '@angular/material/select';
import { Observable } from 'rxjs/Observable';

import { ContentService } from '../content.service';

import { Schedule } from '../../data-model';
import { Grouping } from '../../data-model';
import { ConfirmationComponent } from '../../utils/confirmation.component';


@Component({
  selector: 'schedule-detail',
  templateUrl: './schedule-detail.component.html',
  styleUrls: ['./schedule-detail.component.scss']
})
export class ScheduleDetailComponent implements OnInit, OnChanges {
  @Input() schedule: Schedule;
  @Output() onSaved = new EventEmitter<boolean>();

  scheduleForm: FormGroup;

  groupings: Grouping[] = null;

  constructor(private fb: FormBuilder,
              private contentService: ContentService,
              public dialog: MatDialog) {
    this.createForm();
  }

  ngOnInit() {
    this.contentService.getGroupings(true).subscribe((groupings:Grouping[]) => this.groupings = groupings);
  }

  ngOnChanges() {
    const sch = this.schedule || new Schedule();
    this.scheduleForm.reset({
      grouping_id: sch.grouping_id/*,
      start:       sch.start,
      end:     gr.members*/
    });
    this.schedule != null ? this.scheduleForm.enable() : this.scheduleForm.disable();
  }

  createForm() {
    this.scheduleForm = this.fb.group({
      grouping_id: ['', Validators.required ]/*,
      description: '',
      members: []*/
    });
    this.scheduleForm.disable();
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
    //saveSchedule.start = formModel.start as Date;
    //saveSchedule.end = formModel.end as Date;
    
    return saveSchedule
  }
}

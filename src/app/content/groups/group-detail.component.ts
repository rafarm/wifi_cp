import { Component,
	 Input,
	 Output,
	 OnInit,
	 OnChanges,
	 EventEmitter,
	 ViewChild } from '@angular/core';
import { FormBuilder,
	 FormGroup,
	 Validators } from '@angular/forms';
import { MatDialog,
         MatDialogRef,
         MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatStepper } from '@angular/material/stepper';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Observable } from 'rxjs/Observable';

import { ContentService } from '../content.service';
import { MemberListComponent } from './member-list.component';
import { MemberListChange } from './member-list.component';

import { Group } from '../../data-model';
import { User } from '../../data-model';
import { Grouping } from '../../data-model';
import { ConfirmationComponent } from '../../utils/confirmation.component';


@Component({
  selector: 'group-detail',
  templateUrl: './group-detail.component.html',
  styleUrls: ['./group-detail.component.scss']
})
export class GroupDetailComponent implements OnInit, OnChanges {
  @Input() grouping: Grouping;
  @Output() onSaved = new EventEmitter<boolean>();

  @ViewChild(MemberListComponent)
  private listComponent;
  @ViewChild(MatStepper)
  private stepper;

  smallWidth: boolean;
  
  groupingForm: FormGroup;

  groups: Group[] = null;
  groupMembers: User[] = null;
  selectedGroup: Group = null;
  selectedGroupMembers: string[] = null;

  constructor(private fb: FormBuilder,
              private contentService: ContentService,
              public dialog: MatDialog,
	      public breakpointObserver: BreakpointObserver) {
    breakpointObserver.observe('(min-width: 712px)').subscribe(result => this.smallWidth = result.matches);
    this.createForm();
  }

  ngOnInit() {
    this.contentService.getGroups().subscribe((groups:Group[]) => this.groups = groups);
  }

  ngOnChanges() {
    const gr = this.grouping || new Grouping();
    this.groupingForm.reset({
      name:        gr.name,
      description: gr.description,
      members:     gr.members
    });
    this.selectedGroup = null;
    this.groupMembers = null;
    this.selectedGroupMembers = null;
    if (this.grouping) {
      this.groupingForm.enable();
    }
    else {
      this.groupingForm.disable();
    }
  }

  createForm() {
    this.groupingForm = this.fb.group({
      name: ['', Validators.required ],
      description: '',
      members: []
    });
    this.groupingForm.disable();
  }

  submit() {
    this.contentService.updateGrouping(this.prepareSaveGrouping())
      .subscribe((resp: any) => {
        this.emitSaved(true);
      });
  }

  revert() {
    if (this.groupingForm.dirty) {
      this.revertDialog().subscribe(result => {
        if (result) {     
          this.emitSaved(false);
        }
      });
      return;
    }
    this.emitSaved(false);  
  }

  private emitSaved(saved: boolean) {
    // Reset stepper...
    if (this.stepper != null) {
      this.stepper.reset();
    }
    this.onSaved.emit(saved);
  }

  revertDialog(): Observable<boolean> {
    let dialogRef = this.dialog.open(ConfirmationComponent, {
      data: {
        title: 'Descartar canvis',
        content: "Voleu descartar els canvis de l'agrupament " + this.grouping.name + "?",
        cancel: 'Cancel·la',
        action: 'Descarta'
      },
      disableClose: true
    });
    return dialogRef.afterClosed()
  }

  private populateSelectedGroupMembers(members: User[]) {
    const currentMembers = this.listComponent.value;
    this.selectedGroupMembers = [];
    
    members.forEach(member => {
	if (currentMembers.findIndex(elem => elem.uid == member.uid) > -1) {
          this.selectedGroupMembers.push(member.uid);
        }
    })
  }

  private updateListComponent(change: string[]) {
    const currentMembers = this.listComponent.value;

    this.groupMembers.forEach(grMember => {
      const index = currentMembers.findIndex(elem => elem.uid == grMember.uid);

      if (change.findIndex(uid => uid == grMember.uid) < 0) {
        // 'grMember' not found in changed list, so remove it
        //  from 'listComponent', if contained...
        if (index >= 0) {
          currentMembers.splice(index, 1);
        }
      }
      else {
        // 'grMember' found in changed list, so add it
        //  to 'listComponent', if not contained...
        if (index < 0) {
          currentMembers.push(grMember);
        }
      }
    });

    this.listComponent.value = currentMembers;
  }

  groupSelectChanged(change: MatSelectChange) {
    this.contentService.getMembers(change.value).subscribe((members:User[]) => {
      this.groupMembers = members;
      this.populateSelectedGroupMembers(members);
    });
  }

  groupMemberSelectChanged(change: MatSelectChange) {
    this.updateListComponent(change.value);
  }

  wifiMembersChanged(change: MemberListChange) {
    if (this.groupMembers != null) {
      this.populateSelectedGroupMembers(this.groupMembers);
    }
  }

  allMembersCheckboxChanged(change: MatCheckboxChange) {
    this.selectedGroupMembers = [];
    if (change.checked) {
      this.groupMembers.forEach(member => this.selectedGroupMembers.push(member.uid));
    }

    this.updateListComponent(this.selectedGroupMembers);
  }

  get allMembersSelected(): boolean {
    if (this.selectedGroupMembers != null) {
      return this.selectedGroupMembers.length == this.groupMembers.length;
    }

    return false;
  }

  get someMembersSelected(): boolean {
    if (this.selectedGroupMembers != null) {
      const selectedLength = this.selectedGroupMembers.length;
      return selectedLength > 0 && selectedLength < this.groupMembers.length;
    }

    return false;
  }

  private prepareSaveGrouping(): Grouping {
    const formModel = this.groupingForm.value;

    const saveGrouping = new Grouping();
    if (this.grouping) {
      saveGrouping._id = this.grouping._id;
      saveGrouping.owner_id = this.grouping.owner_id;
    }
    saveGrouping.name = formModel.name as string;
    saveGrouping.description = formModel.description as string;
    saveGrouping.members = formModel.members as User[];
    
    return saveGrouping
  }
}

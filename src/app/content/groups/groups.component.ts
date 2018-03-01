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

import { Grouping } from '../../data-model';
import { GroupDetailComponent } from './group-detail.component';
import { ConfirmationComponent } from '../../utils/confirmation.component';


@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.css']
})
export class GroupsComponent implements OnInit, CanComponentDeactivate {
  @ViewChild(GroupDetailComponent)
  groupDetail: GroupDetailComponent;

  selectedGrouping: Grouping = null;

  groupingsDataSource = new MatTableDataSource();

  constructor(private contentService: ContentService,
              public dialog: MatDialog ) {
  }

  ngOnInit() {
    this.contentService.getGroupings()
      .subscribe(groupings => this.groupingsDataSource.data = groupings);
  }

  canDeactivate(): Observable<boolean> | boolean {
    if (this.groupDetail.groupingForm.dirty) {
      return this.groupDetail.revertDialog();
    }

    return true;
  }

  addNewGrouping() {
    this.selectedGrouping = new Grouping();
  }

  deleteGrouping(grouping: Grouping) {

    let dialogRef = this.dialog.open(ConfirmationComponent, {
      data: {
        title: 'Eliminar agrupament',
        content: "Voleu eliminar l'agrupament " + grouping.name + "? " +
                 "Si esborreu l'agrupament es perdran totes " +
                 "les seues autoritzacions.",
        cancel: 'Cancel·la',
        action: 'Elimina'
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.contentService.deleteGrouping(grouping)
          .subscribe(resp => this.ngOnInit());
      }
    });
  }

  onSaved(saved: boolean) {
    this.selectedGrouping = null;
    if (saved) {
      this.ngOnInit();
    }
  }
}

import { Component,
         OnDestroy,
         Input,
         Output,
         EventEmitter,
         HostBinding,
	 ViewChild,
         ElementRef,
	 Optional,
	 Self } from '@angular/core';
import { NgControl, ControlValueAccessor } from '@angular/forms';
import { MatFormFieldControl } from '@angular/material/form-field';
import { MatChipList } from '@angular/material/chips';
import { FocusMonitor } from '@angular/cdk/a11y';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Subject } from 'rxjs/Subject';

import { User } from '../data-model';

export class MemberListChange {
  constructor(
    memberList: MemberListComponent,
    change: User[]) {};
}


@Component({
  selector: 'wifi-member-list',
  host: {
    '(blur)': '_onTouched()'
  },
  templateUrl: './member-list.component.html',
  styleUrls: ['./member-list.component.css'],
  providers: [{ provide: MatFormFieldControl,
		useExisting: MemberListComponent }]
})
export class MemberListComponent implements OnDestroy, MatFormFieldControl<User[]> {
  @Output()
  onMemberListChanged = new EventEmitter<MemberListChange>();

  @ViewChild(MatChipList)
  private chipList: MatChipList;

  stateChanges = new Subject<void>();
  static nextId = 0;
  @HostBinding() id = `MemberListComponent-${MemberListComponent.nextId++}`;

  remove(member: User) {
    let index = this._value.indexOf(member);
    if (index > -1) {
      this._value.splice(index, 1);
      if (this._onChange != null) {
        this._onChange(this._value);
      }
      this.onMemberListChanged.emit(this._value);
    }
  }

  @Input()
  get value(): User[] | null {
    return this._value;
  }
  set value(members: User[] | null) {
    this._value = this.cloneMembersArray(members);
    this.stateChanges.next();
    if (this._onChange != null) {
      this._onChange(this._value);
    }
    this.onMemberListChanged.emit(this._value);
  }
  private _value: User[];

  @Input()
  get placeholder() {
    return this._placeholder;
  }
  set placeholder(plh) {
    this._placeholder = plh;
    this.stateChanges.next();
  }
  private _placeholder: string;

  focused = false;

  get empty() {
    return this.value == null || this.value.length == 0;
  }

  get shouldLabelFloat() {
    return this.focused || !this.empty;
  }

  @Input()
  get required() {
    return this._required;
  }
  set required(req) {
    this._required = coerceBooleanProperty(req);
    this.stateChanges.next();
  }
  private _required = false;

  @Input()
  get disabled() {
    return this._disabled;
  }
  set disabled(dis) {
    this._disabled = coerceBooleanProperty(dis);
    this.stateChanges.next();
  }
  private _disabled = false;

  get errorState() {
    return this.ngControl.errors != null;
  }

  controlType = 'member-list';
 
  @HostBinding('attr.aria-describedby') describedBy = '';
  setDescribedByIds(ids: string[]) {
    this.describedBy = ids.join(' ');
  }

  onContainerClick(event: MouseEvent) {
  }

  writeValue(members: User[]): void {
    this._value = this.cloneMembersArray(members);
  }

  private _onChange: (_: any) => void;
  registerOnChange(fn: (_: any) => void): void {
    this._onChange = fn;
  }

  private _onTouched: any;
  registerOnTouched(fn: any): void {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  constructor(private fm: FocusMonitor,
	      private elRef: ElementRef,
              @Optional() @Self() public ngControl: NgControl) {
    fm.monitor(elRef.nativeElement, true).subscribe(origin => {
      this.focused = !!origin;
      this.stateChanges.next();
    });
    if (this.ngControl != null) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngOnDestroy() {
    this.stateChanges.complete();
    this.fm.stopMonitoring(this.elRef.nativeElement);
  }

  private cloneMembersArray(members: User[]): User[] {
    return members.map(user => user);
  }

}

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
import { MatInput } from '@angular/material/input';
import { FocusMonitor } from '@angular/cdk/a11y';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Subject } from 'rxjs/Subject';

export class DatetimePickerChange {
  constructor(
    datetimePicker: DatetimePickerComponent,
    change: Date) {};
}


@Component({
  selector: 'wifi-datetime-picker',
  host: {
    '(blur)': '_onTouched()'
  },
  templateUrl: './datetime-picker.component.html',
  styleUrls: ['./datetime-picker.component.css'],
  providers: [{ provide: MatFormFieldControl,
		useExisting: DatetimePickerComponent }]
})
export class DatetimePickerComponent implements OnDestroy, MatFormFieldControl<Date> {
  @Output()
  onDatetimePickerChanged = new EventEmitter<DatetimePickerChange>();

  @ViewChild('dateInput')
  private dateInput: MatInput;

  stateChanges = new Subject<void>();
  static nextId = 0;
  @HostBinding() id = `DatetimePickerComponent-${DatetimePickerComponent.nextId++}`;

  /*
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
  */

  @Input()
  get value(): Date | null {
    return this._value;
  }
  set value(date: Date | null) {
    this._value = date;
    this.stateChanges.next();
    if (this._onChange != null) {
      this._onChange(this._value);
    }
    this.onDatetimePickerChanged.emit(this._value);
  }
  private _value: Date;

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
    return this.value == null;
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

  controlType = 'datetime-picker';
 
  @HostBinding('attr.aria-describedby') describedBy = '';
  setDescribedByIds(ids: string[]) {
    this.describedBy = ids.join(' ');
  }

  onContainerClick(event: MouseEvent) {
  }

  writeValue(date: Date): void {
    this._value = date;
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
}

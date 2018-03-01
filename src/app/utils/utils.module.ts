import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WifiMaterialModule } from '../wifi-material/wifi-material.module';

import { ConfirmationComponent } from './confirmation.component';

@NgModule({
  imports: [
    CommonModule,
    WifiMaterialModule
  ],
  exports: [
    ConfirmationComponent
  ],
  declarations: [
    ConfirmationComponent
  ],
  entryComponents: [
    ConfirmationComponent
  ]
})
export class UtilsModule { }

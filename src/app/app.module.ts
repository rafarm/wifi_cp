import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { CoreModule } from './core/core.module';

import { AppRoutingModule } from './app-routing.module';
import { WifiMaterialModule } from './wifi-material/wifi-material.module';
import { ContentModule } from './content/content.module';
import { UtilsModule } from './utils/utils.module';

import { AppComponent } from './app.component';
import { LogoutComponent } from './logout.component';
import { PageNotFoundComponent } from './not-found.component';


@NgModule({
  declarations: [
    AppComponent,
    LogoutComponent,
    PageNotFoundComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    WifiMaterialModule,
    CoreModule,
    ContentModule,
    UtilsModule,
    AppRoutingModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

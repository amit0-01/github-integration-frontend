import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DataViewerRoutingModule } from './data-viewer-routing.module';
import { DataViewerComponent } from './data-viewer/data-viewer.component';
import { SharedModule } from '../../shared/shared.module';


@NgModule({
  declarations: [DataViewerComponent],
  imports: [
    CommonModule,
    DataViewerRoutingModule,
    SharedModule
  ]
})
export class DataViewerModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IntegrationsRoutingModule } from './integrations-routing.module';
import { IntegrationsComponent } from './integrations/integrations.component';
import { SharedModule } from '../../shared/shared.module';


@NgModule({
  declarations: [IntegrationsComponent],
  imports: [
    CommonModule,
    IntegrationsRoutingModule,
    SharedModule
  ]
})
export class IntegrationsModule { }

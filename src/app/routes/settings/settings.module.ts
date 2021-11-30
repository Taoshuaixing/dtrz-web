import { SettingsRoutingModule } from './settings-routing.module';
import { PositionAndStaffingComponent } from './settings/position-and-staffing/position-and-staffing.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared';

import { PositionOneComponent } from './settings/position-and-staffing/position-one/position-one.component';
import { PositionStaffingModalEditComponent } from './settings/position-and-staffing/position-staffing-modal-edit/position-staffing-modal-edit.component';
import { NzModalPositionAndAccountComponent } from './settings/position-and-staffing/nz-modal-position-and-account/nz-modal-position-and-account.component';
import { SettingsComponent } from './settings/settings.component';

@NgModule({
  declarations: [
    SettingsComponent,
    PositionAndStaffingComponent,
    PositionOneComponent,
    PositionStaffingModalEditComponent,
    NzModalPositionAndAccountComponent,
  ],
  imports: [CommonModule, SharedModule, SettingsRoutingModule],
  providers: [],
  exports: [],
})
export class SettingsModule {}

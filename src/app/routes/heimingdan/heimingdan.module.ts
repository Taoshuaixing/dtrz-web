import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared';
import { CKEditorModule } from '../../../ckeditor';

import { CrudService } from '../crud.service';
import { EditHeimingdanComponent } from './heimingdan/edit-heimingdan/edit-heimingdan.component';
import { HeimingdanComponent } from './heimingdan/heimingdan.component';
import { HeimingdanRoutingModule } from './heimingdan-routing.module';
import { ListHeimingdanComponent } from './heimingdan/list-heimingdan/list-heimingdan.component';
import { HeiStatusPlatformEditComponent } from './heimingdan/edit-heimingdan/hei-status-platform-edit/hei-status-platform-edit.component';
import { HeiSelectPersonEditComponent } from './heimingdan/edit-heimingdan/hei-select-person-edit/hei-select-person-edit.component';

@NgModule({
  declarations: [
    HeimingdanComponent,
    EditHeimingdanComponent,
    ListHeimingdanComponent,
    HeiStatusPlatformEditComponent,
    HeiSelectPersonEditComponent,
  ],
  imports: [CommonModule, SharedModule, CKEditorModule, HeimingdanRoutingModule],
  providers: [CrudService],
  exports: [],
})
export class HeimingdanModule {}

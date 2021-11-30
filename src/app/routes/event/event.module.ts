import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {EventRoutingModule} from './event-routing.module';
import {EventComponent} from './event/event.component';
import {ConfigurationEventManagementComponent} from "./event/configuration-event-management/configuration-event-management.component";
import {ConfigurationEventRightComponent} from "./event/configuration-event-management/configuration-event-right/configuration-event-right.component";
import {YangbenEventFieldDefineComponent} from "./event/yangben-event-field-define/yangben-event-field-define.component";
import {YangbenEventComponent} from "./event/yangben-event/yangben-event.component";
import {EditYangbenEventComponent} from "./event/yangben-event-field-define/edit-yangben-event/edit-yangben-event.component";
import {NzModalEventUpdateDetailComponent} from "./event/yangben-event/nz-modal-event-update-detail/nz-modal-event-update-detail.component";
import {YangbenEventFieldSettingComponent} from "./event/yangben-event/yangben-event-field-setting/yangben-event-field-setting.component";
import {YangbenEventModalExportComponent} from "./event/yangben-event/yangben-event-modal-export/yangben-event-modal-export.component";
import {YangbenEventSearchSettingComponent} from "./event/yangben-event/yangben-event-search-setting/yangben-event-search-setting.component";
import {YangbenEventSignSettingComponent} from "./event/yangben-event/yangben-event-sign-setting/yangben-event-sign-setting.component";
import {NzModalEventViewDetailComponent} from "./event/yangben-event/nz-modal-event-view-detail/nz-modal-event-view-detail.component";
import {YangbenEventImportComponent} from "./event/yangben-event-import/yangben-event-import.component";
import {YangbenEventTemplatePlaceComponent} from "./event/yangben-event/yangben-event-template-place/yangben-event-template-place.component";
import {YangbenEventPlaceConfigSettingComponent} from "./event/yangben-event/yangben-event-template-place/yangben-event-place-config-setting/yangben-event-place-config-setting.component";
import {YangbenEventModalImportComponent} from "./event/yangben-event/yangben-event-modal-import/yangben-event-modal-import.component";
import {YangbenEventImportDetailComponent} from "./event/yangben-event-import/yangben-event-import-detail/yangben-event-import-detail.component";
import {SharedModule} from "@shared";
import {CKEditorModule} from "../../../ckeditor";
import {TypeModule} from "../type/type.module";
import {DragulaModule} from "ng2-dragula";
import {PdfJsViewerModule} from "ng2-pdfjs-viewer";
import {YangbenModule} from "../yangben/yangben.module";
import {NzModalAsyncClassificationComponent} from "./event/configuration-event-management/nz-modal-async-classification/nz-modal-async-classification.component";


@NgModule({
  declarations: [
    EventComponent,
    ConfigurationEventManagementComponent,
    ConfigurationEventRightComponent,
    YangbenEventFieldDefineComponent,
    YangbenEventComponent,
    EditYangbenEventComponent,
    NzModalEventUpdateDetailComponent,
    YangbenEventFieldSettingComponent,
    YangbenEventModalExportComponent,
    YangbenEventSearchSettingComponent,
    YangbenEventSignSettingComponent,
    NzModalEventViewDetailComponent,
    YangbenEventImportComponent,
    YangbenEventTemplatePlaceComponent,
    YangbenEventPlaceConfigSettingComponent,
    YangbenEventModalImportComponent,
    YangbenEventImportDetailComponent,
    NzModalAsyncClassificationComponent,
  ],
  imports: [
    CommonModule,
    EventRoutingModule,
    SharedModule,
    CKEditorModule,
    TypeModule,
    DragulaModule.forRoot(),
    PdfJsViewerModule,
    YangbenModule
  ],
  exports: [NzModalEventUpdateDetailComponent],
})
export class EventModule { }

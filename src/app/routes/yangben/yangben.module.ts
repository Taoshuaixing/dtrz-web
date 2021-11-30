import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { YangbenRoutingModule } from './yangben-routing.module';
import { YangbenComponent } from './yangben/yangben.component';
import { YangbenDataComponent } from './yangben/yangben-data/yangben-data.component';
import { SharedModule } from '@shared';
import { CKEditorModule } from '../../../ckeditor';
import { TypeModule } from '../type/type.module';
import { YangbenFieldDefineComponent } from './yangben/yangben-field-define/yangben-field-define.component';
import { EditYangbenComponent } from './yangben/yangben-field-define/edit-yangben/edit-yangben.component';
import { YangbenDataFieldSettingComponent } from './yangben/yangben-data/yangben-data-field-setting/yangben-data-field-setting.component';
import { YangbenDataSearchSettingComponent } from './yangben/yangben-data/yangben-data-search-setting/yangben-data-search-setting.component';
import { NzModalEditComponent } from './yangben/nz-modal-edit/nz-modal-edit.component';
import { YangbenService } from './yangben.service';
import { YangbenDataModalExportComponent } from './yangben/yangben-data/yangben-data-modal-export/yangben-data-modal-export.component';
import { YangbenDataModalImportComponent } from './yangben/yangben-data/yangben-data-modal-import/yangben-data-modal-import.component';
import { YangbenDataImportComponent } from './yangben/yangben-data/yangben-data-import/yangben-data-import.component';
import { YangbenDataImportDetailComponent } from './yangben/yangben-data/yangben-data-import/yangben-data-import-detail/yangben-data-import-detail.component';
import { YangbenDataSignSettingComponent } from './yangben/yangben-data/yangben-data-sign-setting/yangben-data-sign-setting.component';
import { NzModalUpdateDetailComponent } from './yangben/yangben-data/nz-modal-update-detail/nz-modal-update-detail.component';
import { YangbenAnalysisComponent } from './yangben/yangben-analysis/yangben-analysis.component';
import { YangbenOptionConfigComponent } from './yangben/yangben-option-config/yangben-option-config.component';
import { YangbenDataFieldSettingPostComponent } from './yangben/yangben-data/yangben-data-field-setting-post/yangben-data-field-setting-post.component';
import { YangbenTemplatePlaceComponent } from './yangben/yangben-template/yangben-template-place/yangben-template-place.component';
import { YangbenTemplatePostComponent } from './yangben/yangben-template/yangben-template-post/yangben-template-post.component';
import { YangbenPlaceConfigSettingComponent } from './yangben/yangben-template/yangben-template-place/yangben-place-config-setting/yangben-place-config-setting.component';
import { YangbenPostConfigSettingComponent } from './yangben/yangben-template/yangben-template-post/yangben-post-config-setting/yangben-post-config-setting.component';
import { YangbenDataFieldSettingShareMeComponent } from './yangben/yangben-data/yangben-data-field-setting-share-me/yangben-data-field-setting-share-me.component';
import { YangbenSelectionComponent } from './yangben/yangben-selection/yangben-selection.component';
import { NzModalViewDetailComponent } from './yangben/yangben-data/nz-modal-view-detail/nz-modal-view-detail.component';
import { YangbenSimilarListComponent } from './yangben/yangben-data/yangben-similar-list/yangben-similar-list.component';
import { DragulaModule } from 'ng2-dragula';
import { YangbenOptionStatForPostComponent } from './yangben/yangben-option-stat-for-post/yangben-option-stat-for-post.component';
import { YangbenOptionStatForPostDTComponent } from './yangben/yangben-option-stat-for-post-dt/yangben-option-stat-for-post-dt.component';
import { YangbenOptionStatForWenziComponent } from './yangben/yangben-option-stat-for-wenzi/yangben-option-stat-for-wenzi.component';
import { NzModalViewPdfComponent } from './yangben/yangben-data/nz-modal-view-pdf/nz-modal-view-pdf.component';
import { PdfJsViewerModule } from 'ng2-pdfjs-viewer';
import { NzModalTextareaComponent } from './yangben/nz-modal-textarea/nz-modal-textarea.component';
import {YangbenTemplateOptionFieldSettingComponent} from "./yangben/yangben-template/yangben-template-place/yangben-template-option-field-setting/yangben-template-option-field-setting.component";
import {YangbenDataStatComponent } from './yangben/yangben-data-stat/yangben-data-stat.component';

@NgModule({
  declarations: [
    YangbenComponent,
    YangbenDataComponent,
    YangbenFieldDefineComponent,
    YangbenDataFieldSettingComponent,
    YangbenDataSearchSettingComponent,
    EditYangbenComponent,
    NzModalEditComponent,
    YangbenDataImportComponent,
    YangbenDataModalImportComponent,
    YangbenDataModalExportComponent,
    YangbenDataImportDetailComponent,
    YangbenDataSignSettingComponent,
    NzModalUpdateDetailComponent,
    YangbenAnalysisComponent,
    YangbenOptionConfigComponent,
    YangbenDataFieldSettingPostComponent,
    YangbenTemplatePlaceComponent,
    YangbenTemplatePostComponent,
    YangbenPlaceConfigSettingComponent,
    YangbenPostConfigSettingComponent,
    YangbenDataFieldSettingShareMeComponent,
    YangbenSelectionComponent,
    NzModalViewDetailComponent,
    YangbenSimilarListComponent,
    YangbenOptionStatForPostComponent,
    YangbenOptionStatForPostDTComponent,
    YangbenOptionStatForWenziComponent,
    NzModalViewPdfComponent,
    NzModalTextareaComponent,
    YangbenTemplateOptionFieldSettingComponent,
    YangbenDataStatComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    CKEditorModule,
    TypeModule,
    YangbenRoutingModule,
    DragulaModule.forRoot(),
    PdfJsViewerModule,
  ],
  providers: [YangbenService],
  exports: [NzModalEditComponent],
})
export class YangbenModule {}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZhanghaoRoutingModule } from './zhanghao-routing.module';
import { ZhanghaoComponent } from './zhanghao/zhanghao.component';
import { ZhanghaoDataComponent } from './zhanghao/zhanghao-data/zhanghao-data.component';
import { ZhanghaoFieldDefineComponent } from './zhanghao/zhanghao-field-define/zhanghao-field-define.component';
import { EditZhanghaoComponent } from './zhanghao/zhanghao-field-define/edit-zhanghao/edit-zhanghao.component';
import { ZhanghaoOptionConfigComponent } from './zhanghao/zhanghao-option-config/zhanghao-option-config.component';
import { ZhanghaoOptionStatForPostComponent } from './zhanghao/zhanghao-option-stat-for-post/zhanghao-option-stat-for-post.component';
import { ZhanghaoDataImportComponent } from './zhanghao/zhanghao-data/zhanghao-data-import/zhanghao-data-import.component';
import { ZhanghaoDataImportDetailComponent } from './zhanghao/zhanghao-data/zhanghao-data-import/zhanghao-data-import-detail/zhanghao-data-import-detail.component';
import { ZhanghaoSimilarListComponent } from './zhanghao/zhanghao-data/zhanghao-similar-list/zhanghao-similar-list.component';
import { ZhanghaoTemplatePlaceComponent } from './zhanghao/zhanghao-template/zhanghao-template-place/zhanghao-template-place.component';
import { ZhanghaoPlaceConfigSettingComponent } from './zhanghao/zhanghao-template/zhanghao-template-place/zhanghao-place-config-setting/zhanghao-place-config-setting.component';
import { ZhanghaoPostConfigSettingComponent } from './zhanghao/zhanghao-template/zhanghao-template-post/yangben-post-config-setting/zhanghao-post-config-setting.component';
import { ZhanghaoTemplatePostComponent } from './zhanghao/zhanghao-template/zhanghao-template-post/zhanghao-template-post.component';
import { ZhanghaoDataFieldSettingComponent } from './zhanghao/zhanghao-data/zhanghao-data-field-setting/zhanghao-data-field-setting.component';
import { ZhanghaoDataSignSettingComponent } from './zhanghao/zhanghao-data/zhanghao-data-sign-setting/zhanghao-data-sign-setting.component';
import { ZhanghaoDataSearchSettingComponent } from './zhanghao/zhanghao-data/zhanghao-data-search-setting/zhanghao-data-search-setting.component';
import { ZhanghaoDataModalImportComponent } from './zhanghao/zhanghao-data/zhanghao-data-modal-import/zhanghao-data-modal-import.component';
import { ZhanghaoDataModalExportComponent } from './zhanghao/zhanghao-data/zhanghao-data-modal-export/zhanghao-data-modal-export.component';
import { ZhanghaoDataFieldSettingShareMeComponent } from './zhanghao/zhanghao-data/zhanghao-data-field-setting-share-me/zhanghao-data-field-setting-share-me.component';
import { ZhanghaoDataFieldSettingPostComponent } from './zhanghao/zhanghao-data/zhanghao-data-field-setting-post/zhanghao-data-field-setting-post.component';
import { SharedModule } from '@shared';
import { CKEditorModule } from '../../../ckeditor';
import { TypeModule } from '../type/type.module';
import { DragulaModule } from 'ng2-dragula';
import { PdfJsViewerModule } from 'ng2-pdfjs-viewer';
import { ZhanghaoService } from './zhanghao.service';
import { NzModalUpdateDetailComponent } from './zhanghao/zhanghao-data/nz-modal-update-detail/nz-modal-update-detail.component';
import { NzModalViewDetailComponent } from './zhanghao/zhanghao-data/nz-modal-view-detail/nz-modal-view-detail.component';
import { NzModalViewPdfComponent } from './zhanghao/zhanghao-data/nz-modal-view-pdf/nz-modal-view-pdf.component';
import { NzModalEditComponent } from './zhanghao/nz-modal-edit/nz-modal-edit.component';

@NgModule({
  declarations: [
    ZhanghaoComponent,
    ZhanghaoDataComponent,
    ZhanghaoFieldDefineComponent,
    EditZhanghaoComponent,
    ZhanghaoOptionConfigComponent,
    ZhanghaoOptionStatForPostComponent,
    ZhanghaoDataImportComponent,
    ZhanghaoDataImportDetailComponent,
    ZhanghaoSimilarListComponent,
    ZhanghaoTemplatePlaceComponent,
    ZhanghaoPlaceConfigSettingComponent,
    ZhanghaoTemplatePostComponent,
    ZhanghaoPostConfigSettingComponent,
    ZhanghaoDataFieldSettingComponent,
    ZhanghaoDataSignSettingComponent,
    ZhanghaoDataSearchSettingComponent,
    ZhanghaoDataModalImportComponent,
    ZhanghaoDataModalExportComponent,
    ZhanghaoDataFieldSettingShareMeComponent,
    ZhanghaoDataFieldSettingPostComponent,
    NzModalUpdateDetailComponent,
    NzModalViewDetailComponent,
    NzModalViewPdfComponent,
    NzModalEditComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    CKEditorModule,
    TypeModule,
    DragulaModule.forRoot(),
    PdfJsViewerModule,
    ZhanghaoRoutingModule,
  ],
  providers: [ZhanghaoService],
})
export class ZhanghaoModule {}

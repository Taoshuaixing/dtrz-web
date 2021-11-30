import { CommonModule } from '@angular/common';
import { NgModule, Type } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DelonACLModule } from '@delon/acl';
import { DelonFormModule } from '@delon/form';
import { AlainThemeModule } from '@delon/theme';
import { TranslateModule } from '@ngx-translate/core';

import { SHARED_DELON_MODULES } from './shared-delon.module';
import { SHARED_ZORRO_MODULES } from './shared-zorro.module';
// #region third libs
import { CountdownModule } from 'ngx-countdown';
import { CommonInputModalComponent } from '@shared/common-input-modal/common-input-modal.component';
import { HighlightPipe } from '@shared/utils/highlight-pipe.pipe';
import { SortModalComponent } from '@shared/sort-modal/sort-modal.component';
import { SafeModule } from '@shared/safe/safe.module';
import { DragulaModule } from 'ng2-dragula';
import { TimelineComponent } from './timeline/timeline.component';
import { CommonService } from '@shared/service/common-service';
import { MyeditorComponent } from '@shared/myeditor/myeditor.component';
import { NgxTinymceModule } from 'ngx-tinymce';
import { SafeHtmlPipe } from '@shared/utils/safe-html-pipe';
import { AvatarUploaderComponent } from './avatar-uploader/avatar-uploader.component';

const THIRDMODULES = [
  CountdownModule,
  // , UEditorModule
  // , NgxTinymceModule
];
// #endregion

// #region your componets & directives
const COMPONENTS: Type<any>[] = [];
const DIRECTIVES: Type<any>[] = [];
// #endregion

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    AlainThemeModule.forChild(),
    DelonACLModule,
    DelonFormModule,
    DragulaModule.forRoot(),
    NgxTinymceModule.forRoot({
      baseURL: './assets/tinymce/',
    }),
    ...SHARED_DELON_MODULES,
    ...SHARED_ZORRO_MODULES,
    // third libs
    ...THIRDMODULES,
  ],
  declarations: [
    // your components
    ...COMPONENTS,
    ...DIRECTIVES,
    CommonInputModalComponent,
    AvatarUploaderComponent,
    HighlightPipe,
    SafeHtmlPipe,
    SortModalComponent,
    TimelineComponent,
    MyeditorComponent,
  ],
  providers: [CommonService],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    AlainThemeModule,
    DelonACLModule,
    DelonFormModule,
    SafeModule,
    CommonInputModalComponent,
    // i18n
    TranslateModule,
    HighlightPipe,
    SafeHtmlPipe,
    SortModalComponent,
    TimelineComponent,
    MyeditorComponent,
    AvatarUploaderComponent,
    // third libs
    ...THIRDMODULES,
    // your components
    ...COMPONENTS,
    ...DIRECTIVES,
    ...SHARED_DELON_MODULES,
    ...SHARED_ZORRO_MODULES,
  ],
})
export class SharedModule {}

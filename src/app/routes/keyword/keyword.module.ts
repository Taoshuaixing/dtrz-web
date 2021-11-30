import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { KeywordRoutingModule } from './keyword-routing.module';
import { KeywordComponent } from './keyword/keyword.component';
import { KeywordListComponent } from './keyword/keyword-list/keyword-list.component';
import { KeywordImportComponent } from './keyword/keyword-import/keyword-import.component';
import { KeywordInstructComponent } from './keyword/keyword-instruct/keyword-instruct.component';
import { KeywordThemesComponent } from './keyword/keyword-themes/keyword-themes.component';
import {SharedModule} from "@shared";
import { NzModalKeywordEditComponent } from './keyword/keyword-list/nz-modal-keyword-edit/nz-modal-keyword-edit.component';
import {YangbenModule} from "../yangben/yangben.module";


@NgModule({
  declarations: [KeywordComponent, KeywordListComponent, KeywordImportComponent, KeywordInstructComponent, KeywordThemesComponent, NzModalKeywordEditComponent],
  imports: [
    CommonModule,
    SharedModule,
    KeywordRoutingModule,
    YangbenModule
  ]
})
export class KeywordModule { }

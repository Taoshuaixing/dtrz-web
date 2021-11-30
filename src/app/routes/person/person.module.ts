import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PersonRoutingModule} from './person-routing.module';
import {PersonComponent} from './person/person.component';
import {SharedModule} from '@shared';
import {CKEditorModule} from '../../../ckeditor';
import {EditPersonComponent} from './edit-person/edit-person.component';
import {CrudService} from '../crud.service';
import {ReadonlyPersonComponent} from './readonly-person/readonly-person.component';
import {EditPersonBaseComponent} from './edit-person-base/edit-person-base.component';
import {ListPersonComponent} from './person/list-person/list-person.component';
import {TypeModule} from '../type/type.module';

@NgModule({
  declarations: [
    PersonComponent,
    EditPersonComponent,
    ReadonlyPersonComponent,
    EditPersonBaseComponent,
    ListPersonComponent,
  ],
  imports: [CommonModule, SharedModule, CKEditorModule, PersonRoutingModule, TypeModule],
  providers: [CrudService],
  exports: [EditPersonBaseComponent],
})
export class PersonModule {
}

/**
 * 人物结构interface
 * */
export interface PersonageI {
  id: number;
  title: string;
  key?: string;
  score?: number;
  brief?: string;
  avatar?: any;
  content?: string;
  contentHtml?: string;
  url?: string;
  status?: number;
  createdTime?: string;
  updatedTime?: string;
  publishTime?: string;
  type?: string;
  baseInfo?: any;
  categories?: any[];
  comments?: any[];
  menus?: any[];
}

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SharedModule} from '@shared';
import {CKEditorModule} from '../../../ckeditor';
import {CrudService} from '../crud.service';
import {WebsiteComponent} from './website/website.component';
import {ListWebsiteComponent} from './website/list-website/list-website.component';
import {WebsiteRoutingModule} from './website-routing.module';
import {TypeModule} from '../type/type.module';
import {EditWebsiteComponent} from './website/edit-website/edit-website.component';
import {EditWebsiteBaseComponent} from './website/edit-website-base/edit-website-base.component';
import {ReadonlyWebsiteComponent} from './website/readonly-website/readonly-website.component';

@NgModule({
  declarations: [
    WebsiteComponent,
    ListWebsiteComponent,
    EditWebsiteComponent,
    EditWebsiteBaseComponent,
    ReadonlyWebsiteComponent,
  ],
  imports: [CommonModule, SharedModule, CKEditorModule, WebsiteRoutingModule, TypeModule],
  providers: [CrudService],
  exports: [],
})
export class WebsiteModule {
}

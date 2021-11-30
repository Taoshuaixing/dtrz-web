import { ExcelDownloadService } from './excelDownload.service';
import { NgModule } from '@angular/core';

import { RouteRoutingModule } from './routes-routing.module';
// dashboard pages
import { DashboardComponent } from './dashboard/dashboard.component';
// passport pages
import { UserLoginComponent } from './passport/login/login.component';
import { UserRegisterComponent } from './passport/register/register.component';
import { UserRegisterResultComponent } from './passport/register-result/register-result.component';
// single pages
import { CallbackComponent } from './callback/callback.component';
import { UserLockComponent } from './passport/lock/lock.component';
// import { EditPersonComponent } from './person/edit-person/edit-person.component';
import { CKEditorModule } from '../../ckeditor';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CrudService } from './crud.service';
import { TypeModule } from './type/type.module';
import { MidLoginComponent } from './passport/mid-login/mid-login.component';

import { SharedModule } from '@shared';
import { FileDownloadService } from './fileDownload.service';
import { StorageService } from './storage.service';

const COMPONENTS = [
  DashboardComponent,
  // passport pages
  UserLoginComponent,
  UserRegisterComponent,
  UserRegisterResultComponent,
  MidLoginComponent,
  // single pages
  CallbackComponent,
  UserLockComponent,
  //
];
const COMPONENTS_NOROUNT = [];

@NgModule({
  imports: [SharedModule, FormsModule, ReactiveFormsModule, RouteRoutingModule, CKEditorModule, TypeModule],
  declarations: [...COMPONENTS, ...COMPONENTS_NOROUNT, MidLoginComponent],
  entryComponents: COMPONENTS_NOROUNT,
  providers: [CrudService, ExcelDownloadService, FileDownloadService, StorageService],
})
export class RoutesModule {}

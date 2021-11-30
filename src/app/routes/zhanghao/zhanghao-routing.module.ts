import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ACLGuard } from '@delon/acl';
import { ZhanghaoComponent } from './zhanghao/zhanghao.component';
import { ZhanghaoDataComponent } from './zhanghao/zhanghao-data/zhanghao-data.component';
import { ZhanghaoFieldDefineComponent } from './zhanghao/zhanghao-field-define/zhanghao-field-define.component';
import { EditZhanghaoComponent } from './zhanghao/zhanghao-field-define/edit-zhanghao/edit-zhanghao.component';
import { ZhanghaoOptionConfigComponent } from './zhanghao/zhanghao-option-config/zhanghao-option-config.component';
import { ZhanghaoOptionStatForPostComponent } from './zhanghao/zhanghao-option-stat-for-post/zhanghao-option-stat-for-post.component';
import { ZhanghaoDataImportComponent } from './zhanghao/zhanghao-data/zhanghao-data-import/zhanghao-data-import.component';
import { ZhanghaoDataImportDetailComponent } from './zhanghao/zhanghao-data/zhanghao-data-import/zhanghao-data-import-detail/zhanghao-data-import-detail.component';
import { ZhanghaoTemplatePlaceComponent } from './zhanghao/zhanghao-template/zhanghao-template-place/zhanghao-template-place.component';
import { ZhanghaoTemplatePostComponent } from './zhanghao/zhanghao-template/zhanghao-template-post/zhanghao-template-post.component';

const routes: Routes = [
  {
    path: '',
    component: ZhanghaoComponent,
    canActivate: [ACLGuard],
    canActivateChild: [ACLGuard],
    data: { guard: { role: ['dagl_admin', 'dagl_post', 'dagl_editor'] } },
    children: [
      {
        path: '',
        // redirectTo: 'zhanghao-data',
        // pathMatch: 'full',
        component: ZhanghaoComponent,
      },
      {
        path: 'zhanghao-data',
        component: ZhanghaoDataComponent,
        data: { title: '账号数据' },
      },

      {
        path: 'zhanghao-field-define',
        component: ZhanghaoFieldDefineComponent,
        data: { title: '字段配置', guard: { role: ['dagl_admin'] } },
      },
      {
        path: 'zhanghao-field-define-edit',
        component: EditZhanghaoComponent,
        data: { title: '自定义字段编辑', guard: { role: ['dagl_admin'] } },
      },
      {
        path: 'zhanghao-option-config',
        component: ZhanghaoOptionConfigComponent,
        data: { title: '字段选项配置', guard: { role: ['dagl_admin'] } },
      },
      {
        path: 'zhanghao-option-stat-for-post',
        component: ZhanghaoOptionStatForPostComponent,
        data: { title: '标签统计' },
      },
      {
        path: 'zhanghao-data-import',
        component: ZhanghaoDataImportComponent,
        data: { title: '账号导入结果' },
      },
      {
        path: 'zhanghao-data-import-detail',
        component: ZhanghaoDataImportDetailComponent,
        data: { title: '账号导入详情' },
      },

      {
        path: 'zhanghao-template-place',
        component: ZhanghaoTemplatePlaceComponent,
        data: { title: '导入模板配置', guard: { role: ['dagl_admin'] } },
      },
      {
        path: 'zhanghao-template-post',
        component: ZhanghaoTemplatePostComponent,
        data: { title: '账号岗位模板配置', guard: { role: ['dagl_admin'] } },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ZhanghaoRoutingModule {}

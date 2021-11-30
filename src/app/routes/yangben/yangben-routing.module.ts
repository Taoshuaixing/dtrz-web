import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { YangbenComponent } from './yangben/yangben.component';
import { YangbenDataComponent } from './yangben/yangben-data/yangben-data.component';
import { YangbenFieldDefineComponent } from './yangben/yangben-field-define/yangben-field-define.component';
import { EditYangbenComponent } from './yangben/yangben-field-define/edit-yangben/edit-yangben.component';
import { YangbenDataImportComponent } from './yangben/yangben-data/yangben-data-import/yangben-data-import.component';
import { YangbenDataImportDetailComponent } from './yangben/yangben-data/yangben-data-import/yangben-data-import-detail/yangben-data-import-detail.component';
import { ACLGuard } from '@delon/acl';
import { YangbenAnalysisComponent } from './yangben/yangben-analysis/yangben-analysis.component';
import { YangbenOptionConfigComponent } from './yangben/yangben-option-config/yangben-option-config.component';
import { YangbenTemplatePlaceComponent } from './yangben/yangben-template/yangben-template-place/yangben-template-place.component';
import { YangbenTemplatePostComponent } from './yangben/yangben-template/yangben-template-post/yangben-template-post.component';
import { YangbenSelectionComponent } from './yangben/yangben-selection/yangben-selection.component';
import { YangbenOptionStatForPostComponent } from './yangben/yangben-option-stat-for-post/yangben-option-stat-for-post.component';
import { YangbenOptionStatForPostDTComponent } from './yangben/yangben-option-stat-for-post-dt/yangben-option-stat-for-post-dt.component';
import {YangbenDataStatComponent,} from './yangben/yangben-data-stat/yangben-data-stat.component';
import { YangbenOptionStatForWenziComponent } from './yangben/yangben-option-stat-for-wenzi/yangben-option-stat-for-wenzi.component';

const routes: Routes = [
  {
    path: '',
    component: YangbenComponent,
    canActivate: [ACLGuard],
    canActivateChild: [ACLGuard],
    data: { guard: { role: ['dagl_admin', 'dagl_post', 'dagl_editor'] } },
    children: [
      {
        path: '',
        // redirectTo: 'yangben-data',
        // pathMatch: 'full',
        component: YangbenComponent,
      },
      {
        path: 'yangben-data',
        component: YangbenDataComponent,
        data: { title: '样本数据', guard: { role: ['dagl_admin', 'dagl_post','dagl_editor'] } },
      },
      {
        path: 'yangben-analysis',
        component: YangbenAnalysisComponent,
        data: { title: '样本分析' },
      },
      {
        path: 'yangben-field-define',
        component: YangbenFieldDefineComponent,
        data: { title: '字段配置', guard: { role: ['dagl_admin'] } },
      },
      {
        path: 'yangben-field-define-edit',
        component: EditYangbenComponent,
        data: { title: '自定义字段编辑', guard: { role: ['dagl_admin'] } },
      },
      {
        path: 'yangben-option-config',
        component: YangbenOptionConfigComponent,
        data: { title: '字段选项配置', guard: { role: ['dagl_admin', 'dagl_post', 'dagl_editor'] } },
      },
      {
        path: 'yangben-option-stat-for-post',
        component: YangbenOptionStatForPostComponent,
        data: { title: '标签统计', guard: { role: ['dagl_admin', 'dagl_post'] } },
      },
      {
        // 用于大厅的统计
        path: 'yangben-option-stat-for-post-dt',
        component: YangbenOptionStatForPostDTComponent,
        data: { title: '标签统计', guard: { role: ['dagl_admin', 'dagl_post'] } },
      },
      {
        path: 'yangben-data-stat',
        component: YangbenDataStatComponent,
        data: { title: '数据统计', guard: { role: ['dagl_admin', 'dagl_post'] } },
      },
      {
        path: 'yangben-option-stat-for-wenzi',
        component: YangbenOptionStatForWenziComponent,
        data: { title: '标签统计', guard: { role: ['dagl_editor'] } },
      },
      {
        path: 'yangben-data-import',
        component: YangbenDataImportComponent,
        data: { title: '样本导入结果', guard: { role: ['dagl_admin', 'dagl_post'] } },
      },
      {
        path: 'yangben-data-import-detail',
        component: YangbenDataImportDetailComponent,
        data: { title: '样本导入详情', guard: { role: ['dagl_admin', 'dagl_post'] } },
      },
      {
        path: 'yangben-selection',
        component: YangbenSelectionComponent,
        data: { title: '样本选用管理', guard: { role: ['dagl_editor'] } },
      },
      // {
      //   path: 'configuration-event-management',
      //   component: ConfigurationEventManagementComponent,
      //   data: {title: '事件分类', guard: {role: ['dagl_admin']}},
      //   canActivateChild: [ACLGuard],
      //   children: [
      //     {
      //       path: 'configuration-event-right',
      //       component: ConfigurationEventRightComponent,
      //       data: {title: '事件分类'},
      //     },
      //   ],
      // },
      // {
      //   path: 'yangben-event-field-define',
      //   component: YangbenEventFieldDefineComponent,
      //   data: {title: '事件基础字段配置'},
      // },
      // {
      //   path: 'yangben-event-field-define-edit',
      //   component: EditYangbenEventComponent,
      //   data: {title: '自定义事件字段编辑'},
      // },
      // {
      //   path: 'yangben-event',
      //   component: YangbenEventComponent,
      //   data: {title: '事件基础信息管理', guard: {role: ['dagl_admin', 'dagl_post', 'dagl_editor']}},
      // },
      // {
      //   path: 'yangben-event-import',
      //   component: YangbenEventImportComponent,
      //   data: {title: '事件导入管理'},
      // },
      // {
      //   path: 'yangben-event-import-detail',
      //   component: YangbenEventImportDetailComponent,
      //   data: {title: '事件导入详情', guard: {role: ['dagl_admin', 'dagl_post']}},
      // },
      {
        path: 'yangben-template-place',
        component: YangbenTemplatePlaceComponent,
        data: { title: '导入模板配置' },
      },
      {
        path: 'yangben-template-post',
        component: YangbenTemplatePostComponent,
        data: { title: '样本岗位模板配置' },
      },
      // {
      //   path: 'yangben-event-template-place',
      //   component: YangbenEventTemplatePlaceComponent,
      //   data: {title: '导入事件模板配置'},
      // },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class YangbenRoutingModule {}

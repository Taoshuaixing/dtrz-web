import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ACLGuard} from "@delon/acl";
import {ConfigurationEventManagementComponent} from "./event/configuration-event-management/configuration-event-management.component";
import {ConfigurationEventRightComponent} from "./event/configuration-event-management/configuration-event-right/configuration-event-right.component";
import {YangbenEventFieldDefineComponent} from "./event/yangben-event-field-define/yangben-event-field-define.component";
import {EditYangbenEventComponent} from "./event/yangben-event-field-define/edit-yangben-event/edit-yangben-event.component";
import {YangbenEventComponent} from "./event/yangben-event/yangben-event.component";
import {YangbenEventImportComponent} from "./event/yangben-event-import/yangben-event-import.component";
import {YangbenEventImportDetailComponent} from "./event/yangben-event-import/yangben-event-import-detail/yangben-event-import-detail.component";
import {YangbenEventTemplatePlaceComponent} from "./event/yangben-event/yangben-event-template-place/yangben-event-template-place.component";
import {EventComponent} from "./event/event.component";

const routes: Routes = [
  {
    path: '',
    component: EventComponent,
    canActivate: [ACLGuard],
    canActivateChild: [ACLGuard],
    data: {guard: {role: ['dagl_admin', 'dagl_post', 'dagl_editor']}},
    children: [
      {
        path: '',
        // redirectTo: 'yangben-data',
        // pathMatch: 'full',
        component: EventComponent,
      },
      {
        path: 'yangben-event',
        component: YangbenEventComponent,
        data: {title: '样本事件数据', guard: {role: ['dagl_admin', 'dagl_post', 'dagl_editor']}},
      },
      {
        path: 'configuration-event-management',
        component: ConfigurationEventManagementComponent,
        data: {title: '事件分类', guard: {role: ['dagl_admin']}},
        canActivateChild: [ACLGuard],
        children: [
          {
            path: 'configuration-event-right',
            component: ConfigurationEventRightComponent,
            data: {title: '事件分类'},
          },
        ],
      },
      {
        path: 'yangben-event-field-define',
        component: YangbenEventFieldDefineComponent,
        data: {title: '事件基础字段配置'},
      },
      {
        path: 'yangben-event-field-define-edit',
        component: EditYangbenEventComponent,
        data: {title: '自定义事件字段编辑'},
      },
      // {
      //   path: 'yangben-event',
      //   component: YangbenEventComponent,
      //   data: {title: '事件基础信息管理', guard: {role: ['dagl_admin', 'dagl_post', 'dagl_editor']}},
      // },
      {
        path: 'yangben-event-import',
        component: YangbenEventImportComponent,
        data: {title: '事件导入管理'},
      },
      {
        path: 'yangben-event-import-detail',
        component: YangbenEventImportDetailComponent,
        data: {title: '事件导入详情', guard: {role: ['dagl_admin', 'dagl_post']}},
      },
      {
        path: 'yangben-event-template-place',
        component: YangbenEventTemplatePlaceComponent,
        data: {title: '导入事件模板配置'},
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EventRoutingModule { }

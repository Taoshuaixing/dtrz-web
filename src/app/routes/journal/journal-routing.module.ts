import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ACLGuard} from "@delon/acl";
import {JournalComponent} from "./journal/journal.component";
import {JournalReportComponent} from "./journal/journal-report/journal-report.component";
import {JournalSubmittedComponent} from "./journal/journal-submitted/journal-submitted.component";
import {JournalDraftsComponent} from "./journal/journal-drafts/journal-drafts.component";
import {JournalTemplateConfigComponent} from "./journal/journal-template-config/journal-template-config.component";
import {JournalTemplateDetailComponent} from "./journal/journal-template-config/journal-template-detail/journal-template-detail.component";
import {JournalDetailComponent} from "./journal/journal-detail/journal-detail.component";
import {JournalViewComponent} from "./journal/journal-view/journal-view.component";
import {JournalFinishComponent} from "./journal/journal-finish/journal-finish.component";
import {JournalShareComponent} from "./journal/journal-share/journal-share.component";

const routes: Routes = [
  {
    path: '',
    component: JournalComponent,
    canActivate: [ACLGuard],
    canActivateChild: [ACLGuard],
    data: { guard: { role: ['dagl_admin', 'dagl_post', 'dagl_editor'] } },
    children: [
      {
        path: '',
        redirectTo: 'journal-report',
        pathMatch: 'full',
      },
      {
        path: 'journal-report',
        component: JournalReportComponent,
        data: { title: '日志填写', guard: { role: ['dagl_admin', 'dagl_post'] } },
      },
      {
        path: 'journal-submitted',
        component: JournalSubmittedComponent,
        data: { title: '历史日志', guard: { role: ['dagl_admin', 'dagl_post'] } },
      },
      {
        path: 'journal-detail',
        component: JournalDetailComponent,
        data: { title: '日志填写详情', guard: { role: ['dagl_admin', 'dagl_post'] } },
      },
      {
        path: 'journal-drafts',
        component: JournalDraftsComponent,
        data: { title: '草稿箱', guard: { role: ['dagl_admin', 'dagl_post'] } },
      },
      {
        path: 'journal-view',
        component: JournalViewComponent,
        data: { title: '日志排版', guard: { role: ['dagl_admin', 'dagl_post'] } },
      },
      {
        path: 'journal-finish',
        component: JournalFinishComponent,
        data: { title: '日志排版完成', guard: { role: ['dagl_admin', 'dagl_post'] } },
      },
      {
        path: 'journal-share',
        component: JournalShareComponent,
        data: { title: '日志分享', guard: { role: ['dagl_admin', 'dagl_post'] } },
      },
      {
        path: 'journal-template-config',
        component: JournalTemplateConfigComponent,
        data: { title: '模板配置', guard: { role: ['dagl_admin', 'dagl_post'] } },
      },
      {
        path: 'journal-template-detail',
        component: JournalTemplateDetailComponent,
        data: { title: '模板详情', guard: { role: ['dagl_admin', 'dagl_post'] } },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class JournalRoutingModule { }

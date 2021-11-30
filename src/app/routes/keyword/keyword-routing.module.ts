import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ACLGuard } from '@delon/acl';
import { KeywordComponent } from './keyword/keyword.component';
import { KeywordListComponent } from './keyword/keyword-list/keyword-list.component';
import { KeywordImportComponent } from './keyword/keyword-import/keyword-import.component';
import { KeywordInstructComponent } from './keyword/keyword-instruct/keyword-instruct.component';
import { KeywordThemesComponent } from './keyword/keyword-themes/keyword-themes.component';

const routes: Routes = [
  {
    path: '',
    component: KeywordComponent,
    canActivate: [ACLGuard],
    canActivateChild: [ACLGuard],
    data: { guard: { role: ['dagl_admin', 'dagl_post', 'dagl_editor'] } },
    children: [
      {
        path: '',
        redirectTo: 'keyword-list',
        pathMatch: 'full',
      },
      {
        path: 'keyword-list',
        component: KeywordListComponent,
        data: { title: '关键词管理' },
      },
      {
        path: 'keyword-import',
        component: KeywordImportComponent,
        data: { title: '关键词导入' },
      },
      {
        path: 'keyword-instruct',
        component: KeywordInstructComponent,
        data: { title: '指令管理' },
      },
      {
        path: 'keyword-themes',
        component: KeywordThemesComponent,
        data: { title: '主题管理' },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class KeywordRoutingModule {}

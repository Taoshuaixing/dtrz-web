import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EditWebsiteComponent } from './website/edit-website/edit-website.component';
import { ListWebsiteComponent } from './website/list-website/list-website.component';
import { ReadonlyWebsiteComponent } from './website/readonly-website/readonly-website.component';
import { WebsiteComponent } from './website/website.component';

const routes: Routes = [
  {
    path: '',
    component: WebsiteComponent,
    children: [
      {
        path: 'list',
        component: ListWebsiteComponent,
        data: { title: '重点网站列表' },
      },
      {
        path: 'readonly-detail/:id',
        component: ReadonlyWebsiteComponent,
        data: { title: '重点网站详情' },
      },
      {
        path: 'detail/:id',
        component: EditWebsiteComponent,
        data: { title: '重点网站编辑' },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WebsiteRoutingModule {}

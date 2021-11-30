import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EditHeimingdanComponent } from './heimingdan/edit-heimingdan/edit-heimingdan.component';
import { HeimingdanComponent } from './heimingdan/heimingdan.component';
import { ListHeimingdanComponent } from './heimingdan/list-heimingdan/list-heimingdan.component';



const routes: Routes = [
  {
    path: '',
    component: HeimingdanComponent,
    children: [
      {
        path: 'list',
        component: ListHeimingdanComponent,
        data: { title: '黑名单' },

      },
      {
        path: 'edit',
        component: EditHeimingdanComponent,
        data: { title: '黑名单' },

      },
    ]
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HeimingdanRoutingModule {
}

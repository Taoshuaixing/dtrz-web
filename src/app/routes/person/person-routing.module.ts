import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {PersonComponent} from './person/person.component';
import {EditPersonComponent} from './edit-person/edit-person.component';
import {ReadonlyPersonComponent} from './readonly-person/readonly-person.component';
import {ListPersonComponent} from './person/list-person/list-person.component';


const routes: Routes = [
  {
    path: '',
    component: PersonComponent,
    children: [
      {
        path: 'list',
        component: ListPersonComponent,
        data: { title: '人物列表' },

      },
      {
        path: 'readonly-detail/:id',
        component: ReadonlyPersonComponent,
        data: { title: '重点人物档案管理' },

      },
      {
        path: 'detail/:id',
        component: EditPersonComponent,
        data: { title: '重点人物档案管理' },

      },
    ]
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PersonRoutingModule {
}

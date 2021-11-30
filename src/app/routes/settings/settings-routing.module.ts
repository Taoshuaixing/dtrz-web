import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SettingsComponent } from './settings/settings.component';
import { PositionOneComponent } from './settings/position-and-staffing/position-one/position-one.component';
import { PositionAndStaffingComponent } from './settings/position-and-staffing/position-and-staffing.component';
import { ACLGuard } from '@delon/acl';

const routes: Routes = [
  {
    path: '',
    component: SettingsComponent,
    canActivate: [ACLGuard],
    canActivateChild: [ACLGuard],
    data: { guard: { role: ['dagl_admin'] } },
    children: [
      {
        path: '',
        redirectTo: 'position-and-staffing',
        pathMatch: 'full',
      },
      {
        path: 'position-and-staffing',
        component: PositionAndStaffingComponent,
        children: [
          {
            path: 'position-one',
            component: PositionOneComponent,
            data: { title: '人员配置' },
          },
        ],
        data: { title: '岗位及人员配置' },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingsRoutingModule {}

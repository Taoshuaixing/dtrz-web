import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { JWTGuard, SimpleGuard } from '@delon/auth';
import { environment } from '@env/environment';
// layout
import { LayoutDefaultComponent } from '../layout/default/default.component';
import { LayoutFullScreenComponent } from '../layout/fullscreen/fullscreen.component';
import { LayoutPassportComponent } from '../layout/passport/passport.component';
// dashboard pages
import { DashboardComponent } from './dashboard/dashboard.component';
// passport pages
import { UserLoginComponent } from './passport/login/login.component';
import { UserRegisterComponent } from './passport/register/register.component';
import { UserRegisterResultComponent } from './passport/register-result/register-result.component';
// single pages
import { CallbackComponent } from './callback/callback.component';
import { UserLockComponent } from './passport/lock/lock.component';
import { MidLoginComponent } from './passport/mid-login/mid-login.component';
import { AuthGuardServiceGuard } from '../auth-guard-service.guard';
import { ACLGuard } from "@delon/acl";

const routes: Routes = [
  {
    path: '',
    component: LayoutDefaultComponent,
    canActivate: [AuthGuardServiceGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
        // canActivate: [JWTGuard],
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [JWTGuard, ACLGuard],
        data: {
          title: '重点人物档案管理',
        },
      },
      // { path: 'heimingdan', component: HeimingdanComponent, data: { title: '黑名单' } },
      { path: 'exception', loadChildren: () => import('./exception/exception.module').then(m => m.ExceptionModule) },
      { path: 'person', loadChildren: () => import('./person/person.module').then(m => m.PersonModule) },
      { path: 'heimingdan', loadChildren: () => import('./heimingdan/heimingdan.module').then(m => m.HeimingdanModule) },
      { path: 'website', loadChildren: () => import('./website/website.module').then(m => m.WebsiteModule) },
      { path: 'yangben', loadChildren: () => import('./yangben/yangben.module').then(m => m.YangbenModule) },
      { path: 'yuqing-calendar', loadChildren: () => import('./yuqing-calendar/yuqing-calendar.module').then(m => m.YuqingCalendarModule) },
      { path: 'settings', loadChildren: () => import('./settings/settings.module').then(m => m.SettingsModule) },
      { path: 'keyword', loadChildren: () => import('./keyword/keyword.module').then(m => m.KeywordModule) },
      { path: 'zhanghao', loadChildren: () => import('./zhanghao/zhanghao.module').then(m => m.ZhanghaoModule) },
      { path: 'journal', loadChildren: () => import('./journal/journal.module').then(m => m.JournalModule) },
      { path: 'event', loadChildren: () => import('./event/event.module').then(m => m.EventModule) },
    ],
  },

  // person
  // {
  //   path: 'person',
  //   component: LayoutDefaultComponent,
  //   children: [
  //     { path: 'add-person', component: AddPersonComponent, data: { title: '添加人物' } },
  //     { path: 'edit-person', component: EditPersonComponent, data: { title: '添加人物' } },
  //   ]
  // },
  // 全屏布局
  // {
  //     path: 'fullscreen',
  //     component: LayoutFullScreenComponent,
  //     children: [
  //     ]
  // },
  // passport
  {
    path: 'passport',
    component: LayoutPassportComponent,
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login', component: UserLoginComponent, data: { title: '登录', titleI18n: '登录' } },
      // { path: 'register', component: UserRegisterComponent, data: { title: '注册', titleI18n: 'pro-register' } },
      // { path: 'register-result', component: UserRegisterResultComponent, data: { title: '注册结果', titleI18n: 'pro-register-result' } },
      // { path: 'lock', component: UserLockComponent, data: { title: '锁屏', titleI18n: 'lock' } },
      { path: 'mid-login/:ticket', component: MidLoginComponent, data: { title: 'mid-login' } },
    ],
  },
  // 单页不包裹Layout
  { path: 'callback/:type', component: CallbackComponent },
  { path: '**', redirectTo: 'exception/404' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      useHash: environment.useHash,
      // NOTICE: If you use `reuse-tab` component and turn on keepingScroll you can set to `disabled`
      // Pls refer to https://ng-alain.com/components/reuse-tab
      scrollPositionRestoration: 'top',
      relativeLinkResolution: 'legacy'
    }),
  ],
  exports: [RouterModule],
})
export class RouteRoutingModule { }

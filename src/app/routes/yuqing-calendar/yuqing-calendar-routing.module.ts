import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ACLGuard } from '@delon/acl';
import { YuqingCalendarComponent } from './yuqing-calendar/yuqing-calendar.component';
import { YuqingCalendarViewComponent } from './yuqing-calendar/yuqing-calendar-view/yuqing-calendar-view.component';
import { YuqingCalendarFutureComponent } from './yuqing-calendar/yuqing-calendar-future/yuqing-calendar-future.component';
import { YuqingCalendarHistoryTodayComponent } from './yuqing-calendar/yuqing-calendar-history-today/yuqing-calendar-history-today.component';
import { YuqingCalendarHistoryReviewComponent } from './yuqing-calendar/yuqing-calendar-history-review/yuqing-calendar-history-review.component';
import { HistoryReviewEventClassifyComponent } from './yuqing-calendar/yuqing-calendar-history-review/history-review-event-classify/history-review-event-classify.component';
import { EventClassifyTimelineComponent } from './yuqing-calendar/yuqing-calendar-history-review/history-review-event-classify/event-classify-timeline/event-classify-timeline.component';

const routes: Routes = [
  {
    path: '',
    component: YuqingCalendarComponent,
    canActivate: [ACLGuard],
    canActivateChild: [ACLGuard],
    data: { guard: { role: ['dagl_admin', 'dagl_post', 'dagl_editor'] } },
    children: [
      {
        path: '',
        redirectTo: 'yuqing-calendar-view',
        pathMatch: 'full',
      },
      {
        path: 'yuqing-calendar-view',
        component: YuqingCalendarViewComponent,
        data: { title: '舆情日历' },
      },
      {
        path: 'yuqing-calendar-future',
        component: YuqingCalendarFutureComponent,
        data: { title: '未来舆情' },
      },
      {
        path: 'yuqing-calendar-history-today',
        component: YuqingCalendarHistoryTodayComponent,
        data: { title: '历史上的今天' },
      },
      {
        path: 'yuqing-calendar-history-review',
        component: YuqingCalendarHistoryReviewComponent,
        data: { title: '舆情回顾' },
        // canActivateChild: [ ACLGuard ],
        children: [
          {
            path: 'history-review-event-classify',
            component: HistoryReviewEventClassifyComponent,
            data: { title: '历史回顾事件分类' },
            // canActivateChild: [ ACLGuard ],
            children: [
              {
                path: 'event-classify-timeline',
                component: EventClassifyTimelineComponent,
                data: { title: '历史回顾事件' },
              },
            ],
          },
        ],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class YuqingCalendarRoutingModule {}

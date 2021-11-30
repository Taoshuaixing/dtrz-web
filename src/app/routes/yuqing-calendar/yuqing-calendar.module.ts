import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { YuqingCalendarRoutingModule } from './yuqing-calendar-routing.module';
import { YuqingCalendarComponent } from './yuqing-calendar/yuqing-calendar.component';
import { SharedModule } from '@shared';
import { CKEditorModule } from '../../../ckeditor';
import { TypeModule } from '../type/type.module';
import { DragulaModule } from 'ng2-dragula';
import { YuqingCalendarViewComponent } from './yuqing-calendar/yuqing-calendar-view/yuqing-calendar-view.component';

import { YuqingCalendarFutureComponent } from './yuqing-calendar/yuqing-calendar-future/yuqing-calendar-future.component';
import { YangbenModule } from '../yangben/yangben.module';
import { YuqingCalendarHistoryTodayComponent } from './yuqing-calendar/yuqing-calendar-history-today/yuqing-calendar-history-today.component';
import { YuqingCalendarHistoryReviewComponent } from './yuqing-calendar/yuqing-calendar-history-review/yuqing-calendar-history-review.component';
import { HistoryReviewEventClassifyComponent } from './yuqing-calendar/yuqing-calendar-history-review/history-review-event-classify/history-review-event-classify.component';
import { EventClassifyTimelineComponent } from './yuqing-calendar/yuqing-calendar-history-review/history-review-event-classify/event-classify-timeline/event-classify-timeline.component';
import { YuqingCalendarService } from './yuqing.calendar.service';
import {EventModule} from "../event/event.module";

@NgModule({
  declarations: [
    YuqingCalendarComponent,
    YuqingCalendarViewComponent,
    YuqingCalendarHistoryTodayComponent,
    YuqingCalendarFutureComponent,
    YuqingCalendarHistoryReviewComponent,
    HistoryReviewEventClassifyComponent,
    EventClassifyTimelineComponent,
  ],
  imports: [
    CommonModule,
    YuqingCalendarRoutingModule,
    SharedModule,
    CKEditorModule,
    TypeModule,
    EventModule,
    YangbenModule,
    DragulaModule.forRoot(),
  ],
  providers: [YuqingCalendarService],
})
export class YuqingCalendarModule {}

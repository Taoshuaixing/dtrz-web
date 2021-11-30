import { Component, OnInit } from '@angular/core';
import { CrudService } from '../../../crud.service';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { DatePipe } from '@angular/common';
import { YuqingCalendarService } from '../../yuqing.calendar.service';

@Component({
  selector: 'app-yuqing-calendar-history-review',
  templateUrl: './yuqing-calendar-history-review.component.html',
  styleUrls: ['./yuqing-calendar-history-review.component.css'],
})
export class YuqingCalendarHistoryReviewComponent implements OnInit {
  constructor(
    private crudService: CrudService,
    private router: Router,
    public msg: NzMessageService,
    private datePipe: DatePipe,
    private yuqingCalendarService: YuqingCalendarService,
  ) {}

  classifyList = [{ id: 0, eventClassifyName: '全部', children: [] }];
  dateList = [];
  showDate = {
    date: [],
    currentPage: 0,
    totalPage: 0,
    pageSize: 12,
  };

  nodata_date = '1901-01';
  eventClassifyId?: number;
  loading = false;
  fieldList = [];
  startDateFieldId;
  startTime;
  endTime;
  resultData = {
    isEnd: true,
    pageIndex: 1,
    pageSize: 10000,
    today: '',
    list: [],
  };

  postChangeFlag?: number;
  eventMapList = [
    { id: 0, name: '用户录入' },
    { id: 1, name: '图谱推荐' },
  ];
  templateIds = [];
  eventTemplateList = [];

  async ngOnInit() {
    const fieldList = await this.yuqingCalendarService.getEventFieldList();
    const start = fieldList.find((f) => f.fixName === 'startDate');
    if (start) {
      this.startDateFieldId = start.id;
    }

    const eventClassify: any = await this.yuqingCalendarService.searchEventClassify();
    for (const item of eventClassify) {
      this.classifyList.push({ id: item.id, eventClassifyName: item.eventClassifyName, children: item.children });
    }
    if (this.classifyList.length > 0) {
      //默认第一项
      this.eventClassifyId = this.classifyList[0].id;
    }

    this.eventTemplateList = await this.yuqingCalendarService.getEventTemplateList();

    await this.search();
  }

  async search() {
    this.loading = true;
    this.resultData.list = [];
    this.dateList = [];

    this.startTime = this.datePipe.transform(new Date('2010-01-01 00:00:00'), 'yyyy-MM-dd 00:00:00');
    this.endTime = this.datePipe.transform(new Date(), 'yyyy-MM-dd 23:59:59');

    const searchFilter = [];
    if (this.startTime && this.endTime && this.startDateFieldId) {
      searchFilter.push({ fieldId: this.startDateFieldId, start: this.startTime, end: this.endTime });
    }
    const searchFilterRec = [];
    if (this.eventClassifyId > 0) {
      searchFilterRec.push({ fieldName: 'classifyEventId', val: this.eventClassifyId });
    }

    if (this.postChangeFlag != null) {
      searchFilterRec.push({ fieldName: 'postChangeFlag', val: this.postChangeFlag });
    }

    if (this.templateIds.length > 0) {
      searchFilterRec.push({ fieldName: 'eventTemplateId', val: this.templateIds, exp: 'in' });
    }

    const page = { limit: this.resultData.pageSize, page: this.resultData.pageIndex, sort: '' };
    const other = { noLimit: 1, adminFlag: 1, noExtendFlag: 1, showItems: ['发生时间'] };

    const eventList: any = await this.yuqingCalendarService.searchEventList(searchFilter, searchFilterRec, page, other);

    // console.log(eventList)
    if (eventList) {
      eventList.sort((a: any, b: any) => {
        return b.startDate - a.startDate;
      });

      eventList.map((m) => {
        const monthStr = this.datePipe.transform(m.startDate, 'yyyy-MM');
        if (!this.dateList.find((f) => f === monthStr)) {
          this.dateList.push(monthStr);
        }
      });
      //日期分页
      if (this.dateList.length <= this.showDate.pageSize) {
        this.showDate.date = this.dateList;
        this.showDate.currentPage = 1;
        this.showDate.totalPage = 1;
      } else {
        this.showDate.totalPage = Math.ceil(this.dateList.length / this.showDate.pageSize);
        this.showDate.date = this.dateList.slice(
          this.showDate.currentPage * this.showDate.pageSize,
          (this.showDate.currentPage + 1) * this.showDate.pageSize,
        );
        this.showDate.currentPage = 1;
      }

      if (this.showDate.date.length > 0) {
        this.router.navigate(['/yuqing-calendar/yuqing-calendar-history-review/history-review-event-classify'], {
          queryParams: {
            searchMonth: this.showDate.date[0],
            classifyId: this.eventClassifyId,
            startDateFieldId: this.startDateFieldId,
            postChangeFlag: this.postChangeFlag,
            templateIds: this.templateIds,
          },
        });
      } else {
        this.router.navigate(['/yuqing-calendar/yuqing-calendar-history-review/history-review-event-classify'], {
          queryParams: {
            searchMonth: this.nodata_date,
            classifyId: this.eventClassifyId,
            startDateFieldId: this.startDateFieldId,
            postChangeFlag: this.postChangeFlag,
            templateIds: this.templateIds,
          },
        });
      }
    }
    this.loading = false;
  }

  async tabTo(selecedId: any) {
    this.showDate.currentPage = 0;
    this.eventClassifyId = selecedId;
    await this.search();

    this.router.navigate(['/yuqing-calendar/yuqing-calendar-history-review/history-review-event-classify'], {
      queryParams: {
        searchMonth: this.dateList[0],
        classifyId: this.eventClassifyId,
        startDateFieldId: this.startDateFieldId,
        postChangeFlag: this.postChangeFlag,
        templateIds: this.templateIds,
      },
    });
  }

  getData(flag: string) {
    if (flag === 'previous') {
      this.showDate.currentPage = this.showDate.currentPage - 1;
      this.showDate.date = this.dateList.slice(
        (this.showDate.currentPage - 1) * this.showDate.pageSize,
        this.showDate.currentPage * this.showDate.pageSize,
      );
    } else if (flag === 'next') {
      this.showDate.date = this.dateList.slice(
        this.showDate.currentPage * this.showDate.pageSize,
        (this.showDate.currentPage + 1) * this.showDate.pageSize,
      );
      this.showDate.currentPage = this.showDate.currentPage + 1;
    }

    if (this.showDate.date.length > 0) {
      this.router.navigate(['/yuqing-calendar/yuqing-calendar-history-review/history-review-event-classify'], {
        queryParams: {
          searchMonth: this.showDate.date[0],
          classifyId: this.eventClassifyId,
          startDateFieldId: this.startDateFieldId,
          postChangeFlag: this.postChangeFlag,
          templateIds: this.templateIds,
        },
      });
    }
  }

  change($event: any) {
    this.showDate.currentPage = 0;
    this.search();
  }
}

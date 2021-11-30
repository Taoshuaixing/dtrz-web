import { Component, OnInit } from '@angular/core';
import { CrudService } from '../../../crud.service';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { environment } from '@env/environment';
import { SettingsService } from '@delon/theme';
import { DatePipe } from '@angular/common';
import { FileDownloadService } from '../../../fileDownload.service';
import { dateAdd } from '@shared/utils/date-util';
import { CommonService } from '@shared/service/common-service';
import differenceInCalendarDays from 'date-fns/differenceInCalendarDays';
import { JournalService } from '../../journal.service';

@Component({
  selector: 'app-journal-submitted',
  templateUrl: './journal-submitted.component.html',
  styleUrls: ['./journal-submitted.component.css'],
})
export class JournalSubmittedComponent implements OnInit {
  constructor(
    private crudService: CrudService,
    private modalService: NzModalService,
    private router: Router,
    private datePipe: DatePipe,
    private activedrouted: ActivatedRoute,
    private settingService: SettingsService,
    private fileDownloadService: FileDownloadService,
    public msg: NzMessageService,
    private commonService: CommonService,
    public journalService: JournalService,
  ) {}

  listOfAllData = [];
  total = 0;
  pageIndex = 1;
  pageSize = 10;
  loading: any;

  isAllDisplayDataChecked = false;
  isIndeterminate = false;
  listOfDisplayData: ItemData[] = [];
  mapOfCheckedId: { [key: string]: boolean } = {};
  checkIds = [];
  postId: any;

  searchJournalName: any;
  templateId: any;
  templateList = [];
  dutyOptions = [
    { label: '白班', value: 0, checked: false },
    { label: '夜班', value: 1, checked: false },
  ];
  disabledDate: any;
  dateRange: any;
  dateFormat = 'yyyy/MM/dd';
  startTime;
  endTime;
  adminFlag;

  postList = [];
  otherPostValues = [];
  otherPostList = [];
  searchPostId: any;

  async ngOnInit() {
    this.postList = await this.journalService.getOtherPost();

    this.activedrouted.queryParams.subscribe(async (params) => {
      this.pageIndex = 1;
      this.adminFlag = Number(params.adminFlag);

      this.disabledDate = (current: Date): boolean => {
        return differenceInCalendarDays(current, new Date()) > 0;
      };
      this.mapOfCheckedId = {};
      this.listOfDisplayData = [];
      this.checkIds = [];
      this.postId = this.settingService.user.posts[0].id;

      if (this.adminFlag === 1) {
        this.otherPostList = this.postList;
      } else {
        this.otherPostList = this.postList.filter((f) => f.id !== this.postId);
      }

      await this.getTemplateList();
      this.getData();
    });
  }

  getData() {
    const searchTime = this.datePipe.transform(dateAdd('day', -1, new Date()), 'yyyy-MM-dd HH:mm:ss');
    const filter = [`step||$eq||3`, `createdTime||$lte||${searchTime}`];
    const join = [`template`];

    if (this.adminFlag === 0) {
      filter.push(`postId||$eq||${this.postId}`);
    }

    if (this.searchJournalName) {
      filter.push(`journalName||$cont||${this.searchJournalName.trim()}`);
    }

    if (this.searchPostId > 0) {
      filter.push(`postId||$eq||${this.searchPostId}`);
    }

    const options = this.dutyOptions.filter((f) => f.checked === true);
    if (options.length === 1) {
      if (options[0].value === 0) {
        filter.push(`duty||$eq||m`);
      } else if (options[0].value === 1) {
        filter.push(`duty||$eq||n`);
      }
    }

    if (this.templateId > 0) {
      filter.push(`template.id||$eq||${this.templateId}`);
    }

    if (this.startTime && this.endTime) {
      filter.push(`createdTime||$between||${this.startTime},${this.endTime}`);
    }

    this.crudService
      .search(environment.baseUrl + 'api', 'journal-data-for-list', {
        filter: filter,
        join: join,
        sort: ['id,DESC'],
      })
      .subscribe((res: any[]) => {
        this.total = res.length;
        this.listOfAllData = res.map((m) => {
          const content = [];
          if (m.template.configTemplateDetails.length > 0) {
            m.template.configTemplateDetails.map((m) => {
              content.push(m.contentTitle);
            });
          }

          const postName = this.postList.find((f) => f.id === m.postId).postName;

          return { ...m, content: content.join('、'), postName: postName };
        });
        console.log('journal-data', res);
      });
  }

  async getTemplateList() {
    this.templateList = [];
    const filter = [`status||$eq||1`, `deleteFlag||$eq||0`];
    if (this.adminFlag === 0) {
      filter.push(`postId||$eq||${this.postId}`);
    }

    this.templateList = await new Promise((resolve, reject) => {
      this.crudService
        .search(environment.baseUrl + 'api', 'journal-config-template', {
          filter: filter,
        })
        .subscribe((res: any[]) => {
          resolve(res);
        });
    });
  }

  checkAll(value: boolean): void {
    this.listOfDisplayData.forEach((item) => (this.mapOfCheckedId[item.id] = value));
    this.refreshStatus();
  }

  currentPageDataChange($event: ItemData[]): void {
    this.listOfDisplayData = $event;
    this.refreshStatus();
  }

  refreshStatus(): void {
    this.checkIds = [];
    this.isAllDisplayDataChecked = this.listOfDisplayData.every((item) => this.mapOfCheckedId[item.id]);
    this.isIndeterminate =
      this.listOfDisplayData.some((item) => this.mapOfCheckedId[item.id]) && !this.isAllDisplayDataChecked;

    const selectedList = this.listOfAllData.filter((f) => this.mapOfCheckedId[f.id]);

    for (const item of selectedList) {
      this.checkIds.push(item.id);
    }
  }

  edit(data: any) {
    this.router.navigate(['/journal/journal-finish'], {
      queryParams: {
        fromBy: 'journal-submitted',
        journalId: data.id,
        adminFlag: this.adminFlag,
      },
    });
  }

  downLoadWord() {
    if (this.checkIds.length === 0) {
      this.msg.create('info', '请选择Word下载数据！');
      this.loading = false;
      return;
    }

    this.journalService.download(this.checkIds.join(','));
  }

  onChange($event: any) {}

  dateRangeOnChange($event: any) {
    const range = this.commonService.getDateRange(this.dateRange, true);
    this.startTime = range.start;
    this.endTime = range.end;
    this.getData();
  }

  resetSe() {
    this.searchJournalName = '';
    this.templateId = null;
    this.searchPostId = null;
    this.startTime = null;
    this.endTime = null;
    this.dateRange = [];
    this.dutyOptions.map((it) => {
      it.checked = false;
      return it;
    });

    this.getData();
  }

  share() {
    if (this.otherPostValues.length === 0) {
      this.msg.create('info', '请选择要分享的岗位！');
      return;
    }

    if (this.checkIds.length === 0) {
      this.msg.create('info', '请选择要分享的数据！');
      this.loading = false;
      return;
    }

    this.modalService.confirm({
      nzTitle: '批量分享',
      nzContent: '<b style="color: red;">确定分享这些数据吗？</b>',
      nzOkType: 'danger',
      nzOnOk: async () => {
        this.crudService
          .add(environment.baseUrl + 'api', 'journal-post-data/sharePost', {
            ids: this.checkIds,
            sharePosts: this.otherPostValues,
            postId: this.postId,
          })
          .subscribe((res) => {
            this.loading = false;
            this.msg.create('success', `分享成功`);
            this.getData();
          });
      },
      nzOnCancel: () => {
        this.loading = false;
        console.log('Cancel');
      },
    });
  }
}

interface ItemData {
  id: number;
  journalName: string;
}

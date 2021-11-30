import { Component, OnInit } from '@angular/core';
import { CrudService } from '../../../crud.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { environment } from '@env/environment';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Router } from '@angular/router';
import { SettingsService } from '@delon/theme';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { FileDownloadService } from '../../../fileDownload.service';
import { dateAdd } from '@shared/utils/date-util';
import { JournalService } from '../../journal.service';

@Component({
  selector: 'app-journal-report',
  templateUrl: './journal-report.component.html',
  styleUrls: ['./journal-report.component.css'],
})
export class JournalReportComponent implements OnInit {
  constructor(
    private crudService: CrudService,
    private modalService: NzModalService,
    private router: Router,
    private http: HttpClient,
    private datePipe: DatePipe,
    private settingService: SettingsService,
    private fileDownloadService: FileDownloadService,
    public msg: NzMessageService,
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
  mapOfCheckedId: { [key: number]: boolean } = {};
  checkIds = [];
  postId: any;

  postList = [];
  otherPostValues = [];
  otherPostList = [];

  async ngOnInit() {
    this.mapOfCheckedId = {};
    this.listOfDisplayData = [];
    this.checkIds = [];
    this.postId = this.settingService.user.posts[0].id;
    this.postList = await this.journalService.getOtherPost();
    this.otherPostList = this.postList.filter((f) => f.id !== this.postId);
    this.getData();
  }

  getData() {
    const searchTime = this.datePipe.transform(dateAdd('day', -1, new Date()), 'yyyy-MM-dd HH:mm:ss');

    this.crudService
      .search(environment.baseUrl + 'api', 'journal-data-for-list', {
        filter: [`reportStatus||$ne||1`, `postId||$eq||${this.postId}`, `createdTime||$gt||${searchTime}`],
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
          return { ...m, content: content.join('、') };
        });
        console.log('journal-data', res);
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
    console.log('this.checkIds', this.checkIds);
  }

  del(id: any) {
    this.modalService.confirm({
      nzTitle: `删除日志`,
      nzContent: `<b style="color: red;">确定删除该日志吗？</b>`,
      nzOkType: 'danger',
      nzOnOk: () => {
        this.crudService.del(environment.baseUrl + 'api', 'journal-data', id).subscribe((res) => {
          this.msg.create('success', `删除成功`);
          this.ngOnInit();
        });
      },
      nzOnCancel: () => console.log('Cancel'),
    });
  }

  edit(data: any) {
    if (data.step <= 1) {
      this.router.navigate(['/journal/journal-detail'], {
        queryParams: {
          fromBy: 'journal-report',
          journalId: data.id,
        },
      });
    } else if (data.step >= 2) {
      this.router.navigate(['/journal/journal-view'], {
        queryParams: {
          fromBy: 'journal-report',
          journalId: data.id,
        },
      });
    }
  }

  downLoadWord() {
    if (this.checkIds.length === 0) {
      this.msg.create('info', '请选择Word下载数据！');
      this.loading = false;
      return;
    }

    const result = this.checkSelectDataStatus('downLoadWord');
    if (!result.isOk) {
      this.msg.warning(result.msg);
      this.loading = false;
      return;
    }
    this.journalService.download(this.checkIds.join(','));
  }

  checkSelectDataStatus(source: any) {
    const result = { msg: '', isOk: true };
    this.checkIds.map((m) => {
      const data = this.listOfAllData.find((f) => f.id === m);
      if (data.step < 3) {
        let status = '';
        if (data.step === 1) {
          status = '编辑中';
        } else if (data.step === 2) {
          status = '排版中';
        }

        if ('downLoadWord' === source) {
          result.msg =
            '【' + data.journalName + '】 当前是"' + status + '"状态不可下载Word，请选择 "已完成" 状态数据！';
        } else if ('share' === source) {
          result.msg = '【' + data.journalName + '】 当前是"' + status + '"状态不可分享，请选择 "已完成" 状态数据！';
        }

        result.isOk = false;
        return result;
      }
    });
    return result;
  }

  share() {
    if (this.otherPostValues.length === 0) {
      this.msg.create('info', '请选择要分享的岗位！');
      return;
    }

    if (this.checkIds.length === 0) {
      this.msg.create('info', '请选择要分享数据！');
      this.loading = false;
      return;
    }

    const result = this.checkSelectDataStatus('share');
    if (!result.isOk) {
      this.msg.warning(result.msg);
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

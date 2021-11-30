import { Component, OnInit } from '@angular/core';
import { CrudService } from '../../../crud.service';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { environment } from '@env/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { SettingsService } from '@delon/theme';

@Component({
  selector: 'app-journal-drafts',
  templateUrl: './journal-drafts.component.html',
  styleUrls: ['./journal-drafts.component.css'],
})
export class JournalDraftsComponent implements OnInit {
  constructor(
    private crudService: CrudService,
    private modalService: NzModalService,
    private router: Router,
    private settingService: SettingsService,
    public msg: NzMessageService,
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
  ids = [];
  postId: any;

  ngOnInit(): void {
    this.postId = this.settingService.user.posts[0].id;
    this.getData();
  }

  getData() {
    this.crudService
      .search(environment.baseUrl + 'api', 'journal-data-for-list', {
        filter: [`reportStatus||$eq||1`, `postId||$eq||${this.postId}`],
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
    this.ids = [];
    this.isAllDisplayDataChecked = this.listOfDisplayData.every((item) => this.mapOfCheckedId[item.id]);
    this.isIndeterminate =
      this.listOfDisplayData.some((item) => this.mapOfCheckedId[item.id]) && !this.isAllDisplayDataChecked;

    const selectedList = this.listOfAllData.filter((f) => this.mapOfCheckedId[f.recUuid]);

    for (const item of selectedList) {
      this.ids.push(item.id);
    }
  }

  edit(data: any) {
    if (data.step === 1) {
      this.router.navigate(['/journal/journal-detail'], {
        queryParams: {
          fromBy: 'journal-drafts',
          journalId: data.id,
        },
      });
    } else if (data.step >= 2) {
      this.router.navigate(['/journal/journal-view'], {
        queryParams: {
          fromBy: 'journal-drafts',
          journalId: data.id,
        },
      });
    }
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
}

interface ItemData {
  id: number;
  name: string;
}

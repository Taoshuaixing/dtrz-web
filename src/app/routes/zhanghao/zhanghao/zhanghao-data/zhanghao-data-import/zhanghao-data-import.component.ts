import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { CrudService } from '../../../../crud.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '@env/environment';
import { SettingsService } from '@delon/theme';
import { ExcelDownloadService } from '../../../../excelDownload.service';
import { ACLService } from '@delon/acl';

@Component({
  selector: 'app-zhanghao-data-import',
  templateUrl: './zhanghao-data-import.component.html',
  styleUrls: ['./zhanghao-data-import.component.css'],
})
export class ZhanghaoDataImportComponent implements OnInit, AfterViewInit, OnDestroy {
  constructor(
    private crudService: CrudService,
    private modalService: NzModalService,
    public msg: NzMessageService,
    private router: Router,
    private aclService: ACLService,
    private activedrouted: ActivatedRoute,
    private settingService: SettingsService,
    private excelService: ExcelDownloadService,
  ) {}

  listOfAllData = [];
  loading = false;

  pageIndex = 1;
  pageSize = 10;
  total = 0;

  postId = 0;
  userId = 0;
  timer10: any;
  from = '';
  fromFieldId = 0;
  fromOptionId = 0;
  fromFieldType = 0;
  fromBatchNumber = '';
  currentSys = environment.currentSys;

  async ngOnInit() {
    this.postId = this.settingService.user.posts[0].id;
    this.userId = this.settingService.user.userId;
    this.loading = true;
    await this.search();
    this.loading = false;
  }

  async ngAfterViewInit(): Promise<void> {
    this.timer10 = setInterval(async () => {
      this.search();
    }, 1000 * 10);
  }

  ngOnDestroy() {
    if (this.timer10) {
      clearInterval(this.timer10);
    }
  }
  currentPageDataChange($event: any[]) {}

  async search() {
    const filter = [`deleteFlag||$eq||0 `];
    if (this.aclService.data.roles.indexOf('dagl_admin') < 0) {
      //非管理员，需要限定岗位
      filter.push(`postId||$eq||${this.postId}`);
    }

    this.listOfAllData = await new Promise((resolve, reject) => {
      this.crudService
        .search(environment.baseUrl + 'api', 'zhanghao-import-result', {
          filter: filter,
          limit: this.pageSize,
          page: this.pageIndex,
          sort: ['id,DESC'],
        })
        .subscribe(async (res: any) => {
          if (res) {
            this.total = res.total;
            for (const m of res.data) {
              m.importProcess = await this.getProgress(m);
            }
          }

          resolve(res.data);
        });
    });
  }

  /**
   * 单条
   * @param id
   */
  async getOne(id: any) {
    return await new Promise((resolve, reject) => {
      this.crudService.get(environment.baseUrl + 'api', 'zhanghao-import-result', id).subscribe(async (res: any) => {
        res.importProcess = await this.getProgress(res);
        resolve(res);
      });
    });
  }

  getProgress(m: any) {
    return new Promise((resolve_1, reject_1) => {
      this.crudService
        .search(environment.baseUrl + 'api', 'zhanghao-import-progress', {
          filter: [`batchNumber||$eq||${m.batchNumber}`],
        })
        .subscribe((res_1: any[]) => {
          if (res_1.length > 0) {
            const statusFlag = res_1[0].statusFlag;
            const percent = Math.round((res_1[0].currentNum / res_1[0].totalNum) * 100);
            resolve_1({ statusFlag: statusFlag, percent: percent });
          }
          resolve_1({});
        });
    });
  }

  async waitSearch(parent: any) {
    await parent.search();
  }

  del(id: any) {
    this.modalService.confirm({
      nzTitle: `删除表格`,
      nzContent: `<b style="color: red;">确定删除该表格吗？</b>`,
      nzOkType: 'danger',
      nzOnOk: () => {
        this.crudService.del(environment.baseUrl + 'api', 'zhanghao-import-result', id).subscribe((res) => {
          this.msg.create('success', `正在删除中......`);
          this.search();
        });
      },
      nzOnCancel: () => console.log('Cancel'),
    });
  }

  backFrom($event) {
    history.go(-1);
  }

  downloadErrorData(id: any) {
    this.excelService.download(
      'zhanghao',
      'api/zhanghao-data/downloadErrorData',
      {
        importId: id,
      },
      true,
    );
  }
}

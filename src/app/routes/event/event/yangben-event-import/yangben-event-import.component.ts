import { Component, OnInit } from '@angular/core';
import { environment } from '@env/environment';
import { Observable, Observer } from 'rxjs';
import { CrudService } from '../../../crud.service';
import { ExcelDownloadService } from '../../../excelDownload.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { SettingsService } from '@delon/theme';

@Component({
  selector: 'app-yangben-event-import',
  templateUrl: './yangben-event-import.component.html',
  styles: [],
})
export class YangbenEventImportComponent implements OnInit {
  constructor(
    private crudService: CrudService,
    private excelService: ExcelDownloadService,
    public msg: NzMessageService,
    private modalService: NzModalService,
    private settingService: SettingsService,
  ) {}

  listOfAllData = [];
  loading = false;

  pageIndex = 1;
  pageSize = 10;
  total = 0;

  postId = 0;
  userId = 0;

  currentSys = environment.currentSys;

  async ngOnInit() {
    this.postId = this.settingService.user.posts[0].id;
    this.userId = this.settingService.user.userId;
    await this.search();
  }

  async waitSearch(parent: any) {
    await parent.search();
  }

  async search() {
    this.listOfAllData = await new Promise((resolve, reject) => {
      this.crudService
        .search(environment.baseUrl + 'api', 'yangben-event-import-result', {
          filter: [`deleteFlag||$eq||0 `],
          limit: this.pageSize,
          page: this.pageIndex,
          sort: ['id,DESC'],
        })
        .subscribe(async (res: any) => {
          if (res) {
            this.total = res.total;
            for (const m of res.data) {
              if (m.fileSavePath) {
                m.importProcess = await this.getProgress(m);
              } else {
                if (m.resultStatus == 3) {
                  m.importProcess = { statusFlag: 2, percent: 100 };
                } else {
                  m.importProcess = { statusFlag: 1, percent: 100 };
                }
              }
            }
          }
          resolve(res.data);
        });
    });
  }

  getProgress(m: any) {
    return new Promise((resolve_1, reject_1) => {
      this.crudService
        .search(environment.baseUrl + 'api', 'yangben-event-import-progress', {
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

  downloadTemplate() {
    this.excelService.download('yangben', 'api/yangben-event/downloadTemplate', {}, true);
  }

  beforeUpload = (file: File) => {
    const fileName: any = file.name;
    return new Observable((observer: Observer<boolean>) => {
      // const isExcel =  file.type.indexOf('excel') >= 0 || file.type.indexOf('spreadsheetml') >= 0;
      const isExcel = /(xls|xlsx)$/i.test(fileName);
      if (!isExcel) {
        this.msg.error('只能导入Excel类型的文件！');
        observer.complete();
        return;
      }

      observer.next(isExcel);
      observer.complete();
    });
  };

  currentPageDataChange($event: any[]) {}

  del(id: any) {
    this.modalService.confirm({
      nzTitle: `删除`,
      nzContent: `<b style="color: red;">确定删除该记录吗？</b>`,
      nzOkType: 'danger',
      nzOnOk: () => {
        this.crudService.del(environment.baseUrl + 'api', 'yangben-event-import-result', id).subscribe((res) => {
          this.msg.create('success', `删除成功`);
          this.search();
        });
      },
      nzOnCancel: () => console.log('Cancel'),
    });
  }

  downloadErrorData(id: any) {
    this.excelService.download(
      'event',
      'api/yangben-event/downloadErrorData',
      {
        importId: id,
      },
      true,
    );
  }
}

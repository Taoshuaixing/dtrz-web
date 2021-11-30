import { Component, OnInit } from '@angular/core';
import {CrudService} from "../../../crud.service";
import {ExcelDownloadService} from "../../../excelDownload.service";
import {NzMessageService} from "ng-zorro-antd/message";
import {NzModalService} from "ng-zorro-antd/modal";
import {SettingsService} from "@delon/theme";
import {environment} from "@env/environment";
import {Observable, Observer} from "rxjs";

@Component({
  selector: 'app-keyword-import',
  templateUrl: './keyword-import.component.html',
  styles: [
  ]
})
export class KeywordImportComponent implements OnInit {

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

  actionUrl = environment.baseUrl + 'api/keyword-task/upload';
  showUploadList = false;
  uploadLoading = false;

  ngOnInit(): void {
    this.postId = this.settingService.user.posts[0].id;
    this.userId = this.settingService.user.userId;
    this.search();
  }

  search() {
    this.crudService
      .search(environment.baseUrl + 'api', 'keyword-task', {
        limit: this.pageSize,
        page: this.pageIndex,
        sort: ['id,DESC'],
      })
      .subscribe(async (res: any) => {
        if (res) {
          this.total = res.total;
          this.listOfAllData = res.data;
        }
      });
  }

  currentPageDataChange($event: any[]) {
  }

  del(id: any) {
    this.modalService.confirm({
      nzTitle: `删除`,
      nzContent: `<b style="color: red;">确定删除该记录吗？</b>`,
      nzOkType: 'danger',
      nzOnOk: () => {
        this.crudService.del(environment.baseUrl + 'api', 'keyword-task', id).subscribe((res) => {
          this.msg.create('success', `删除成功`);
          this.search();
        });
      },
      nzOnCancel: () => console.log('Cancel'),
    });
  }

  beforeUpload = (file: File) => {
    const fileName:any = file.name;
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

  async uploadChange($event: any) {
    if (!$event) {
      return;
    }

    this.showUploadList = true;
    this.uploadLoading = true;

    if ($event.type === 'success') {
      this.showUploadList = false;
      this.uploadLoading = false;
      $event.fileList.pop();

    } else if ($event.type === 'error') {
      this.msg.create('error', '上传失败！');
      this.showUploadList = false;
      this.uploadLoading = false;
      $event.fileList.pop();
    }

    if ($event.type === 'success' || $event.type === 'error') {
       this.search();
    }
  }

  downloadTemplate() {
    this.excelService.download('关键词导入模板', 'api/keyword-task/downloadTemplate', {},false);
  }
}

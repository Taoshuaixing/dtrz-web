import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ACLService } from '@delon/acl';
import { SettingsService } from '@delon/theme';
import { environment } from '@env/environment';
import { CommonService } from '@shared/service/common-service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CrudService } from 'src/app/routes/crud.service';
import { ExcelDownloadService } from 'src/app/routes/excelDownload.service';
import { FileDownloadService } from 'src/app/routes/fileDownload.service';

@Component({
  selector: 'app-zhanghao-data-modal-export',
  templateUrl: './zhanghao-data-modal-export.component.html',
  styles: [],
})
export class ZhanghaoDataModalExportComponent implements OnInit {
  isVisible = false;
  isOkLoading = false;
  fieldList = [];
  selectedItem = [];
  loading = false;
  withAttach = false;
  @Input() fieldListForSearch: any;
  @Input() shareFlag: number;
  @Input() selectFlag: any;
  @Input() sortValue = '';
  @Input() sortKey = '';
  @Input() selectedId: any;
  @Input() isSelection = false;
  @Output() callback = new EventEmitter();

  constructor(
    private crudService: CrudService,
    private excelService: ExcelDownloadService,
    public settingService: SettingsService,
    private aclService: ACLService,
    public msg: NzMessageService,
    public commonService: CommonService,
    private fileDownloadService: FileDownloadService,
    private datePipe: DatePipe,
  ) {}
  // 岗位ID
  postId = 0;
  adminFlag = 0;
  indeterminate = false;
  allChecked = false;

  ngOnInit() {}

  async showModal(): Promise<void> {
    if (this.selectedId.length === 0) {
      this.msg.error('请选择要导出的数据！');
      return;
    }
    this.isOkLoading = false;
    this.postId = this.settingService.user.posts[0].id;
    this.adminFlag = this.aclService.data.roles.indexOf('dagl_admin') >= 0 ? 1 : 0;

    this.fieldList = [];
    const fieldList_all: any = await new Promise((resolve, reject) => {
      this.crudService
        .search(environment.baseUrl + 'api', 'zhanghao-field-define', {
          filter: [`deleteFlag||$eq||0`],
          sort: ['id,ASC'],
        })
        .subscribe((res: any[]) => {
          resolve(res);
        });
    });

    if (this.adminFlag === 1) {
      // 管理员
      this.fieldList = fieldList_all;
    } else {
      // 岗位用户的选中项
      let filedList_post: any = [];
      filedList_post = await new Promise((resolve, reject) => {
        this.crudService
          .search(environment.baseUrl + 'api', 'zhanghao-post-field-export', {
            filter: [`postId||$eq||${this.postId}`, `shareFlag||$eq||${this.shareFlag === 2 ? 1 : 0}`],
          })
          .subscribe((res: any[]) => {
            resolve(res);
          });
      });

      if (this.shareFlag === 2) {
        //  共享我的，直接使用全部字段
        this.fieldList = fieldList_all;
      } else {
        // 本岗的所有项
        this.fieldList = await new Promise((resolve, reject) => {
          this.crudService
            .search(environment.baseUrl + 'api', `zhanghao-field-define/fieldInfo/${this.postId}`, {})
            .subscribe((res: any[]) => {
              resolve(res);
            });
        });
      }

      // 补充
      this.fieldList = this.fieldList.map((m) => {
        const ff = filedList_post.find((f) => f.fieldId === m.id);
        if (ff) {
          return { ...m, exportFlag: 1 };
        }
        return { ...m, exportFlag: 0 };
      });
    }

    this.fieldList = this.fieldList.map((m) => {
      return { ...m, checked: m.exportFlag === 1 ? true : false };
    });

    if (this.fieldList.filter((f) => f.exportFlag === 1).length === 0) {
      // 如果一个都没选中，则全选
      this.fieldList = this.fieldList.map((m) => {
        return { ...m, checked: true };
      });
    }
    this.refreshStatus();
    this.isVisible = true;
  }
  handleCancel(): void {
    this.isVisible = false;
  }

  async handleOk() {
    this.isVisible = false;
  }

  async export() {
    this.selectedItem = [];
    this.fieldList.map((m) => {
      if (m.checked) {
        this.selectedItem.push(m.id);
      }
    });
    if (this.selectedItem.length === 0) {
      this.msg.error('请选择要导出的项！');
      return;
    }

    this.isOkLoading = true;
    // 获取过滤
    const searchFilter = this.commonService.getSearchFilter(this.fieldListForSearch);
    searchFilter.push({ fieldName: 'id', exp: 'in', val: this.selectedId.join(',') });
    let page = {};
    if (this.sortKey) {
      page = { sort: `${this.sortKey} ${this.sortValue}` };
    }

    if (this.withAttach) {
      await this.fileDownloadService.download(
        'zhanghao_' + '_' + this.datePipe.transform(new Date(), 'yyyyMMdd'),
        'zip',
        `api/zhanghao-data/export`,
        {
          s: JSON.stringify(searchFilter),
          ids: this.selectedItem.join(','),
          page: JSON.stringify(page),
          other: JSON.stringify({
            postId: this.postId,
            adminFlag: this.adminFlag,
            shareFlag: this.shareFlag,
            selectFlag: this.selectFlag === 'selected' ? 1 : 0,
            withAttach: this.withAttach ? 1 : 0,
            noLimit: 1,
          }),
        },
      );
    } else {
      await this.excelService.download(
        'zhanghao',
        'api/zhanghao-data/export',
        {
          s: JSON.stringify(searchFilter),
          ids: this.selectedItem.join(','),
          page: JSON.stringify(page),
          other: JSON.stringify({
            postId: this.postId,
            adminFlag: this.adminFlag,
            shareFlag: this.shareFlag,
            selectFlag: this.selectFlag === 'selected' ? 1 : 0,
            withAttach: this.withAttach ? 1 : 0,
            noLimit: 1,
          }),
        },
        true,
      );
    }

    this.isOkLoading = false;
    this.isVisible = false;
    this.callback.emit(this.isSelection);
  }

  checkAll($event: boolean) {
    this.fieldList.forEach((item) => (item.checked = this.allChecked));
    this.indeterminate = false;
  }

  refreshStatus() {
    this.allChecked = this.fieldList.every((item) => item.checked === true);
    this.indeterminate = this.fieldList.some((item) => item.checked) && !this.allChecked;
  }
}

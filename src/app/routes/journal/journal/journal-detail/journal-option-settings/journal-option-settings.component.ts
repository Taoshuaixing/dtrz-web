import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {CrudService} from '../../../../crud.service';
import {environment} from '@env/environment';
import {FormBuilder} from '@angular/forms';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzModalService} from 'ng-zorro-antd/modal';

import {DatePipe} from '@angular/common';
import {SettingsService} from '@delon/theme';
import {XlsxService} from '@delon/abc/xlsx';
import {STColumn} from '@delon/abc/st';

@Component({
  selector: 'app-journal-option-settings',
  templateUrl: './journal-option-settings.component.html',
  styles: [],
})
export class JournalOptionSettingsComponent implements OnInit {
  constructor(
    private crudService: CrudService,
    private fb: FormBuilder,
    private msg: NzMessageService,
    private datePipe: DatePipe,
    private xlsx: XlsxService,
    public settingService: SettingsService,
    private modalService: NzModalService,
  ) {
  }

  isVisible: boolean;
  isOkLoading: any;
  list: any = [];
  searchForm: any;
  searchName = '';
  loading: any;
  type: string;
  contentTitle: string;
  control: any;
  @Output() hide_emitter = new EventEmitter();

  contentTitle2 = '';
  dialogTitle: any;
  pageIndex = 1;
  pageSize = 10;
  postId = 0;

  subUrl = 'journal-data-prompt';

  columns: STColumn[] = [
    {title: '序号', index: 'id'},
    {title: '内容', index: 'name'},
    {title: '更新时间', index: 'updatedTime', type: 'date', dateFormat: 'yyyy-MM-dd HH:mm:ss'},
  ];
  btnName: '';

  ngOnInit() {
    this.searchForm = this.fb.group({
      searchName: [null, []],
      contentTitle: [null, []],
    });
    this.postId = this.settingService.user.posts[0].id;
  }

  showModal(type, control, contentTitle, btnName) {
    this.isVisible = true;
    this.contentTitle = contentTitle;
    this.contentTitle2 = contentTitle;
    this.control = control;
    this.type = type;
    this.btnName = btnName;
    this.showInit();
  }

  handleOk() {
    this.isVisible = false;
    this.hide_emitter.emit();
  }

  async del(id: any) {
    this.modalService.confirm({
      nzTitle: '删除',
      nzContent: '<b style="color: red;">确定删除吗？</b>',
      nzOkType: 'danger',
      nzOnOk: async () => {
        this.crudService.del(environment.baseUrl + 'api', this.subUrl, id).subscribe((res: any[]) => {
          this.itmeSearch();
        });
      },
      nzOnCancel: () => console.log('Cancel'),
    });
  }

  showInit() {
    this.searchName = '';
    this.itmeSearch();
  }

  /**
   * 是否存在check
   * @param inputName
   * @param id
   */
  async check(inputName: any, id: number): Promise<boolean> {
    let subUrl = 'journal-data-prompt';

    const cnt: number = await new Promise<number>((resolve) => {
      this.crudService
        .search(environment.baseUrl + 'api', subUrl, {
          filter: [`itemContent||$eq||${inputName}`, `itemType||$eq||${this.type}`, `postId||$eq||${this.postId}`],
        })
        .subscribe((res: any[]) => {
          resolve(res.length);
        });
    });
    if (cnt > 0) {
      return true;
    }

    return false;
  }

  // 名称编辑回调函数
  async callbackEmitter(inputName: string, data: any) {
    let subUrl = 'journal-data-prompt';
    if (data) {
      if (!(await this.check(inputName, data.id))) {
        data.itemContent = inputName;
        this.crudService.update(environment.baseUrl + 'api', subUrl, data.id, data).subscribe((res: any) => {
          this.itmeSearch();
        });
      }
    } else {
      // if (!(await this.check(inputName, null))) {
      this.crudService
        .add(environment.baseUrl + 'api', subUrl, {
          itemContent: inputName,
          itemType: this.type,
          postId: this.postId,
          contentTitle: this.contentTitle2,
        })
        .subscribe((res: any) => {
          this.itmeSearch();
        });
      // }
    }
  }

  itmeSearch() {
    const searchFilter = [];
    if (this.searchName) {
      searchFilter.push(`itemContent||$cont||${this.searchName}`);
    }
    if (this.type) {
      searchFilter.push(`itemType||$eq||${this.type}`);
    }
    if (this.contentTitle) {
      searchFilter.push(`contentTitle||$cont||${this.contentTitle}`);
    }
    searchFilter.push(`postId||$eq||${this.postId}`);
    this.crudService
      .search(environment.baseUrl + 'api', this.subUrl, {
        filter: searchFilter,
        sort: ['contentTitle,ASC'],
      })
      .subscribe((res: any[]) => {
        this.list = res;
        this.list.map((r) => {
          r.defaultChecked = r.defaultFlag === 1;
        });
      });
  }

  async updateDefultVal(data: any) {
    const searchFilter = [];

    if (this.type) {
      searchFilter.push(`itemType||$eq||${this.type}`);
    }
    if (data.contentTitle) {
      searchFilter.push(`contentTitle||$eq||${data.contentTitle}`);
    }
    searchFilter.push(`postId||$eq||${this.postId}`);
    searchFilter.push(`defaultFlag||$eq||1`);

    // console.log(searchFilter);
    const defaultList: any = await new Promise((resolve) => {
      this.crudService
        .search(environment.baseUrl + 'api', this.subUrl, {
          filter: searchFilter,
        })
        .subscribe((res: any) => {
          resolve(res);
        });
    });
    for (const item of defaultList) {
      await new Promise((resolve) => {
        item.defaultFlag = 0;
        this.crudService.update(environment.baseUrl + 'api', this.subUrl, item.id, item).subscribe((res: any) => {
          resolve(null);
        });
      });
    }

    data.defaultFlag = data.defaultChecked ? 1 : 0;
    this.crudService.update(environment.baseUrl + 'api', this.subUrl, data.id, data).subscribe((res: any) => {
      this.itmeSearch();
      this.msg.info('设置成功');
    });
  }

  // 选中
  selectContent(itemContent: any, itemType: any) {
    this.isVisible = false;
    // 传递结果给父页面
    this.hide_emitter.emit({
      control: this.control,
      itemContent: itemContent,
      itemType: itemType,
    });
  }

  handleCancel() {
    this.isVisible = false;
  }

}

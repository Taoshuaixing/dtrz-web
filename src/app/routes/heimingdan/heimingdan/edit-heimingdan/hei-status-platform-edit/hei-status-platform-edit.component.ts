import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CrudService } from '../../../../crud.service';
import { environment } from '@env/environment';
import { FormBuilder } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';

import { DatePipe } from '@angular/common';
import { SettingsService } from '@delon/theme';
import {XlsxService} from '@delon/abc/xlsx';
import {STColumn} from '@delon/abc/st';

@Component({
  selector: 'app-hei-status-platform-edit',
  templateUrl: './hei-status-platform-edit.component.html',
  styles: [],
})
export class HeiStatusPlatformEditComponent implements OnInit {
  constructor(
    private crudService: CrudService,
    private fb: FormBuilder,
    private msg: NzMessageService,
    private datePipe: DatePipe,
    private xlsx: XlsxService,
    public settingService: SettingsService,
    private modalService: NzModalService,
  ) {}

  isVisible: boolean;
  isOkLoading: any;
  isOpenStatus = 'heiStatus';
  listHeiStatus: any = [];
  searchForm: any;
  searchName = '';
  loading: any;
  @Input() type: string;
  @Output() hide_emitter = new EventEmitter();
  dialogTitle: any;
  listHeiPlatform: any = [];
  listHeiStrikeMode: any = [];
  pageIndex = 1;
  pageSize = 10;

  columns: STColumn[] = [
    { title: '序号', index: 'id' },
    { title: '名称', index: 'name' },
    { title: '更新时间', index: 'updatedTime', type: 'date', dateFormat: 'yyyy-MM-dd HH:mm:ss' },
  ];

  ngOnInit() {
    this.searchForm = this.fb.group({
      searchName: [null, []],
    });
  }

  showModal() {
    this.isVisible = true;
    this.showInit();
  }

  handleCancel() {
    // this.isVisible = false;
    this.handleOk();
  }

  handleOk() {
    this.isVisible = false;
    this.hide_emitter.emit();
  }

  async del(id: any) {
    let subUrl = '';

    if (this.type === 'heiStatus') {
      subUrl = 'hei-status';
    } else if (this.type === 'heiPlatform') {
      subUrl = 'hei-platform';
    } else if (this.type === 'heiStrikeMode') {
      subUrl = 'hei-strike-mode';
    }

    this.modalService.confirm({
      nzTitle: '删除',
      nzContent: '<b style="color: red;">确定删除吗？</b>',
      nzOkType: 'danger',
      nzOnOk: async () => {
        const p = await new Promise<any[]>((resolve, reject) => {
          this.crudService
            .search(environment.baseUrl + 'api', 'heimingdan', {
              filter: [`${this.type}.id||$in||${id}`],
              join: [this.type],
            })
            .subscribe((res: any[]) => {
              resolve(res);
            });
        });
        if (p.length === 0) {
          this.crudService.del(environment.baseUrl + 'api', subUrl, id).subscribe((res: any[]) => {
            this.itmeSearch();
          });
        } else {
          const personName = [];
          for (const item of p) {
            personName.push(item.personName);
          }
          this.msg.create('warning', `重点人:【${personName.join(',')}】引用了该配置，无法删除`);
        }
      },
      nzOnCancel: () => console.log('Cancel'),
    });
  }

  showInit() {
    this.searchName = '';
    if (this.type === 'heiStatus') {
      this.isOpenStatus = 'heiStatus';
    } else if (this.type === 'heiPlatform') {
      this.isOpenStatus = 'heiPlatform';
    } else if (this.type === 'heiStrikeMode') {
      this.isOpenStatus = 'heiStrikeMode';
    }

    this.itmeSearch();
  }

  /**
   * 是否存在check
   * @param inputName
   * @param id
   */
  async check(inputName: any, id: number): Promise<boolean> {
    let subUrl = 'hei-status';
    if (this.type === 'heiPlatform') {
      subUrl = 'hei-platform';
    } else if (this.type === 'heiStrikeMode') {
      subUrl = 'hei-strike-mode';
    }

    if (id) {
      const cnt: number = await new Promise<number>(resolve => {
        this.crudService
          .search(environment.baseUrl + 'api', subUrl, {
            filter: [`id||$ne||${id}`, `name||eq||${inputName}`],
          })
          .subscribe((res: any[]) => {
            resolve(res.length);
          });
      });
      if (cnt > 0) {
        return true;
      }
    } else {
      const cnt: number = await new Promise<number>(resolve => {
        this.crudService
          .search(environment.baseUrl + 'api', subUrl, {
            filter: [`name||eq||${inputName}`],
          })
          .subscribe((res: any[]) => {
            resolve(res.length);
          });
      });
      if (cnt > 0) {
        return true;
      }
    }

    return false;
  }

  // 名称编辑回调函数
  async callbackEmitter(inputName: string, data: any) {
    let subUrl = 'hei-status';
    if (this.type === 'heiPlatform') {
      subUrl = 'hei-platform';
    } else if (this.type === 'heiStrikeMode') {
      subUrl = 'hei-strike-mode';
    }

    if (data) {
      if (!(await this.check(inputName, data.id))) {
        data.name = inputName;
        this.crudService.update(environment.baseUrl + 'api', subUrl, data.id, data).subscribe((res: any) => {
          this.itmeSearch();
        });
      }
    } else {
      if (!(await this.check(inputName, null))) {
        this.crudService
          .add(environment.baseUrl + 'api', subUrl, {
            name: inputName,
          })
          .subscribe((res: any) => {
            this.itmeSearch();
          });
      }
    }
  }

  itmeSearch() {
    if (this.type === 'heiStatus') {
      this.dialogTitle = '状态配置';

      if (this.searchName === '') {
        this.crudService.searchAll(environment.baseUrl + 'api', 'hei-status').subscribe((res: any) => {
          this.listHeiStatus = res;
        });
      } else {
        this.crudService
          .search(environment.baseUrl + 'api', 'hei-status', {
            filter: [`name||$cont||${this.searchName}`],
          })
          .subscribe((res: any[]) => {
            this.listHeiStatus = res;
          });
      }
    } else if (this.type === 'heiPlatform') {
      this.dialogTitle = '平台配置';

      if (this.searchName === '') {
        this.crudService.searchAll(environment.baseUrl + 'api', 'hei-platform').subscribe((res: any) => {
          this.listHeiPlatform = res;
        });
      } else {
        this.crudService
          .search(environment.baseUrl + 'api', 'hei-platform', {
            filter: [`name||$cont||${this.searchName}`],
          })
          .subscribe((res: any[]) => {
            this.listHeiPlatform = res;
          });
      }
    } else if (this.type === 'heiStrikeMode') {
      this.dialogTitle = '打击方式配置';

      if (this.searchName === '') {
        this.crudService.searchAll(environment.baseUrl + 'api', 'hei-strike-mode').subscribe((res: any) => {
          this.listHeiStrikeMode = res;
        });
      } else {
        this.crudService
          .search(environment.baseUrl + 'api', 'hei-strike-mode', {
            filter: [`name||$cont||${this.searchName}`],
          })
          .subscribe((res: any[]) => {
            this.listHeiStrikeMode = res;
          });
      }
    }
  }

  convertList(list: any[]) {
    list = list.map((_item: any, idx: number) => {
      return {
        id: idx + 1,
        name: _item.name,
        updatedTime: this.datePipe.transform(_item.updatedTime, 'yyyy-MM-dd HH:mm:ss'),
      };
    });
    return list;
  }

  download($event: MouseEvent) {
    let data = [];
    let sheetName = '';

    if (this.type === 'heiStatus') {
      sheetName = '状态列表';
      data = [this.columns.map(i => i.title)];
      // this.convertList(this.listItem).forEach(i => data.push(this.columns.map(c => i[c.index as string])));
    } else if (this.type === 'heiPlatform') {
      sheetName = '平台列表';
      data = [this.columns.map(i => i.title)];
      // this.convertList(this.listObject).forEach(i => data.push(this.columns.map(c => i[c.index as string])));
    } else if (this.type === 'heiStrikeMode') {
      sheetName = '打击方式列表';
      data = [this.columns.map(i => i.title)];
      // this.convertList(this.listObject).forEach(i => data.push(this.columns.map(c => i[c.index as string])));
    }

    this.xlsx.export({
      sheets: [
        {
          data,
          name: sheetName,
        },
      ],
    });
  }
}

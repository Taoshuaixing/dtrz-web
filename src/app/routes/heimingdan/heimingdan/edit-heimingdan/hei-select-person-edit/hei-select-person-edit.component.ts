import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CrudService } from '../../../../crud.service';
import { environment } from '@env/environment';
import { FormBuilder } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { DatePipe } from '@angular/common';
import { SettingsService } from '@delon/theme';
import {XlsxService} from '@delon/abc/xlsx';

@Component({
  selector: 'app-hei-select-person-edit',
  templateUrl: './hei-select-person-edit.component.html',
  styles: [],
})
export class HeiSelectPersonEditComponent implements OnInit {
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
  isOpenStatus = false;
  listHeiStatus: any = [];
  searchForm: any;
  searchName = '';
  loading: any;
  @Input() type: string;
  @Output() hide_emitter = new EventEmitter();
  listHeiPerson: any = [];
  pageIndex = 1;
  pageSize = 10;

  ngOnInit() {
    this.searchForm = this.fb.group({
      searchName: [null, []],
    });
  }

  showInit() {
    this.searchName = '';
    this.itmeSearch();
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
    // this.hide_emitter.emit();
  }

  // 选中重点人
  selectPerson(obj: any) {
    this.isVisible = false;
    // 传递结果给父页面
    this.hide_emitter.emit({
      personId: obj.id,
      personName: obj.personName,
    });
  }

  // 名称编辑回调函数
  async callbackEmitter(inputName: string, data: any) {
    if (data) {
      if (!(await this.check(inputName, data.id))) {
        data.personName = inputName;
        this.crudService.update(environment.baseUrl + 'api', 'heimingdan', data.id, data).subscribe((res: any) => {
          this.itmeSearch();
        });
      }
    } else {
      if (!(await this.check(inputName, null))) {
        this.crudService
          .add(environment.baseUrl + 'api', 'heimingdan', {
            personName: inputName,
          })
          .subscribe((res: any) => {
            this.itmeSearch();
          });
      }
    }
  }

  itmeSearch() {
    const searchList = {
      filter: [],
      join: [],
      sort: [],
    };
    searchList.join = ['parent'];

    searchList.filter.push(`deleteFlag||$eq||0`);
    searchList.filter.push(`parent.id||$isnull`);
    searchList.filter.push(`parent.id||$isnull`);
    searchList.sort.push(`id,DESC`);
    if (this.searchName) {
      searchList.filter.push(`personName||$cont||${this.searchName}`);
    }

    this.crudService.search(environment.baseUrl + 'api', 'heimingdan', searchList).subscribe((res: any[]) => {
      console.log('res', res);
      this.listHeiPerson = res;
    });
  }

  /**
   * 是否存在check
   * @param inputName
   * @param id
   */
  async check(inputName: any, id: number): Promise<boolean> {
    if (id) {
      const cnt: number = await new Promise<number>(resolve => {
        this.crudService
          .search(environment.baseUrl + 'api', 'heimingdan', {
            filter: [`id||$ne||${id}`, `personName||$eq||${inputName}`],
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
          .search(environment.baseUrl + 'api', 'heimingdan', {
            filter: [`personName||$eq||${inputName}`],
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
}

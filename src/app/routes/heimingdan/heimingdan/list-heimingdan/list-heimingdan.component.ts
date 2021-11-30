import { ExcelDownloadService } from './../../../excelDownload.service';
import { Component, OnInit } from '@angular/core';
import { CrudService } from '../../../crud.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { environment } from '@env/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { base64encoder, base64decoder } from '@shared/utils/base64';
import { DatePipe } from '@angular/common';
import { Observable, Observer } from 'rxjs';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { ACLService } from '@delon/acl';

@Component({
  selector: 'app-list-heimingdan',
  templateUrl: './list-heimingdan.component.html',
  styleUrls: ['./list-heimingdan.component.css'],
})
export class ListHeimingdanComponent implements OnInit {
  constructor(
    private crudService: CrudService,
    private router: Router,
    private excelService: ExcelDownloadService,
    public msg: NzMessageService,
    private activedrouted: ActivatedRoute,
    private datePipe: DatePipe,
    private modalService: NzModalService,
    private aclService: ACLService,
  ) { }

  dataList: any = [];
  loading = true;
  showUploadList = false;
  personCnt = 0;
  highLightFlag = false;

  listOfStatus: Array<{ label: string; value: string }> = [];
  listOfPlatform: Array<{ label: string; value: string }> = [];
  listOfStrikeMode: Array<{ label: string; value: string }> = [];

  search = {
    pageSize: 0,
    pageIndex: 1,
    blackTime: null,
    nickName: '',
    platform: null,
    closeTime: null,
    strikeMode: null,
    registerTel: '',
    status: null,
    personName: '',
    registerName: '',
    registerCardID: '',
  };

  sortValue: string | null = null;
  sortKey: string | null = null;

  searchList = {
    limit: 0,
    page: 1,
    filter: [],
    join: [],
    sort: [],
  };

  searchListStr = '';

  pageIndex = 1;
  pageSize = 10;
  total = 0;
  actionUrl = environment.baseUrl + 'api/heimingdan/upload';

  isAllDisplayDataChecked = false;
  isIndeterminate = false;
  listOfDisplayData: ItemData[] = [];
  mapOfCheckedId: { [key: string]: boolean } = {};
  adminFlag = 0;
  
  async ngOnInit() {

    const userRoles = this.aclService.data.roles;
    if (userRoles) {
      this.adminFlag = userRoles.indexOf("dagl_admin") >= 0 ? 1 : 0;
    }
    // 获取状态列表
    this.getStatusList();

    // 获取平台列表
    this.getPlatformList();

    // 获取打击方式列表
    this.getStrikeModeList();

    this.activedrouted.queryParams.subscribe(params => {
      if (params) {
        const detailSearchStr = params.searchListStr;
        // 如果检索条件不为空（详情页返回）,设置页面检索条件及状态
        if (detailSearchStr) {
          const detailSearchObj = JSON.parse(base64decoder(detailSearchStr));
          this.setSearchList(detailSearchObj);
          this.getData(false);
        } else {
          this.getData(true);
        }
      }
    });
  }

  // 详情页返回时 设置检索条件
  setSearchList(searchObj: any): void {
    if (!searchObj) { return; }
    this.pageSize = searchObj.pageSize;
    this.pageIndex = searchObj.pageIndex;
    this.search.nickName = searchObj.nickName;
    this.search.personName = searchObj.personName;
    this.search.strikeMode = searchObj.strikeMode;
    this.search.status = searchObj.status;
    this.search.platform = searchObj.platform;
    this.search.registerCardID = searchObj.registerCardID;
    this.search.registerName = searchObj.registerName;
    this.search.registerTel = searchObj.registerTel;
    this.search.blackTime = searchObj.blackTime;
    this.search.closeTime = searchObj.closeTime;
  }

  /* 获取排序规则 */
  sort(sort: { key: string; value: string }): void {
    this.sortKey = sort.key;
    if (sort.value) {
      // tslint:disable-next-line: prefer-conditional-expression
      if (sort.value === 'ascend') {
        this.sortValue = 'ASC';
      } else {
        this.sortValue = 'DESC';
      }
    } else {
      this.sortKey = '';
      this.sortValue = '';
    }
    this.getData();
  }

   

  getSearchStr() {
    // 封装检索条件
    this.searchList.limit = this.pageSize;
    this.searchList.page = this.pageIndex;

    this.searchList.filter = [];
    this.searchList.sort = [];
    this.searchList.join = [];

    this.searchList.join = ['heiStatus', 'heiPlatform', 'parent', 'strikeMode'];
    this.searchList.filter.push(`deleteFlag||$eq||0`);

    // 查询父id为null的数据
    this.searchList.filter.push(`parent.id||$notnull`);
    if (this.search.nickName) {
      this.searchList.filter.push(`nickName||$cont||${this.search.nickName}`);
    }
    if (this.search.personName) {
      this.searchList.filter.push(`personName||$cont||${this.search.personName}`);
    }
    if (this.search.strikeMode) {
      this.searchList.filter.push(`strikeMode.id||$eq||${this.search.strikeMode}`);
    }
    if (this.search.status) {
      this.searchList.filter.push(`heiStatus.id||$eq||${this.search.status}`);
    }
    if (this.search.platform) {
      this.searchList.filter.push(`heiPlatform.id||$eq||${this.search.platform}`);
    }
    if (this.search.registerCardID) {
      this.searchList.filter.push(`registerCardID||$cont||${this.search.registerCardID}`);
    }
    if (this.search.registerName) {
      this.searchList.filter.push(`registerName||$cont||${this.search.registerName}`);
    }
    if (this.search.registerTel) {
      this.searchList.filter.push(`registerTel||$cont||${this.search.registerTel}`);
    }
    if (this.search.blackTime) {
      const arr = this.getDate(this.search.blackTime);
      if (arr !== null && arr.length === 2) {
        this.searchList.filter.push(`blackTime||$gte||${arr[0]}`);
        this.searchList.filter.push(`blackTime||$lte||${arr[1]}`);
      }
    }
    if (this.search.closeTime) {
      const arr = this.getDate(this.search.closeTime);
      if (arr !== null && arr.length === 2) {
        this.searchList.filter.push(`closeTime||$gte||${arr[0]}`);
        this.searchList.filter.push(`closeTime||$lte||${arr[1]}`);
      }
    }

    if (this.sortKey) {
      if (this.sortKey === 'heiPlatform' || this.sortKey === 'heiStatus') {
        this.searchList.sort.push(this.sortKey + '.id' + ',' + this.sortValue);
      } else if (this.sortKey === 'heiStrikeMode') {
        this.searchList.sort.push('strikeMode' + '.id' + ',' + this.sortValue);
      } else {
        this.searchList.sort.push(this.sortKey + ',' + this.sortValue);
      }
    }

    this.searchList.sort.push(`parent.id,ASC`);
  }

  /* 获取列表数据 */
  async getData(reset: boolean = false) {
    this.loading = true;

    if (reset) {
      this.pageIndex = 1;
    }
    this.search.pageSize = this.pageSize;
    this.search.pageIndex = this.pageIndex;

    this.getSearchStr();
    this.searchListStr = base64encoder(JSON.stringify(this.search));

    //#region 仅用于人数统计
    const searchListForStat = JSON.parse(JSON.stringify(this.searchList));

    // 移除分页条件
    delete searchListForStat.limit;
    delete searchListForStat.page;
    this.personCnt = await new Promise((resolve, reject) => {
      this.crudService.search(environment.baseUrl + 'api', 'heimingdan', searchListForStat).subscribe((res: any) => {
        const parentList = [];
        res.map(m => {
          if (parentList.indexOf(m.parent.id) < 0) {
            parentList.push(m.parent.id);
          }
        });
        resolve(parentList.length);
      });
    });

    //#endregion
    // 获取用户列表
    await new Promise((resolve, reject) => {
      this.crudService
        .search(environment.baseUrl + 'api', 'heimingdan', this.searchList)
        .subscribe((res_heiList: any) => {
          this.dataList = [];

          if (res_heiList && res_heiList.data) {
            const parentIdList = [];
            const exists = [];
            res_heiList.data.map(m => {
              if (exists.indexOf(m.parent.id) < 0) {
                exists.push(m.parent.id);
                parentIdList.push({ id: m.parent.id, name: m.parent.personName });
              }
            });
            const newList = parentIdList.map(s => {
              return {
                parentId: s.id,
                personName: s.personName,
                children: res_heiList.data.filter(f => f.parent.id === s.id),
              };
            });

            for (const item of newList) {
              let first = true;
              for (const it of item.children) {
                if (first) {
                  first = false;
                  this.dataList.push({ ...it, rowspan: item.children.length });
                } else {
                  this.dataList.push({ ...it, hideflag: true });
                }
              }
            }
          }
          this.total = res_heiList.total;
          this.loading = false;
          this.listOfDisplayData = [];
          this.mapOfCheckedId = {};
          // resolve(this.dataList);
        });
    });
  }

  addPerson() {
    // window.open('/#/person/detail/' + this.personageId);
    this.router.navigate(['/heimingdan/edit']);
  }

  updatePerson(personId: number) {
    // window.open('/#/person/detail/' + this.personageId);
    this.router.navigate(['/heimingdan/edit'], {
      queryParams: {
        personId,
        searchListStr: this.searchListStr,
      },
    });
  }

  // 重置检索条件
  reset() {
    this.searchListStr = '';
    this.search.nickName = '';
    this.search.platform = null;
    this.search.strikeMode = null;
    this.search.status = null;
    this.search.closeTime = null;
    this.search.blackTime = null;
    this.search.registerTel = '';
    this.search.personName = '';
    this.search.registerName = '';
    this.search.registerCardID = '';
  }

  async getStatusList() {
    const p = await new Promise((resolve, reject) => {
      // 获取事项列表
      this.crudService.searchAll(environment.baseUrl + 'api', 'hei-status').subscribe((res_eventItem: any[]) => {
        this.listOfStatus = [];
        for (const it of res_eventItem) {
          this.listOfStatus.push({ label: it.name, value: it.id });
        }
      });
    });
    return p;
  }

  async getPlatformList() {
    const p = await new Promise((resolve, reject) => {
      // 获取对象列表
      this.crudService.searchAll(environment.baseUrl + 'api', 'hei-platform').subscribe((res_eventObject: any[]) => {
        this.listOfPlatform = [];
        for (const it of res_eventObject) {
          this.listOfPlatform.push({ label: it.name, value: it.id });
        }
      });
    });
    return p;
  }

  async getStrikeModeList() {
    const p = await new Promise((resolve, reject) => {
      // 获取对象列表
      this.crudService.searchAll(environment.baseUrl + 'api', 'hei-strike-mode').subscribe((res_eventObject: any[]) => {
        this.listOfStrikeMode = [];
        for (const it of res_eventObject) {
          this.listOfStrikeMode.push({ label: it.name, value: it.id });
        }
      });
    });
    return p;
  }

  async deletePersonList() {
    this.loading = true;
    const ids = [];
    const selectedList = this.dataList.filter(f => this.mapOfCheckedId[f.id]);

    for (const item of selectedList) {
      ids.push(item.id);
    }

    if (ids.length === 0) {
      this.loading = false;
      this.msg.create('info', '请选择删除账号昵称');
      return;
    } else {

      this.modalService.confirm({
        nzTitle: '删除数据',
        nzContent: '<b style="color: red;">确定删除这些数据吗？</b>',
        nzOkType: 'danger',
        nzOnOk: async () => {
          const count = await this.deleteUserForList(ids);
          setTimeout(() => {
            if (count !== 0 && count === ids.length) {
              this.loading = false;
              this.msg.success('删除成功');
              this.getData(true);
            }
          }, 500);
        },
        nzOnCancel: () => {
          this.loading = false;
          console.log('Cancel');
        },
      });

    }
  }

  async deleteUserForList(params: any): Promise<number> {
    let count = 0;
    if (params) {
      const res = await new Promise(async (resolve, reject) => {
        for (const id of params) {
          const r = await new Promise((resolve_1, reject_1) => {
            this.crudService.del(environment.baseUrl + 'api', 'heimingdan', id).subscribe(res_articles => {
              count++;
              resolve_1(1);
            });
          });
        }
        resolve(count);
      });
    }
    return count;
  }

  // 删除当前黑名单
  deletePerson(personId: number) {
    if (personId !== 0) {
      this.modalService.confirm({
        nzTitle: '删除数据',
        nzContent: '<b style="color: red;">确定删除此数据吗？</b>',
        nzOkType: 'danger',
        nzOnOk: () => {
          this.crudService.del(environment.baseUrl + 'api', 'heimingdan', personId).subscribe(res => {
            this.loading = false;
            this.msg.success('删除成功');
            this.getData(true);
          });
        },
        nzOnCancel: () => console.log('Cancel'),
      });
    }
  }

  getDate(val: any): any[] {
    let beginTime = '';
    let endTime = '';

    const dateTmp = [];
    // 统计时间
    if (val && val.length === 2) {
      beginTime = this.datePipe.transform(val[0], 'yyyy-MM-dd');
      endTime = this.datePipe.transform(val[1], 'yyyy-MM-dd');

      dateTmp.push(beginTime + ' 00:00:00');
      dateTmp.push(endTime + ' 23:59:59');
    }

    return dateTmp;
  }
  async download($event: any) {
    this.loading = true;

    this.getSearchStr();

    const searchListForDown = JSON.parse(JSON.stringify(this.searchList));
    // 移除分页条件
    delete searchListForDown.limit;
    delete searchListForDown.page;

    const ids = [];
    const selectedList = this.dataList.filter(f => this.mapOfCheckedId[f.id]);

    for (const item of selectedList) {
      ids.push(item.id);
    }

    if (ids.length > 0) {
      searchListForDown.filter.push(`id||$in||${ids.join(',')}`);
    }
    this.excelService.download('heimingdan', 'api/heimingdan/export', searchListForDown,true);
    this.loading = false;
  }

  beforeUpload = (file: File) => {
    return new Observable((observer: Observer<boolean>) => {
      const isExcel = file.type.indexOf('excel') >= 0 || file.type.indexOf('spreadsheetml') >= 0;
      if (!isExcel) {
        this.msg.error('只能导入Excel类型的文件！');
        observer.complete();
        return;
      }

      observer.next(isExcel);
      observer.complete();
    });
  }

  async uploadChange($event: any) {
    if (!$event) {
      return;
    }

    this.showUploadList = true;
    this.loading = true;

    if ($event.type === 'success') {
      // setTimeout(async () => {
      this.getData(true);
      this.msg.create('success', '导入重点人成功！');
      this.showUploadList = false;
      $event.fileList.pop();
      // }, 1000);
    }
  }

  checkAll(value: boolean): void {
    this.listOfDisplayData.forEach(item => (this.mapOfCheckedId[item.id] = value));
    this.refreshStatus();
  }

  currentPageDataChange($event: ItemData[]): void {
    this.listOfDisplayData = $event;
    this.refreshStatus();
  }

  refreshStatus(): void {
    this.isAllDisplayDataChecked = this.listOfDisplayData.every(item => this.mapOfCheckedId[item.id]);
    this.isIndeterminate =
      this.listOfDisplayData.some(item => this.mapOfCheckedId[item.id]) && !this.isAllDisplayDataChecked;
  }
}

interface ItemData {
  id: number;
  name: string;
}

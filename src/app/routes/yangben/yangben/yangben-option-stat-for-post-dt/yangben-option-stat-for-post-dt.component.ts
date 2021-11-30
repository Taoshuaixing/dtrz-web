import { Component, OnInit } from '@angular/core';
import { CrudService } from '../../../crud.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { SettingsService } from '@delon/theme';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '@env/environment';
import { YangbenService } from '../../yangben.service';
import { ACLService } from '@delon/acl';
import { differenceInCalendarDays } from 'date-fns';
import { CommonService } from '@shared/service/common-service';

@Component({
  selector: 'app-yangben-option-stat-for-post-dt',
  templateUrl: './yangben-option-stat-for-post-dt.component.html',
  styles: [],
})
export class YangbenOptionStatForPostDTComponent implements OnInit {
  listOfAllData = [];
  loading: any;
  total = 1;
  pageIndex = 1;
  pageSize = 10;

  searchList = {
    limit: 0,
    page: 1,
    filter: [],
    join: [],
    postId: 0,
    chuzhiTime: [],
    duty: '',
  };
  adminFlag = 0;
  wenziFlag = 0;

  fieldList: any;
  chuzhiCntFieldId = 0;
  chuzhiTimeFieldId = 0;

  constructor(
    private crudService: CrudService,
    private modalService: NzModalService,
    public settingService: SettingsService,
    private activedrouted: ActivatedRoute,
    public msg: NzMessageService,
    private aclService: ACLService,
    public yangbenService: YangbenService,
    private router: Router,
    public commonService: CommonService,
  ) {}

  async ngOnInit() {
    // if (this.aclService.data.roles.indexOf("dagl_admin") >= 0) {
    //   // 管理员
    //   this.adminFlag = 1;
    // } else if (this.aclService.data.roles.indexOf("dagl_editor") >= 0 ){
    //   // 文字岗
    //   this.wenziFlag = 1;
    // }

    if (this.aclService.data.roles.indexOf('dagl_post') >= 0 || this.aclService.data.roles.indexOf('dagl_admin') >= 0) {
      this.searchList.postId = this.settingService.user.posts[0].id;
    }

    this.fieldList = await this.yangbenService.getAllField();
    const chuzhiCntField = this.fieldList.find((f) => f.fixName === 'chuzhiCnt');
    const chuzhiTimeField = this.fieldList.find((f) => f.fixName === 'chuzhiTime');
    if (chuzhiCntField) this.chuzhiCntFieldId = chuzhiCntField.id;
    if (chuzhiTimeField) this.chuzhiTimeFieldId = chuzhiTimeField.id;
    await this.getData();
  }

  async getData(reset: boolean = false) {
    this.listOfAllData = [];
    this.loading = true;
    this.crudService
      .search(environment.baseUrl + 'api', 'yangben-option-config/getParentData', '')
      .subscribe(async (res: any) => {
        this.listOfAllData = res;

        for (let i = 0; i < this.listOfAllData.length; i++) {
          let item = this.listOfAllData[i];
          const field = this.fieldList.find((f) => f.yangbenOptionConfig?.id === item.id);
          if (field) {
            item.field = field;
          }

          this.searchList.filter = [];

          this.searchList.filter.push(`parent.id||$eq||${item.id}`);
          this.searchList.join = ['parent'];
          this.searchList.filter.push(`deleteFlag||$eq||0}`);
          this.searchList.limit = this.pageSize;
          this.searchList.page = this.pageIndex;
          this.searchList.chuzhiTime = this.commonService.getOneDay19();

          const res1: any = await new Promise((resolve, reject) => {
            this.crudService
              .search(environment.baseUrl + 'api', 'yangben-option-config/listByPostId', this.searchList)
              .subscribe((res1: any) => {
                resolve(res1);
              });
          });

          this.listOfAllData[i] = {
            ...item,
            children: res1.data,
            total: res1.total,
            pageIndex: this.pageIndex,
            pageSize: this.pageSize,
            searchName: '',
            chuzhiTime: this.searchList.chuzhiTime,
            duty: [
              { label: '白班', value: 'm', checked: false },
              { label: '夜班', value: 'n', checked: false },
            ],
          };
        }

        // console.log(this.listOfAllData);
        this.loading = false;
      });
  }

  async getData_one(item = null, reset: boolean = false) {
    this.searchList.filter = [];
    this.searchList.join = [];

    this.searchList.filter.push(`parent.id||$eq||${item.id}`);
    this.searchList.join = ['parent'];
    this.searchList.filter.push(`deleteFlag||$eq||0}`);
    this.searchList.limit = item.pageSize;
    this.searchList.page = item.pageIndex;

    if (item.searchName) {
      this.searchList.page = 1;
      this.searchList.filter.push(`name||$cont||${item.searchName}`);
    }
    this.searchList.chuzhiTime = [];
    if (item.chuzhiTime.length > 0) {
      this.searchList.chuzhiTime = [
        this.commonService.dateToStr(item.chuzhiTime[0]),
        this.commonService.dateToStr(item.chuzhiTime[1]),
      ];
    }

    this.searchList.duty = this.getCheckedDuty(item.duty);

    const res1: any = await new Promise((resolve, reject) => {
      this.crudService
        .search(environment.baseUrl + 'api', 'yangben-option-config/listByPostId', this.searchList)
        .subscribe((res1: any) => {
          resolve(res1);
        });
    });
    item.children = res1.data;
    item.total = res1.total;
    // console.log(item.children);
    this.loading = false;
  }

  getCheckedDuty(duty: any) {
    return duty
      .filter((f) => f.checked)
      .map((m) => {
        return m.value;
      })
      .join(',');
  }
}

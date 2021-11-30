import { Component, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ActivatedRoute } from '@angular/router';
import { environment } from '@env/environment';
import { CrudService } from '../../../../crud.service';
import { SettingsService } from '@delon/theme';
import { StartupService } from '@core';

@Component({
  selector: 'app-position-one',
  templateUrl: './position-one.component.html',
  styleUrls: ['./position-one.component.css'],
})
export class PositionOneComponent implements OnInit {
  constructor(
    private notification: NzNotificationService,
    private modalService: NzModalService,
    private activedrouted: ActivatedRoute,
    private crudService: CrudService,
    public msg: NzMessageService,
    public settingService: SettingsService,
    private startupSrv: StartupService,
  ) { }

  isVisible = false;
  isOkLoading = false;
  checkOptionsOne = [
    { label: '在职', value: '0', checked: true },
    { label: '离职', value: '1', checked: false },
  ];

  dateFormat = 'yyyy/MM/dd';
  form: FormGroup;
  @Output() selected = new EventEmitter<string>();
  loading = false;
  userName: '';
  password: '';
  sex: any;
  userStatus: any;
  remarks: '';
  postId: number;
  roleId: any;
  createUser: any;
  roleTypes: any = [];
  @Input() users: any;

  listOfAllData: UserI[] = [];
  listOfAccount: any[] = [];

  searchList = {
    limit: 0,
    page: 1,
    filter: [],
    join: 'posts',
  };

  searchList_account = {
    limit: 0,
    page: 1,
    filter: [],
    join: 'posts',
  };

  pageIndex = 1;
  pageSize = 10;
  total = 1;

  pageIndex_account = 1;
  pageSize_account = 10;
  total_account = 1;

  ngOnInit(): void {
    this.activedrouted.queryParams.subscribe(params => {
      this.checkOptionsOne = [
        { label: '在职', value: '0', checked: true },
        { label: '离职', value: '1', checked: false },
      ];

      this.postId = Number(params.postId);

      this.getData(true);
      this.getData_account(true);
    });

    // 查询所有的权限，添加用户modal使用
    this.crudService.searchAll(environment.baseUrl_zxtj + 'api', 'role').subscribe(
      res => {
        this.roleTypes = res;
      },
      error => { },
    );
  }

  /* 获取用户且属于该岗位 */
  getData(reset: boolean = false) {
    if (reset) {
      this.pageIndex = 1;
    }

    // 封装检索条件
    this.searchList.limit = this.pageSize;

    this.searchList.page = this.pageIndex;

    this.searchList.filter = [];

    const str = this.getCheckedStr(this.checkOptionsOne);

    if (str) {
      this.searchList.filter.push(`userStatus||$in||${str}`);
    }

    if (this.postId === 0) {
      this.searchList.filter.push('posts.id||$isnull');
    } else {
      this.searchList.filter.push(`posts.id||$eq||${this.postId}`);
    }

    // 填报人员
    this.crudService
      .search(environment.baseUrl_zxtj + 'api', 'user', {
        ...this.searchList,
        filter: [...this.searchList.filter, 'userType||$eq||2', 'deleteFlag||$eq||0'],
      })
      .subscribe((res: any) => {
        this.listOfAllData = res.data;
        this.total = res.total;
      });
  }

  getData_account(reset: boolean = false) {
    if (reset) {
      this.pageIndex_account = 1;
    }

    // 封装检索条件

    this.searchList_account.limit = this.pageSize_account;

    this.searchList_account.page = this.pageIndex_account;

    this.searchList_account.filter = [];

    if (this.postId === 0) {
      this.searchList_account.filter.push('posts.id||$isnull');
    } else {
      this.searchList_account.filter.push(`posts.id||$eq||${this.postId}`);
    }

    // 账户列表
    this.crudService
      .search(environment.baseUrl_zxtj + 'api', 'user', {
        ...this.searchList_account,
        filter: [...this.searchList_account.filter, 'userType||$eq||1', 'deleteFlag||$eq||0'],
      })
      .subscribe((res: any) => {
        this.listOfAccount = res.data;
        this.total_account = res.total;
      });
  }

  /* 获取复选框 选中值 */
  getCheckedStr(value: any[]): string {
    const checkedArr = [];
    let checkedStr = '';

    // 检索复选框值 选中的放入数组
    value
      .filter(item => item.checked === true)
      .forEach(it => {
        checkedArr.push(it.value);
      });

    // 拼接数组元素 放入选中字符串
    checkedStr = checkedArr.join();
    return checkedStr;
  }

  showModal(): void {
    this.isVisible = true;
  }

  /* 删除用户信息 */
  delete(id: any): void {
    this.modalService.confirm({
      nzTitle: '删除员工',
      nzContent: '<b style="color: red;">确定删除此员工吗？</b>',
      // nzOkText: 'Yes',
      nzOkType: 'danger',
      nzOnOk: () => {
        this.crudService.del(environment.baseUrl_zxtj + 'api', 'user', id).subscribe(res => {
          this.getData(true);
          this.msg.create('success', '删除成功');
        });
      },
      // nzCancelText: 'No',
      nzOnCancel: () => console.log('Cancel'),
    });
  }

  /* 删除用户信息 */
  delete_account(id: any): void {
    this.modalService.confirm({
      nzTitle: '删除账户',
      nzContent: '<b style="color: red;">确定删除此账户吗？</b>',
      // nzOkText: 'Yes',
      nzOkType: 'danger',
      nzOnOk: () => {
        this.crudService.del(environment.baseUrl_zxtj + 'api', 'user', id).subscribe(res => {
          this.getData_account(true);
          this.msg.create('success', '删除成功');
        });
      },
      // nzCancelText: 'No',
      nzOnCancel: () => console.log('Cancel'),
    });
  }

  refreshList() {
    this.userName = '';
    this.password = '';
    this.sex = '';
    this.remarks = '';
    this.roleId = '';
    // 刷新
    this.getData();
    this.getData_account();
  }

  getEditorEmitter(callbackResult: any) {
    if (callbackResult.userId) {
      this.crudService
        .update2(environment.baseUrl_zxtj + 'api', 'user', callbackResult.userId, {
          userName: callbackResult.userName,
          realName: callbackResult.realName,
          password: callbackResult.password,
          sex: callbackResult.sex,
          userStatus: callbackResult.userStatus,
          remarks: callbackResult.remarks,
          postId: callbackResult.postId === 0 ? null : callbackResult.postId,
          roles: callbackResult.roles,
          menus: callbackResult.menus,
          loginId: this.settingService.user.userId,
          updateUser: this.settingService.user.userId,
          userType: callbackResult.userType,
        })
        .subscribe(res => {
          this.msg.success('修改成功');
          this.refreshList();
          this.startupSrv.load_profile();
        });
    } else {
      this.crudService
        .add(environment.baseUrl_zxtj + 'api', 'user', {
          userName: callbackResult.userName,
          realName: callbackResult.realName,
          password: callbackResult.password,
          sex: callbackResult.sex,
          userStatus: callbackResult.userStatus,
          remarks: callbackResult.remarks,
          postId: callbackResult.postId === 0 ? null : callbackResult.postId,
          roles: callbackResult.roles,
          menus: callbackResult.menus,
          loginId: this.settingService.user.userId,
          createUser: this.settingService.user.userId,
          userType: callbackResult.userType,
        })
        .subscribe(res => {
          this.msg.success('添加成功');
          this.refreshList();
        });
    }
  }
}

export interface UserI {
  id: number;
  userName: string;
  password?: string;
  sex?: number;
  userStatus?: number;
  remarks?: string;
  postId?: number;
  roleId?: number;
  loginId?: number;
  createUser?: number;
}

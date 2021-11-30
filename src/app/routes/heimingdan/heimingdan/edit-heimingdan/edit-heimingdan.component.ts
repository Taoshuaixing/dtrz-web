import { PersonageI } from './../../../person/person.module';
import { Component, OnInit } from '@angular/core';

import { environment } from '@env/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { CrudService } from '../../../crud.service';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-edit-heimingdan',
  templateUrl: './edit-heimingdan.component.html',
  styleUrls: ['./edit-heimingdan.component.less'],
})
export class EditHeimingdanComponent implements OnInit {
  constructor(
    private crudService: CrudService,
    private activedrouted: ActivatedRoute,
    private router: Router,
    public msgSrv: NzMessageService,
    private fb: FormBuilder,
    private modalService: NzModalService,
  ) { }



  loading = false;

  baseUrl = environment.baseUrl;
  subUrl = 'api/article/upload-file/';
  imgsrc = environment.baseUrl + 'api/article/down/';

  uploadFlg = false;

  // 检索条件
  searchListStr: string;

  personId: number = null;
  validateForm!: FormGroup;

  title = ' ';
  personName = '';
  nickName = '';
  accountEnID = '';
  accountNumID = '';
  platform = null;
  closeTime: any;
  status = null;
  strikeMode = null;
  registerTime: Date;
  registerTel = '';
  registerName = '';
  registerCardID = '';
  registerEquipmentID = '';
  blackTime: Date;
  mark = '';
  parentId = null;

  listOfPerson: Array<{ label: string; value: string }> = [];

  listOfStatus: Array<{ label: string; value: string }> = [];
  listOfPlatform: Array<{ label: string; value: string }> = [];
  listOfStrikeMode: Array<{ label: string; value: string }> = [];

  nzFilterOption = () => true;

  async ngOnInit() {
    this.loading = false;
    // 验证初始化
    this.validateForm = this.fb.group({
      personName: [null, [Validators.required]],
      nickName: [null, []],
      accountEnID: [null, []],
      accountNumID: [null, []],
      heiPlatform: [null, []],
      closeTime: [null, []],
      heiStatus: [null, []],
      heiStrikeMode: [null, []],
      registerTime: [null, []],
      registerTel: [null, []],
      registerName: [null, []],
      registerCardID: [null, []],
      registerEquipmentID: [null, []],
      blackTime: [null, []],
      mark: [null, []],
    });

    this.activedrouted.queryParams.subscribe(params => {
      if (params.personId) {
        this.personId = Number(params.personId);
      }

      this.searchListStr = params.searchListStr;
    });

    // 获取状态列表
    this.getStatusList();

    // 获取平台列表
    this.getPlatformList();

    // 获取打击方式列表
    this.getStrikeModeList();

    // 获取当前记录
    if (this.personId) {
      this.crudService.get(environment.baseUrl + 'api', 'heimingdan', this.personId).subscribe((res: any) => {
        this.personName = res.personName;
        this.nickName = res.nickName;
        this.accountEnID = res.accountEnID;
        this.accountNumID = res.accountNumID;
        this.closeTime = res.closeTime;
        this.registerTime = res.registerTime;
        this.registerTel = res.registerTel;
        this.registerName = res.registerName;
        this.registerCardID = res.registerCardID;
        this.registerEquipmentID = res.registerEquipmentID;
        this.blackTime = res.blackTime;
        this.mark = res.mark;
        this.title = res.personName;
        this.parentId = res.parent.id;
        if (res.heiStatus) {
          this.status = res.heiStatus.id;
        }
        if (res.heiPlatform) {
          this.platform = res.heiPlatform.id;
        }
        if (res.strikeMode) {
          this.strikeMode = res.strikeMode.id;
        }
      });
    }
  }

  async checkPersonName(): Promise<boolean> {
    const checkSearch = {
      nickName: '',
      accountEnID: '',
      accountNumID: '',
      personName: this.personName,
    };

    if (this.nickName) {
      checkSearch.nickName = this.nickName;
    }

    if (this.accountEnID) {
      checkSearch.accountEnID = this.accountEnID;
    }

    if (this.accountNumID) {
      checkSearch.accountNumID = this.accountNumID;
    }

    const p = await new Promise((resolve, reject) => {
      // 获取事项列表
      this.crudService
        .add(environment.baseUrl + 'api', 'heimingdan/exists', checkSearch)
        .subscribe((res_eventItem: any[]) => {
          if (this.personId) {
            res_eventItem = res_eventItem.filter(f => f.id !== this.personId);
          }
          resolve(res_eventItem.length > 0);
        });
    });

    if (p) {
      return true;
    }
    return false;
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

  // 保存黑名单信息
  async save(): Promise<void> {
    if (!this.validateForm.valid) {
      // tslint:disable-next-line:forin
      for (const i in this.validateForm.controls) {
        this.validateForm.controls[i].markAsDirty();
        this.validateForm.controls[i].updateValueAndValidity();
      }
      return;
    }

    if (await this.checkPersonName()) {
      this.msgSrv.warning(`该账号已存在！（存在依据【重点人名称、账号昵称、账号英文ID、账号数字ID】）`);
      return;
    }
    this.loading = true;
    // 开始保存
    if (this.personId) {
      // 修改
      this.crudService
        .update(environment.baseUrl + 'api', 'heimingdan', this.personId, {
          id: this.personId,
          personName: this.personName,
          nickName: this.nickName,
          accountEnID: this.accountEnID,
          accountNumID: this.accountNumID,
          heiPlatform: this.platform,
          closeTime: this.closeTime,
          heiStatus: this.status,
          strikeMode: this.strikeMode,
          registerTime: this.registerTime,
          registerTel: this.registerTel,
          registerName: this.registerName,
          registerCardID: this.registerCardID,
          registerEquipmentID: this.registerEquipmentID,
          blackTime: this.blackTime,
          mark: this.mark,
          parent: { id: this.parentId },
        })
        .subscribe(res1 => {
          this.loading = false;
          this.msgSrv.success('修改成功');
          // this.ngOnInit();
          this.closeWin();
        });
    } else {
      // 新增
      this.crudService
        .add(environment.baseUrl + 'api', 'heimingdan', {
          id: 0,
          personName: this.personName,
          nickName: this.nickName,
          accountEnID: this.accountEnID,
          accountNumID: this.accountNumID,
          heiPlatform: this.platform,
          closeTime: this.closeTime,
          heiStatus: this.status,
          strikeMode: this.strikeMode,
          registerTime: this.registerTime,
          registerTel: this.registerTel,
          registerName: this.registerName,
          registerCardID: this.registerCardID,
          registerEquipmentID: this.registerEquipmentID,
          blackTime: this.blackTime,
          mark: this.mark,
          parent: { id: this.parentId },
        })
        .subscribe(res => {
          this.loading = false;
          this.msgSrv.success('新增成功');
          // this.ngOnInit();
          this.closeWin();
        });
    }
  }

  // 删除当前黑名单
  deletePerson() {
    if (this.personId !== 0) {
      this.modalService.confirm({
        nzTitle: '删除数据',
        nzContent: '<b style="color: red;">确定删除此数据吗？</b>',
        nzOkType: 'danger',
        nzOnOk: () => {
          this.crudService.del(this.baseUrl + 'api', 'heimingdan', this.personId).subscribe(res => {
            this.loading = false;
            this.msgSrv.success('删除成功');
            this.closeWin();
          });
        },
        nzOnCancel: () => console.log('Cancel'),
      });

    }
  }

  // 关闭窗口
  closeWin() {
    this.router.navigate(['/heimingdan/list'], {
      queryParams: {
        searchListStr: this.searchListStr,
      },
    });
  }

  // 获取modal中的事件
  getEmitter() {
    // 获取平台列表
    this.getPlatformList();

    // 获取状态列表
    this.getStatusList();

    // 获取打击方式列表
    this.getStrikeModeList();
  }

  getEmitterForSelectPerson(obj: any) {
    this.personName = obj.personName;
    this.parentId = obj.personId;
  }
}

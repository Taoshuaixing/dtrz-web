import {Component, OnInit} from '@angular/core';
import {CrudService} from "../../../crud.service";
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzModalService} from 'ng-zorro-antd/modal';
import {SettingsService} from "@delon/theme";
import {ActivatedRoute, Router} from "@angular/router";
import {environment} from "@env/environment";
import {YangbenService} from '../../yangben.service';
import {ACLService} from "@delon/acl";

@Component({
  selector: 'app-yangben-option-config',
  templateUrl: './yangben-option-config.component.html',
  styleUrls: ['./yangben-option-config.component.css']
})
export class YangbenOptionConfigComponent implements OnInit {
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
    postId: 0
  };

  adminFlag = 0;
  wenziFlag = 0;

  fieldList: any;

  constructor(private crudService: CrudService,
              private modalService: NzModalService,
              public settingService: SettingsService,
              private activedrouted: ActivatedRoute,
              public msg: NzMessageService,
              private aclService: ACLService,
              public yangbenService: YangbenService,
              private router: Router,) {
  }

  async ngOnInit() {

    if (this.aclService.data.roles.indexOf("dagl_admin") >= 0) {
      // 管理员
      this.adminFlag = 1;
    } else if (this.aclService.data.roles.indexOf("dagl_editor") >= 0) {
      // 文字岗
      this.wenziFlag = 1;
    }


    // if(this.aclService.data.roles.indexOf("dagl_post") >= 0 || this.aclService.data.roles.indexOf("dagl_editor") >= 0){
    //   this.searchList.postId  = this.settingService.user.posts[0].id;
    // } 

    this.fieldList = await this.yangbenService.getAllField();
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
          const field = this.fieldList.find(f => f.yangbenOptionConfig?.id === item.id);
          if (field) {
            item.field = field;
          }

          this.searchList.filter = [];

          this.searchList.filter.push(`parent.id||$eq||${item.id}`);
          this.searchList.join = ['parent'];
          this.searchList.filter.push(`deleteFlag||$eq||0}`);
          this.searchList.limit = this.pageSize;
          this.searchList.page = this.pageIndex;

          const res1: any = await new Promise((resolve, reject) => {
            this.crudService.search(environment.baseUrl + 'api', 'yangben-option-config/listByPostId',
              this.searchList
            ).subscribe((res1: any) => {
              resolve(res1)
            });
          });

          this.listOfAllData[i] = {
            ...item,
            children: res1.data,
            total: res1.total,
            pageIndex: this.pageIndex,
            pageSize: this.pageSize,
            searchName: ''
          }
        }

        // console.log(this.listOfAllData);
        this.loading = false;
      });


  }

  async getData_one(item = null, reset: boolean = false) {

    this.searchList.filter = [];

    this.searchList.filter.push(`parent.id||$eq||${item.id}`);
    this.searchList.join = ['parent'];
    this.searchList.filter.push(`deleteFlag||$eq||0}`);
    this.searchList.limit = item.pageSize;
    this.searchList.page = item.pageIndex;

    if (item.searchName) {
      this.searchList.page = 1;
      this.searchList.filter.push(`name||$cont||${item.searchName}`);
    }

    const res1: any = await new Promise((resolve, reject) => {
      this.crudService.search(environment.baseUrl + 'api', 'yangben-option-config/listByPostId',
        this.searchList
      ).subscribe((res1: any) => {
        resolve(res1)
      });
    });
    item.children = res1.data;
    item.total = res1.total;
    if (item.children.length === 0 && item.total > 0) {
      this.getData();
    }
    this.loading = false;
  }

  getEditorEmitter(item, callbackResult: any) {
    this.loading = true;
    if (callbackResult.inputId) {
      this.crudService.update(environment.baseUrl + 'api', 'yangben-option-config', callbackResult.inputId, {
        updateUser: this.settingService.user.userId,
        id: 0,
        name: callbackResult.inputName,
        parent: {id: callbackResult.parentId},
      })
        .subscribe(async res => {
          if (callbackResult.parentId) {
            this.msg.create('info', `相关联样本和事件数据修改中，请耐心等待！`);
            await new Promise<number>(resolve => {
              this.crudService.add(
                environment.baseUrl + 'api', 'yangben-option-config/updateRelationData', {
                  parentId:callbackResult.parentId,
                  yangbenOptionConfigId:callbackResult.inputId,
                  name:callbackResult.inputName
                },
              ).subscribe(res => {
                this.getData_one(item);
                resolve();
                });
            });
          } else {
            // this.getData();
            item.name = callbackResult.inputName;
            this.loading = false;
          }
        });
    } else {
      this.crudService.add(environment.baseUrl + 'api', 'yangben-option-config', {
        createUser: this.settingService.user.userId,
        id: 0,
        name: callbackResult.inputName,
        parent: {id: callbackResult.parentId},
      })
        .subscribe(res => {
          if (callbackResult.parentId) {
            this.getData_one(item);
          } else {
            this.getData();
          }
        });
    }
  }

  updateYangbenCnt() {
    this.crudService.add(
      environment.baseUrl + 'api', 'yangben-option-config/updateYangbenCnt', {},
    )
      .subscribe(res => {
        this.getData();
      });
  }

  /**
   * 是否存在check
   * @param inputName
   * @param id
   */
  async check(inputName: any, id: number, parentId: any): Promise<boolean> {

    const filter = [`name||$eq||${inputName}`];
    if (parentId) {
      filter.push(`parent.id||$eq||${parentId}`);
    } else {
      filter.push(`parent.id||isnull`);
    }

    if (id) {
      filter.push(`id||$ne||${id}`)
    }

    const cnt: number = await new Promise<number>(resolve => {
      this.crudService
        .search(environment.baseUrl + 'api', 'yangben-option-config', {
          filter: filter,
          join: ['parent']
        })
        .subscribe((res: any[]) => {
          resolve(res.length);
        });
    });
    return cnt > 0;
  }

  del(item: any, data: any) {

    const id = data.id;

    if(item && data.yangbenCnt > 0 ){
      this.msg.warning(`当前数据关联样本，暂不可删除！`);
      return;
    }

    this.modalService.confirm({
      nzTitle: `操作删除`,
      nzContent: `<b style="color: red;">确定删除该名称吗？</b>`,
      nzOkType: 'danger',
      nzOnOk: async () => {
        if (!await this.checkRef(id)) {
          this.crudService.del(environment.baseUrl + 'api', 'yangben-option-config', id).subscribe((res: any) => {
            this.msg.create('success', `删除成功`);
            if (item) {
              this.getData_one(item);
            } else {
              this.getData();
            }
          });
        } else {
          this.msg.warning(`当前数据被引用，暂不可删除！`);
        }

      },
      nzOnCancel: () => console.log('Cancel'),
    });
  }

  async checkRef(id: any) {

    let cnt: number = await new Promise<number>(resolve => {
      this.crudService
        .search(environment.baseUrl + 'api', 'yangben-field-define', {
          filter: [`yangbenOptionConfig.id||$eq||${id}`],
          join: [`yangbenOptionConfig`]
        })
        .subscribe((res: any[]) => {
          resolve(res.length);
        });
    });

    if (!(cnt > 0)) {
      cnt = await new Promise<number>(resolve => {
        this.crudService
          .search(environment.baseUrl + 'api', 'yangben-event-field-define', {
            filter: [`yangbenOptionConfig.id||$eq||${id}`],
            join: [`yangbenOptionConfig`]
          })
          .subscribe((res: any[]) => {
            resolve(res.length);
          });
      });
    }

    return cnt > 0;
  }

  async getTextareaEmitter(item, callbackResult: any) {
    this.loading = true;
    this.msg.create('info', `批量增加中，请稍加等待。。。`);
    const inputNameList = callbackResult.nameList;
    const parentId = callbackResult.parentId;

    const nameList: any[] = await new Promise<any>(resolve => {
      this.crudService
        .search(environment.baseUrl + 'api', 'yangben-option-config', {
          filter: [`parent.id||$eq||${parentId}`],
          join: ['parent']
        })
        .subscribe((res: any[]) => {
          res = res.map(m => {
            return m.name;
          });
          resolve(res);
        });
    });

    const saveList = [];
    inputNameList.map(m => {
      const check1 = nameList.find(f => f === m);
      const check2 = saveList.find(ff => ff.name === m);
      if (!check1 && !check2) {
        saveList.push({
          createUser: this.settingService.user.userId,
          id: 0,
          name: m,
          parentId: callbackResult.parentId,
        });
      }
    });

    this.crudService
      .add(environment.baseUrl + 'api', 'yangben-option-config/saveBatch', {
        yangbenOptionConfigs: saveList,
      })
      .subscribe((res) => {
        this.msg.create('success', `批量增加成功`);
        this.getData_one(item);
        this.loading = false;
      });

  }


}

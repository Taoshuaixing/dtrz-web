import { Component, OnInit } from '@angular/core';
import {CrudService} from "../../../crud.service";
import {NzModalService} from "ng-zorro-antd/modal";
import {NzMessageService} from "ng-zorro-antd/message";
import {Router} from "@angular/router";
import {environment} from "@env/environment";
import {SettingsService} from "@delon/theme";

@Component({
  selector: 'app-keyword-instruct',
  templateUrl: './keyword-instruct.component.html',
  styles: [
  ]
})
export class KeywordInstructComponent implements OnInit {

  constructor(private crudService: CrudService,
              private modalService: NzModalService,
              public msg: NzMessageService,
              public settingService: SettingsService,
              private router: Router,) { }

  searchName: any;
  listOfAllData = [];
  loading = false;
  pageIndex = 1;
  pageSize = 10;
  userList = [];
  searchList = {
    limit: 0,
    page: 1,
    filter: [],
    join:[],
  };
  total: any;

 async ngOnInit(){
     await this.getUserList();
     await this.getData();
  }

  edit(id: any) {

    this.router.navigate(['yangben/yangben-field-define-edit'], {
      queryParams: {
        tempId: id
      },
    });

  }

  currentPageDataChange($event: any[]) {
    
  }

  del(id: any) {

    this.crudService.search(environment.baseUrl + 'api', 'rule',{
      filter:[`ruleCommand.id||$eq||${id}`],
      join:['rule']
    }).subscribe((res1: any) => {
      if(res1.length > 0){
        this.msg.success('指令已被使用，不可删除');
        return;
      }else{
        this.modalService.confirm({
          nzTitle: '删除数据',
          nzContent: '<b style="color: red;">确定删除此数据吗？</b>',
          nzOkType: 'danger',
          nzOnOk: async () => {
            this.crudService.del(environment.baseUrl + 'api', 'rule-command',id).subscribe((res) => {
              this.loading = false;
              this.msg.success('删除成功');
              this.getData();
            });
          },
          nzOnCancel: () => {
            this.loading = false;
          },
        });
      }
    });
  }

 async getData() {
   this.searchList.filter = [];

   this.searchList.limit = this.pageSize;
   this.searchList.page = this.pageIndex;

   if (this.searchName) {
     this.searchList.page = 1;
     this.searchList.filter.push(`name||$cont||${this.searchName}`);
   }

    this.crudService
      .search(environment.baseUrl + 'api', 'rule-command',this.searchList)
      .subscribe(async (res: any) => {
        res.data.map(m=>{
           const user = this.userList.find(f=>f.id === m.createUserId);
           if(user){
             m.createUserName = user.name;
           }
        });

        this.total = res.total;
        this.listOfAllData = res.data;
        // console.log(this.listOfAllData);
        this.loading = false;
      });
  }

  getEditorEmitter(item, callbackResult: any) {
    this.loading = true;
    if (callbackResult.inputId) {
      this.crudService
        .update(environment.baseUrl + 'api', 'rule-command', callbackResult.inputId, {
          createUserId: this.settingService.user.userId,
          id: 0,
          name: callbackResult.inputName,
        })
        .subscribe((res) => {
          item.name = callbackResult.inputName;
          this.loading = false;

        });
    } else {
      this.crudService
        .add(environment.baseUrl + 'api', 'rule-command', {
          createUserId: this.settingService.user.userId,
          id: 0,
          name: callbackResult.inputName,
        })
        .subscribe((res) => {
          this.getData();

        });
    }
  }

  /**
   * 是否存在check
   * @param inputName
   * @param id
   */
  async check(inputName: any, id: number ,parentId: any): Promise<boolean> {

    const filter =  [`name||$eq||${inputName}`];

    if (id) {
      filter.push(`id||$ne||${id}`)
    }

    const cnt: number = await new Promise<number>(resolve => {
      this.crudService
        .search(environment.baseUrl + 'api', 'rule-command', {
          filter: filter
        })
        .subscribe((res: any[]) => {
          resolve(res.length);
        });
    });
    return cnt > 0;
  }

  async getUserList(){
    return new Promise((resolve, reject) => {
      this.crudService.search(environment.baseUrl_zxtj + 'api', 'user',{
        filter: [`deleteFlag||$eq||0`],
      })
        .subscribe(async (res: any) => {
          this.userList = res.map(m=> {
            return {id:m.id, name: m.realName ? m.realName : m.userName};
          });
          resolve(res)
        });
    });
  }

}

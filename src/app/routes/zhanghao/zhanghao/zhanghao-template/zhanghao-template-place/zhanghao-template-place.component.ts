import {Component, OnInit} from '@angular/core';
import {environment} from "@env/environment";
import {CrudService} from "../../../../crud.service";
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzModalService} from 'ng-zorro-antd/modal';
import {SettingsService} from "@delon/theme";
import {Router} from "@angular/router";
import {ZhanghaoService} from '../../../zhanghao.service';

@Component({
  selector: 'app-zhanghao-template-place',
  templateUrl: './zhanghao-template-place.component.html',
  styleUrls: ['./zhanghao-template-place.component.css']
})
export class ZhanghaoTemplatePlaceComponent implements OnInit {
  
  constructor(private crudService: CrudService,
              private modalService: NzModalService,
              public settingService: SettingsService,
              public msg: NzMessageService,
              public zhanghaoService:ZhanghaoService,
              private router: Router,) { }

  listOfAllData: any;
  fieldList:any;
  loading: any;

  async ngOnInit() {
    this.fieldList = await this.zhanghaoService.getAllField()
    await this.getData();
  }

  async getData(  reset: boolean = false) {
   
    this.crudService.searchAll(environment.baseUrl + 'api', 'zhanghao-template-place')
      .subscribe(async (res: any) => {
       
        this.listOfAllData = res;
        this.listOfAllData.forEach(it => {
         it.zhanghaoTemplatePlaceFields.map(m=>{

            // this.crudService.get(environment.baseUrl + 'api','zhanghao-field-define',m.fieldId)
            //   .subscribe((res_1:any) => {
            //     m.fieldName = res_1.fieldName;
            // });
            const field = this.fieldList.find(f=>f.id===m.fieldId);
            if (field) {
              m.fieldName = field.fieldName;
            }

          })
        });

        // console.log(this.listOfAllData);
        this.loading =false;
      });

  }

  getEditorEmitter(item,callbackResult: any) {
    this.loading = true;
    if (callbackResult.inputId) {
      this.crudService.update(environment.baseUrl + 'api', 'zhanghao-template-place', callbackResult.inputId, {
        updateUser: this.settingService.user.userId,
        id: 0,
        name: callbackResult.inputName,
      })
        .subscribe(res => {

          item.name = callbackResult.inputName;
          this.loading = false;

        });
    } else {
      this.crudService.add(environment.baseUrl + 'api', 'zhanghao-template-place', {
        createUser: this.settingService.user.userId,
        id: 0,
        name: callbackResult.inputName,
      })
        .subscribe(res => {
          this.getData();
        });
    }
  }

  async waitSearch(item: any) {
    this.crudService.get(environment.baseUrl + 'api', 'zhanghao-template-place',item.id)
      .subscribe(async (res: any) => {
        item.zhanghaoTemplatePlaceFields = res.zhanghaoTemplatePlaceFields;
        item.zhanghaoTemplatePlaceFields.map(m=>{

          // this.crudService.get(environment.baseUrl + 'api','zhanghao-field-define',m.fieldId)
          //   .subscribe((res_1:any) => {
          //     m.fieldName = res_1.fieldName;
          //   });
          const field = this.fieldList.find(f=>f.id===m.fieldId);
          if (field) {
            m.fieldName = field.fieldName;
          }

        });

        this.loading =false;
      });
  }

  /**
   * 是否存在check
   * @param inputName
   * @param id
   */
  async check(inputName: any, id: number): Promise<boolean> {

    const filter =  [`name||$eq||${inputName}`];

    if (id) {
      filter.push(`id||$ne||${id}`)
    }

    const cnt: number = await new Promise<number>(resolve => {
      this.crudService
        .search(environment.baseUrl + 'api', 'zhanghao-template-place', {
          filter: filter,
        })
        .subscribe((res: any[]) => {
          resolve(res.length);
        });
    });
    return cnt > 0;
  }

  del(id: any) {
    this.modalService.confirm({
      nzTitle: `操作删除`,
      nzContent: `<b style="color: red;">确定删除该名称吗？</b>`,
      nzOkType: 'danger',
      nzOnOk: async () => {
        if (!await this.checkRef(id)) {
          this.crudService.del(environment.baseUrl + 'api', 'zhanghao-template-place', id).subscribe((res: any) => {
            this.msg.create('success', `删除成功`);
            this.ngOnInit();
          });
        } else {
          this.msg.warning(`当前导入模板被引用，暂不可删除！`);
        }
      },
      nzOnCancel: () => console.log('Cancel'),
    });
  }

  async checkRef(id: any) {
    const cnt: number = await new Promise<number>(resolve => {
      this.crudService
        .search(environment.baseUrl + 'api', 'zhanghao-template-post', {
          filter: [`placeId||$eq||${id}`],
        })
        .subscribe((res: any[]) => {
          resolve(res.length);
        });
    });
    return cnt > 0;
  }

}

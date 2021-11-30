import {Component, OnInit} from '@angular/core';
import {environment} from "@env/environment";
import {CrudService} from "../../../../crud.service";
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzModalService} from 'ng-zorro-antd/modal';
import {SettingsService} from "@delon/theme";
import {Router} from "@angular/router";
import {YangbenService} from '../../../yangben.service';

@Component({
  selector: 'app-yangben-template-place',
  templateUrl: './yangben-template-place.component.html',
  styleUrls: ['./yangben-template-place.component.css']
})
export class YangbenTemplatePlaceComponent implements OnInit {
  
  constructor(private crudService: CrudService,
              private modalService: NzModalService,
              public settingService: SettingsService,
              public msg: NzMessageService,
              public yangbenService:YangbenService,
              private router: Router,) { }


  listOfAllData: any;
  fieldList:any;
  loading: any;

  async ngOnInit() {
    this.fieldList = await this.yangbenService.getAllField()
    await this.getData();
  }

  async getData(  reset: boolean = false) {
   
    this.crudService.searchAll(environment.baseUrl + 'api', 'yangben-template-place')
      .subscribe(async (res: any) => {
       
        this.listOfAllData = res;
        this.listOfAllData.forEach(it => {
         it.yangbenTemplatePlaceFields.map(async m => {

           const field = this.fieldList.find(f => f.id === m.fieldId);
           if (field) {
             m.fieldName = field.fieldName;
             m.fieldType = field.fieldType;

             if (field.yangbenOptionConfig) {
               m.yangbenOptionConfigId = field.yangbenOptionConfig.id;
               m.targetTable = field.yangbenOptionConfig.targetTable;

               const templateOptionList: any = await new Promise((resolve, reject) => {
                 this.crudService.search(environment.baseUrl + 'api', 'yangben-template-option-field', {
                     filter: [`templateId||$eq||${it.id}`, `fieldId||$eq||${field.id}`]
                   }
                 ).subscribe((res: any) => {
                   resolve(res)
                 });
               });

               if(templateOptionList.length > 0 ){
                 m.selectCnt = templateOptionList.length;
               }

             }
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
      this.crudService.update(environment.baseUrl + 'api', 'yangben-template-place', callbackResult.inputId, {
        updateUser: this.settingService.user.userId,
        id: 0,
        name: callbackResult.inputName,
      })
        .subscribe(res => {

          item.name = callbackResult.inputName;
          this.loading = false;

        });
    } else {
      this.crudService.add(environment.baseUrl + 'api', 'yangben-template-place', {
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
    this.crudService.get(environment.baseUrl + 'api', 'yangben-template-place',item.id)
      .subscribe(async (res: any) => {
        item.yangbenTemplatePlaceFields = res.yangbenTemplatePlaceFields;
        item.yangbenTemplatePlaceFields.map(m=>{

          // this.crudService.get(environment.baseUrl + 'api','yangben-field-define',m.fieldId)
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
        .search(environment.baseUrl + 'api', 'yangben-template-place', {
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
          this.crudService.del(environment.baseUrl + 'api', 'yangben-template-place', id).subscribe((res: any) => {
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
        .search(environment.baseUrl + 'api', 'yangben-template-post', {
          filter: [`placeId||$eq||${id}`],
        })
        .subscribe((res: any[]) => {
          resolve(res.length);
        });
    });
    return cnt > 0;
  }

  getOptionEditorEmitter(it: any, callbackResult: any) {
    it.selectCnt = callbackResult.selectCnt;
  }

}

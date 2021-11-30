import {Component, Input, OnInit} from '@angular/core';
import {CrudService} from "../../../../crud.service";
import {environment} from "@env/environment";
import { ACLService } from '@delon/acl';
import { SettingsService } from '@delon/theme';

@Component({
  selector: 'app-zhanghao-data-sign-setting',
  templateUrl: './zhanghao-data-sign-setting.component.html',
  styles: []
})
export class ZhanghaoDataSignSettingComponent implements OnInit {
  isVisible = false;
  isOkLoading = false;
  fieldList = [];
  @Input() onWaitSearch: (parent: any) => Promise<void>;
  @Input() parent: any;
  constructor(private crudService: CrudService,
    private aclService: ACLService,
    private settingService: SettingsService,
    ) { }

  postId=0;
  isPostUser = false;
  ngOnInit() {}


  async showModal(): Promise<void> {
    this.isOkLoading = false;

    // this.fieldList = [];
    // this.crudService
    //   .search(environment.baseUrl + 'api', 'zhanghao-field-define', { sort: [`id,ASC`] })
    //   .subscribe((res: any[]) => {
    //     this.fieldList = res.filter(f => f.fieldType === 5 || f.fieldType === 6  );
    //     this.fieldList = this.fieldList.map(m => {
    //       return { ...m, checked: m.signFlag === 1 ? true : false };
    //     });
    //   });

    this.fieldList = [];
    this.postId = this.settingService.user.posts[0].id;
    this.isPostUser= this.aclService.data.roles.indexOf("dagl_post")>=0 || this.aclService.data.roles.indexOf("dagl_editor")>=0

    let fieldDefineList:any =  await new Promise((resolve, reject) => {
      this.crudService
      .search(environment.baseUrl + 'api', 'zhanghao-field-define', { sort: [`id,ASC`] })
      .subscribe((res: any[]) => {
        resolve(res)
      });
      
    });
    fieldDefineList = fieldDefineList.filter(f => f.fieldType === 5 || f.fieldType === 6  );

    if (this.isPostUser) {
      // 岗位人员
      this.crudService
      .search(environment.baseUrl + 'api', 'zhanghao-post-field', { sort: [`id,ASC`], 
      filter:[
        `postId||$eq||${this.postId}`,
              `shareFlag||$eq||0`
      ]  })
      .subscribe((res: any[]) => {
        this.fieldList = res;
        this.fieldList = this.fieldList.map(m => {
          const ff = fieldDefineList.find(f=>f.id === m.fieldId);
          let fieldName = "";
          if(ff) {
            fieldName = ff.fieldName;
          }
          return { ...m,fieldName:fieldName, checked: m.signFlag === 1 ? true : false };
        });
        this.fieldList = this.fieldList.filter(f=>f.fieldName !== "")
      });
    } else {
      // 管理员
        this.fieldList = fieldDefineList;
        this.fieldList = this.fieldList.map(m => {
          return { ...m, checked: m.signFlag === 1 ? true : false };
        }); 
    }

    this.isVisible = true;
  }

  async handleOk() {
    const ids = [];
    this.fieldList.map(m => {
      if (m.checked) {
        ids.push(m.id);
      }
    });

  
    if (this.isPostUser) {
      await new Promise((resolve, reject) => {
        this.crudService
          .add(environment.baseUrl + 'api', 'zhanghao-post-field/setSignItem', {
            ids: ids,
            postId:this.postId,
            shareFlag:0
          })
          .subscribe(async res => {
            resolve(res);
            this.isVisible = false;
          });
      });
    } else {
      await new Promise((resolve, reject) => {
        this.crudService
          .add(environment.baseUrl + 'api', 'zhanghao-data/setSignItem', {
            ids: ids,
          })
          .subscribe(async res => {
            resolve(res);
            this.isVisible = false;
          });
      });
    }
    await this.onWaitSearch(this.parent);
  }

  async handleCancel() {
    this.isVisible = false;
  }



}

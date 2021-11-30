import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ACLService } from '@delon/acl';
import { SettingsService } from '@delon/theme';
import { environment } from '@env/environment';
import { CrudService } from 'src/app/routes/crud.service';
import { YangbenService } from '../../../yangben.service';

@Component({
  selector: 'app-yangben-data-search-setting',
  templateUrl: './yangben-data-search-setting.component.html',
  styles: [],
})
export class YangbenDataSearchSettingComponent implements OnInit {
  isVisible = false;
  isOkLoading = false;
  fieldList = [];
  // @Output() search_emitter = new EventEmitter();
  @Input() onWaitSearch: (parent: any) => Promise<void>;
  @Input() parent: any;
  @Input() shareFlag:number;
  constructor(private crudService: CrudService,
    private aclService: ACLService,
    private settingService: SettingsService,
    public yangbenService:YangbenService
    ) { }

  postId=0;
  // isPostUser = false;
  // isEditorUser = false;
  isAdmin = false;
  ngOnInit() { }

  async showModal(): Promise<void> {
    this.isOkLoading = false;

    this.fieldList = [];
    this.postId = this.settingService.user.posts[0].id;
    // this.isPostUser= this.aclService.data.roles.indexOf("dagl_post")>=0;
    // this.isEditorUser =  this.aclService.data.roles.indexOf("dagl_editor")>=0
    this.isAdmin =  this.aclService.data.roles.indexOf("dagl_admin")>=0

    const fieldDefineList:any = await this.yangbenService.getAllField();
    // if (this.isPostUser || this.isEditorUser) {
    if (this.isAdmin && this.shareFlag ===-1) {
     
      // 管理员
      this.fieldList = fieldDefineList;
      this.fieldList = this.fieldList.map(m => {
        return { ...m, checked: m.searchItemFlag === 1 ? true : false };
      }); 

    } else {

       // 岗位人员
       const allShowList:any = await this.yangbenService.getShowCheckedField(this.postId, this.shareFlag===2?1:0);
       const checkedList:any = await this.yangbenService.getSearchCheckedField(this.postId, this.shareFlag===2?1:0);
       this.fieldList = fieldDefineList.filter(f=> allShowList.find(f1=>f1.fieldId===f.id) );
       this.fieldList = this.fieldList.map(
         m => {
               const ff = checkedList.find(f=>f.fieldId === m.id);
               return { ...m, checked:ff ? true: false };
             })
      
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

    // if (this.isPostUser || this.isEditorUser) {
      if (this.isAdmin && this.shareFlag ===-1) {
        await new Promise((resolve, reject) => {
          this.crudService
            .add(environment.baseUrl + 'api', 'yangben-data/setSearchItem', {
              ids: ids,
              postId: this.postId,
              shareFlag: this.shareFlag===2?1:0
            })
            .subscribe(async res => {
              resolve(res);
              this.isVisible = false;
            });
        });
    } else {
      
      await new Promise((resolve, reject) => {
        this.crudService
          .add(environment.baseUrl + 'api', 'yangben-post-field-search/setSearchItem', {
            ids: ids,
            postId: this.postId,
            shareFlag: this.shareFlag===2?1:0
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

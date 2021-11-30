import { Component, Input, OnInit } from '@angular/core';
import { ACLService } from '@delon/acl';
import { SettingsService } from '@delon/theme';
import { environment } from '@env/environment';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CrudService } from 'src/app/routes/crud.service';
import { YangbenService } from '../../../yangben.service';

@Component({
  selector: 'app-yangben-data-field-setting-post',
  templateUrl: './yangben-data-field-setting-post.component.html',
  styles: []
})
export class YangbenDataFieldSettingPostComponent implements OnInit {

  isVisible = false;
  isOkLoading = false;
  // placeList=[];
  fieldList = [];
  checkedList = [];
  postId=0;
  @Input() onWaitSearch: (parent: any) => Promise<void>;
  @Input() parent: any;
  constructor(private crudService: CrudService,
    private aclService: ACLService,
    private settingService: SettingsService,
    public msg: NzMessageService,
    public yangbenService:YangbenService
    ) {}
  

  ngOnInit() { }

  chkField(it): void {
    if (it.checked) {
      const fList = this.checkedList.filter(f => f.id === it.id );
      if (fList.length === 0) {
        this.checkedList.push(it);
      }
    } else {
      this.checkedList = this.checkedList.filter(f => !(f.id === it.id ));
    }
  }

  deleteItem(item) {
    this.checkedList = this.checkedList.filter(f => !(f.id === item.id ));
    // this.placeList.map(m=>{
        this.fieldList.map(m1=>{
        if (m1.id === item.id ) {
          m1.checked = false;
        } 
      })
    // })
  }

  async showModal() {
    this.isOkLoading = false;

    this.postId = this.settingService.user.posts[0].id;
    const showItem = await this.yangbenService.getShowItem_post(this.postId);
    this.fieldList  = showItem.fieldList;
    this.checkedList = showItem.checkedList;

    this.isVisible = true;
  }

  async handleOk() {


    if(this.checkedList.length===0) {
      this.msg.warning(`请选择字段！`);
      return;
    }
    const ids = [];
    // console.log("this.checkedList",this.checkedList)
    const duplicate = [];
    this.checkedList.map(m => {
      if (ids.indexOf(m.id)>=0) {
        duplicate.push(m.fieldName);
      }
      ids.push(m.id);
      
    });
    if (duplicate.length>0) {
      this.msg.warning(`字段【${duplicate.join("、")}】重复选择，请删除重复项。`);
      return;
    }

  

    await new Promise((resolve, reject) => {
      this.crudService
      .add(environment.baseUrl + 'api', 'yangben-post-field/setShowItem', {
        checkedList: this.checkedList,
        postId: this.postId,
        shareFlag: 0,
      })
        .subscribe(res => {
          resolve(res); 
        });
    });

    await this.onWaitSearch(this.parent);
    this.isVisible =false;
  }

  async handleCancel() {
    this.isVisible = false;
  }
}

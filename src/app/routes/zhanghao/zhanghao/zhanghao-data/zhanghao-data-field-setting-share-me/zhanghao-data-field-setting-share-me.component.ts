import {Component, Input, OnInit} from '@angular/core';
import {CrudService} from 'src/app/routes/crud.service';
import {environment} from '@env/environment';
import {ACLService} from '@delon/acl';
import {SettingsService} from '@delon/theme';
import {NzMessageService} from 'ng-zorro-antd/message';
import {ZhanghaoService} from '../../../zhanghao.service';

@Component({
  selector: 'app-zhanghao-data-field-setting-share-me',
  templateUrl: './zhanghao-data-field-setting-share-me.component.html',
  styles: []
})

export class ZhanghaoDataFieldSettingShareMeComponent implements OnInit {

  isVisible = false;
  isOkLoading = false;
  fieldList = [];
  checkedList = [];
  @Input() onWaitSearch: (parent: any) => Promise<void>;
  @Input() parent: any;
  constructor(private crudService: CrudService,
    private aclService: ACLService,
    private settingService: SettingsService,
    public msg: NzMessageService,
    public zhanghaoService:ZhanghaoService
    ) { }
  postId=0;

  ngOnInit() { 
   
  }

  chkField(it): void {
    if (it.checked) {
      const fList = this.checkedList.filter(f => f.id === it.id);
      if (fList.length === 0) {
        this.checkedList.push(it);
      }
    } else {
      this.checkedList = this.checkedList.filter(f => f.id !== it.id);
    }
  }

  deleteItem(item) {
    this.checkedList = this.checkedList.filter(f => f.id !== item.id);
    const fList = this.fieldList.filter(f => f.id === item.id);
    if (fList.length > 0) {
      fList[0].checked = false;
    }
  }
  async showModal(): Promise<void> {

    this.isOkLoading = false;

    this.postId = this.settingService.user.posts[0].id;
    const showItem = await this.zhanghaoService.getShowItem_shareMe(this.postId);
    this.fieldList  = showItem.fieldList;
    this.checkedList = showItem.checkedList;

    this.isVisible = true;
  }


  async handleOk() {
    const ids = [];
    this.checkedList.map(m => {
      ids.push(m.id);
    });

    if(this.checkedList.length===0) {
      this.msg.warning(`请选择字段！`);
      return;
    }

    await new Promise((resolve, reject) => {
      this.crudService
      .add(environment.baseUrl + 'api', 'zhanghao-post-field/setShowItem', {
        checkedList: this.checkedList,
        postId: this.postId,
        shareFlag: 1,
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

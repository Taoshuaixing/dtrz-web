import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CrudService } from 'src/app/routes/crud.service';
import { environment } from '@env/environment';
import { NzMessageService } from 'ng-zorro-antd/message';
import { YangbenService } from '../../../yangben.service';
@Component({
  selector: 'app-yangben-data-field-setting',
  templateUrl: './yangben-data-field-setting.component.html',
  styles: [],
})
export class YangbenDataFieldSettingComponent implements OnInit {
  isVisible = false;
  isOkLoading = false;
  fieldList = [];
  checkedList = [];
  @Input() onWaitSearch: (parent: any) => Promise<void>;
  @Input() parent: any;
  constructor(private crudService: CrudService,
    public msg: NzMessageService,
    public yangbenService:YangbenService
    
    ) { }

  ngOnInit() { }

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
  async showModal() {
    this.isOkLoading = false;

    const showItem = await this.yangbenService.getShowItem();
    this.fieldList = showItem.fieldList;
    this.checkedList = showItem.checkedList;

    this.isVisible = true;
  }

  async handleOk() {
    
    if(this.checkedList.length===0) {
      this.msg.warning(`请选择字段！`);
      return;
    }

    const ids = [];
    this.checkedList.map(m => {
      ids.push(m.id);
    });

    await new Promise((resolve, reject) => {
      this.crudService
        .add(environment.baseUrl + 'api', 'yangben-data/setShowItem', {
          ids: ids,
        })
        .subscribe(res => {
          resolve(res);
          this.isVisible = false;
        });
    });
    await this.onWaitSearch(this.parent);
  }

  async handleCancel() {
    this.isVisible = false;
  }
}

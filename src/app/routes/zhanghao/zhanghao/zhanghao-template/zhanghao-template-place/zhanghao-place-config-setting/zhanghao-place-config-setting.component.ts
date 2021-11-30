import {Component, Input, OnInit} from '@angular/core';
import {environment} from '@env/environment';
import {CrudService} from 'src/app/routes/crud.service';
import {NzMessageService} from 'ng-zorro-antd/message';
import {ZhanghaoService} from "../../../../zhanghao.service";

@Component({
  selector: 'app-zhanghao-place-config-setting',
  templateUrl: './zhanghao-place-config-setting.component.html',
  styles: [],
})
export class ZhanghaoPlaceConfigSettingComponent implements OnInit {
  isVisible = false;
  isOkLoading = false;
  fieldList :any;
  placeFieldList = [];
  // @Output() search_emitter = new EventEmitter();
  @Input() onWaitSearch: (parent: any) => Promise<void>;
  @Input() parent: any;
  checkedList = [];
  constructor(private crudService: CrudService,
              public msg: NzMessageService,
              public zhanghaoService:ZhanghaoService
              ) { }

  ngOnInit() { }

  async showModal() {
    this.isOkLoading = false;
    this.placeFieldList = [];
    this.fieldList = await this.zhanghaoService.getAllField();

    if (this.parent) {
      this.placeFieldList = await new Promise((resolve, reject) => {
        this.crudService.get(environment.baseUrl + 'api', 'zhanghao-template-place', this.parent.id)
          .subscribe((res_1: any) => {
            resolve(res_1.zhanghaoTemplatePlaceFields);
          });
      });
    }

    this.fieldList = this.fieldList.map(m=> {
        const fItem = this.placeFieldList.find(f=>f.fieldId === m.id);
        if (fItem) {
          return { ...m, checked:true,sortId:fItem.sortId};
        }
        return { ...m, checked:false};
      });

    this.checkedList = this.fieldList.filter(f=>f.checked);
    this.checkedList.sort((a: any, b: any) => {
      return a.sortId - b.sortId;
    });

     

    this.isVisible = true;
  }


  chkField(it): void {
    if (it.checked) {
      const fList = this.fieldList.filter(f => f.id === it.id);
      if (fList.length > 0) {
        this.checkedList.push(it);
      }
    } else {
      this.checkedList = this.checkedList.filter(f => f.id !== it.id);
    }
  }

  async handleOk() {

    if(this.checkedList.length===0) {
      this.msg.warning(`请选择字段！`);
      return;
    }

    const ids = [];

    for (let i = 0; i < this.checkedList.length; i++) {
      ids.push({fieldId:this.checkedList[i].id,sortId:i+1})
    }


    await new Promise((resolve, reject) => {
      this.crudService
        .add(environment.baseUrl + 'api', 'zhanghao-template-place/settings',{
          placeId:this.parent.id,
          items: ids,
        })
        .subscribe(async res => {
          resolve(res);
          this.isVisible = false;
        });
    });
    await this.onWaitSearch(this.parent);
  }

  async handleCancel() {
    this.isVisible = false;
  }

  deleteItem(item: any) {
    this.checkedList = this.checkedList.filter(f => f.id !== item.id);
    const fList = this.fieldList.filter(f => f.id === item.id);
    if (fList.length > 0) {
      fList[0].checked = false;
    }
  }

}

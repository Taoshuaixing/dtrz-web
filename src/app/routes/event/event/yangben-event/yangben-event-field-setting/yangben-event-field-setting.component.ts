import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CrudService } from 'src/app/routes/crud.service';
import { environment } from '@env/environment';
import { NzMessageService } from 'ng-zorro-antd/message';
@Component({
  selector: 'app-yangben-event-field-setting',
  templateUrl: './yangben-event-field-setting.component.html',
  styles: [],
})
export class YangbenEventFieldSettingComponent implements OnInit {
  isVisible = false;
  isOkLoading = false;
  fieldList = [];
  checkedList = [];
  @Input() onWaitSearch: (parent: any) => Promise<void>;
  @Input() parent: any;
  @Input() eventTemplateId: any;

  constructor(private crudService: CrudService,
    public msg: NzMessageService,) { }

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
  async showModal(){
    this.isOkLoading = false;

    this.fieldList = [];
    this.checkedList = [];

    const allFieldList:any = await new Promise((resolve, reject) => {
      this.crudService
        .search(environment.baseUrl + 'api', 'yangben-event-field-define', { sort: [`id,ASC`] })
        .subscribe((res: any[]) => {
          resolve(res);
        });
    });

    if(this.eventTemplateId > 0){
      this.crudService
        .get(environment.baseUrl + 'api', 'yangben-event-template-place',this.eventTemplateId)
        .subscribe((res: any) => {
        this.fieldList = res.yangbenEventTemplatePlaceFields;
        this.fieldList = this.fieldList.map(m=>{
          allFieldList.map(it=>{
            if(m.fieldId === it.id){
              m.id = m.fieldId;
              m.fieldName = it.fieldName;
              m.fieldType = it.fieldType;
            }
          });

          if (m.showFlag === 1) {
            this.checkedList.push(m);
          }
          return { ...m, checked: m.showFlag === 1 ? true : false };
        })

        this.checkedList.sort((a: any, b: any) => {
          return a.showSortId - b.showSortId;
        });

        });

    }else {
      this.fieldList = allFieldList.map(m => {
        if (m.showFlag === 1) {
          this.checkedList.push(m);
        }
        return { ...m, checked: m.showFlag === 1 ? true : false };
      });
      this.checkedList.sort((a: any, b: any) => {
        return a.sortId - b.sortId;
      });

    }

    this.isVisible = true;
  }

  async handleOk() {

    if(this.fieldList.length > 0 ){

      if(this.checkedList.length===0) {
        this.msg.warning(`请选择字段！`);
        return;
      }

      const ids = [];
      this.checkedList.map(m => {
        ids.push(m.id);
      });

      if(this.eventTemplateId > 0){
        await new Promise((resolve, reject) => {
          this.crudService
            .add(environment.baseUrl + 'api', 'yangben-event-template-place-field/setShowItem', {
              ids: ids,
              eventTemplateId:this.eventTemplateId
            })
            .subscribe(res => {
              resolve(res);
            });
        });

      }else{
        await new Promise((resolve, reject) => {
          this.crudService
            .add(environment.baseUrl + 'api', 'yangben-event/setShowItem', {
              ids: ids,
            })
            .subscribe(res => {
              resolve(res);
            });
        });
      }
    }

    this.isVisible = false;
    await this.onWaitSearch(this.parent);
  }

  async handleCancel() {
    this.isVisible = false;
  }
}

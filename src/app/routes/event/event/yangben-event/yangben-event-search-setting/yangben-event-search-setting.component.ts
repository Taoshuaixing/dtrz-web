import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { environment } from '@env/environment';
import { CrudService } from 'src/app/routes/crud.service';

@Component({
  selector: 'app-yangben-event-search-setting',
  templateUrl: './yangben-event-search-setting.component.html',
  styles: [],
})
export class YangbenEventSearchSettingComponent implements OnInit {
  isVisible = false;
  isOkLoading = false;
  fieldList = [];
  // @Output() search_emitter = new EventEmitter();
  @Input() onWaitSearch: (parent: any) => Promise<void>;
  @Input() parent: any;
  @Input() eventTemplateId: any;
  constructor(private crudService: CrudService) { }

  ngOnInit() { }

  async showModal(){
    this.isOkLoading = false;
    this.fieldList = [];

    const allFieldList: any = await new Promise((resolve, reject) => {
      this.crudService
        .search(environment.baseUrl + 'api', 'yangben-event-field-define', {sort: [`id,ASC`]})
        .subscribe((res: any[]) => {
          resolve(res);
        });
    });

    if (this.eventTemplateId > 0) {
      this.crudService
        .get(environment.baseUrl + 'api', 'yangben-event-template-place', this.eventTemplateId)
        .subscribe((res: any) => {
          this.fieldList = res.yangbenEventTemplatePlaceFields;
          this.fieldList = this.fieldList.map(m => {
            allFieldList.map(it => {
              if (m.fieldId === it.id) {
                m.id = m.fieldId;
                m.fieldName = it.fieldName;
                m.fieldType = it.fieldType;
              }
            });
            return {...m, checked: m.searchItemFlag === 1 ? true : false};
          })
        });
    } else {
      this.crudService
        .search(environment.baseUrl + 'api', 'yangben-event-field-define', {sort: [`id,ASC`]})
        .subscribe((res: any[]) => {
          this.fieldList = res;
          this.fieldList = this.fieldList.map(m => {
            return {...m, checked: m.searchItemFlag === 1 ? true : false};
          });
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

    if(this.eventTemplateId > 0){
      await new Promise((resolve, reject) => {
        this.crudService
          .add(environment.baseUrl + 'api', 'yangben-event-template-place-field/setSearchItem', {
            ids: ids,
            eventTemplateId:this.eventTemplateId
          })
          .subscribe(async res => {
            resolve(res);
            this.isVisible = false;
          });
      });
    }else {
      await new Promise((resolve, reject) => {
        this.crudService
          .add(environment.baseUrl + 'api', 'yangben-event/setSearchItem', {
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

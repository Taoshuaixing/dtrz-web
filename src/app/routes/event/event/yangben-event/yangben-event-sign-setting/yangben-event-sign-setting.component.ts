import {Component, Input, OnInit} from '@angular/core';
import {CrudService} from "../../../../crud.service";
import {environment} from "@env/environment";

@Component({
  selector: 'app-yangben-event-sign-setting',
  templateUrl: './yangben-event-sign-setting.component.html',
  styles: []
})
export class YangbenEventSignSettingComponent implements OnInit {
  isVisible = false;
  isOkLoading = false;
  fieldList = [];
  @Input() onWaitSearch: (parent: any) => Promise<void>;
  @Input() parent: any;
  constructor(private crudService: CrudService) { }

  ngOnInit() {}


  showModal(): void {
    this.isOkLoading = false;

    this.fieldList = [];
    this.crudService
      .search(environment.baseUrl + 'api', 'yangben-event-field-define', { sort: [`id,ASC`] })
      .subscribe((res: any[]) => {
        this.fieldList = res.filter(f => f.fieldType === 5 || f.fieldType === 6  );
        this.fieldList = this.fieldList.map(m => {
          return { ...m, checked: m.signFlag === 1 ? true : false };
        });
      });

    this.isVisible = true;
  }

  async handleOk() {
    const ids = [];
    this.fieldList.map(m => {
      if (m.checked) {
        ids.push(m.id);
      }
    });

    await new Promise((resolve, reject) => {
      this.crudService
        .add(environment.baseUrl + 'api', 'yangben-event/setSignItem', {
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

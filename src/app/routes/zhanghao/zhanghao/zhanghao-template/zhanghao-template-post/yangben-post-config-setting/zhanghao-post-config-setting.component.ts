import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { environment } from '@env/environment';
import { CrudService } from 'src/app/routes/crud.service';

@Component({
  selector: 'app-zhanghao-post-config-setting',
  templateUrl: './zhanghao-post-config-setting.component.html',
  styles: [],
})
export class ZhanghaoPostConfigSettingComponent implements OnInit {
  isVisible = false;
  isOkLoading = false;
  fieldList = [];
  postFieldList = [];
  // @Output() search_emitter = new EventEmitter();
  @Input() onWaitSearch: (parent: any,postItem:any) => Promise<void>;
  @Input() parent: any;
  @Input() postItem: any;
  constructor(private crudService: CrudService) { }

  ngOnInit() { }

  showModal(): void {
    this.isOkLoading = false;
    this.postFieldList = [];
    this.fieldList = [];
    this.crudService
      .search(environment.baseUrl + 'api', 'zhanghao-template-place', { sort: [`id,ASC`] })
      .subscribe(async (res: any[]) => {
        this.fieldList = res;

        if (this.postItem) {
          this.postFieldList = await new Promise((resolve, reject) => {
            this.crudService.search(environment.baseUrl + 'api', 'zhanghao-template-post', {
              filter: [`postId||$eq||${this.postItem.id}`],
            })
              .subscribe((res_1: any) => {
                resolve(res_1);
              });
          });
        }

        this.fieldList = this.fieldList.map(m=> {
            const fItem = this.postFieldList.find(f=>f.placeId === m.id);
            if (fItem) {
              return { ...m, checked:true};
            }
            return { ...m, checked:false};
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
        .add(environment.baseUrl + 'api', 'zhanghao-template-post',{
          placeIds: ids,
          postId:this.postItem.id,
        })
        .subscribe(async res => {
          resolve(res);
          this.isVisible = false;
        });
    });
    await this.onWaitSearch(this.parent,this.postItem);
  }

  async handleCancel() {
    this.isVisible = false;
  }
}

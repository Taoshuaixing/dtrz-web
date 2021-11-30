import {Component, OnInit} from '@angular/core';
import {CrudService} from "../../../crud.service";
import {NzMessageService} from "ng-zorro-antd/message";
import {environment} from "@env/environment";
import {NzModalService} from "ng-zorro-antd/modal";
import {SettingsService} from "@delon/theme";

@Component({
  selector: 'app-journal-template-config',
  templateUrl: './journal-template-config.component.html',
  styleUrls: ['./journal-template-config.component.css'],
})
export class JournalTemplateConfigComponent implements OnInit {

  constructor( private crudService: CrudService,
               private modalService: NzModalService,
               private settingService: SettingsService,
               public msg: NzMessageService,) { }


  listOfAllData: any;
  total = 0;
  pageIndex = 1;
  pageSize = 10;


  usedOptions = [
    { label: '已启用', value: 0, checked: false },
    { label: '未启用', value: 1, checked: false },
  ];
  loading: any;
  postId:any;

  async ngOnInit() {
    this.postId = this.settingService.user.posts[0].id;
    await this.getData();
  }

  async getData() {
    const searchFilter = [`deleteFlag||$eq||0`];
    const useds = this.usedOptions.filter(f=>f.checked === true);
    if(useds && useds.length ==1){
      if(useds[0].value === 0){
        searchFilter.push(`status||$eq||1`);
      }else{
        searchFilter.push(`status||$eq||0`);
      }
    }
    searchFilter.push(`postId||$eq||${this.postId}`);

    this.crudService.search(environment.baseUrl + 'api', 'journal-config-template',{
      filter:searchFilter,
      sort:["id,DESC"]
      }).subscribe((res: any[]) => {
        this.total = res.length;
        this.listOfAllData = res.map(m => {
          let usedFlag;
          if(m.status === 1){
            usedFlag = true;
          }else if(m.status === 0){
            usedFlag = false;
          }

          const content =[];
          if(m.configTemplateDetails.length > 0){
            const details = m.configTemplateDetails.filter(f=>f.parent === null);
            details.sort((a: any, b: any) => {
              return a.sortId - b.sortId;
            });
            details.map(m=>{
              content.push(m.contentTitle);
            })
          }
          return { ...m,content:content.join("、"),usedFlag:usedFlag};
        });
      });
  }


  del(id: any) {
    //TODO 验证模板是否被使用

    this.modalService.confirm({
      nzTitle: `删除模板`,
      nzContent: `<b style="color: red;">确定删除该模板吗？</b>`,
      nzOkType: 'danger',
      nzOnOk: () => {
        this.crudService.del(environment.baseUrl + 'api', 'journal-config-template', id).subscribe(res => {
          this.msg.create('success', `删除成功`);
          this.ngOnInit();
        });
      },
      nzOnCancel: () => console.log('Cancel'),
    });
  }

  switch(dataId:number, e: any) {
    //TODO 验证是否被使用

    let status = 0;
    if(e){
      status = 1;
    }
    this.crudService
      .patch(environment.baseUrl + 'api/journal-config-template/' + dataId, { status: status })
      .subscribe((res) => {
        this.msg.create('success', '操作成功');

      });
  }

  currentPageDataChange($event: any[]) {
  }
}

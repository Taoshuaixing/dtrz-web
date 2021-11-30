import {Component, OnInit} from '@angular/core';
import {CrudService} from "../../../crud.service";
import {Router} from "@angular/router";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import {environment} from "@env/environment";

@Component({
  selector: 'app-yangben-field-define',
  templateUrl: './yangben-field-define.component.html',
  styleUrls: ['./yangben-field-define.component.css'],
})
export class YangbenFieldDefineComponent implements OnInit {

  constructor(private crudService: CrudService,
              private modalService: NzModalService,
              public msg: NzMessageService,
              private router: Router,) { }

  listOfAllData = [];
  loading = false;
  pageIndex = 1;
  pageSize = 50;

  ngOnInit() {
    this.crudService.search(environment.baseUrl + 'api', 'yangben-field-define',{sort:["id,ASC"]})
      .subscribe((res: any[]) => {
        this.listOfAllData = res;
      });

  }

  currentPageDataChange($event: any[]) {
  }

  edit(id: any) {
    // this.crudService.search(environment.baseUrl + 'api', `yangben-data/existsField/${id}`,  {}).subscribe((res: any) => {
    //   if(res){
    //     this.msg.warning('字段已被使用，不可修改');
    //     return;
    //   }else {
        this.router.navigate(['yangben/yangben-field-define-edit'], {
          queryParams: {
            tempId: id
          },
        });
    //   }
    // });
  }

  del(id: any) {
    this.crudService.search(environment.baseUrl + 'api', `yangben-data/existsField/${id}`,{}).subscribe((res: any) => {
      if(res){
        this.msg.warning('字段已被使用，不可删除');
        return;
      }else{
        this.modalService.confirm({
          nzTitle: `删除字段`,
          nzContent: `<b style="color: red;">确定删除该字段吗？</b>`,
          nzOkType: 'danger',
          nzOnOk: () => {
            this.crudService.del(environment.baseUrl + 'api', 'yangben-field-define', id).subscribe(res => {
              this.msg.create('success', `删除成功`);
              this.ngOnInit();
            });
          },
          nzOnCancel: () => console.log('Cancel'),
        });
      }
    });
  }
}

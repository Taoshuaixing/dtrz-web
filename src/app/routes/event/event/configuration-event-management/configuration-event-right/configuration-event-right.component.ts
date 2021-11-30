import { Component, OnInit } from '@angular/core';
import { CrudService } from 'src/app/routes/crud.service';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Router, ActivatedRoute } from '@angular/router';
import { environment } from '@env/environment';
import { SettingsService } from '@delon/theme';

@Component({
  selector: 'app-configuration-event-right',
  templateUrl: './configuration-event-right.component.html',
  styleUrls: ['./configuration-event-right.component.css'],
})
export class ConfigurationEventRightComponent implements OnInit {
  constructor(
    private crudService: CrudService,
    private modalService: NzModalService,
    private msg: NzMessageService,
    private router: Router,
    private activedrouted: ActivatedRoute,
    public settingService: SettingsService,
  ) {}
  arr = [];
  addFlg = false;
  newType = '';
  secondParentid: any;
  newSecond = '';

  allChecked = false;
  indeterminate = true;
  checked = false;
  visible = false;
  loading = false;
  ngOnInit(): void {
    this.activedrouted.queryParams.subscribe(params => {
      this.secondParentid = params.parentId;
      this.search();
    });
  }

  search() {
    this.crudService
      .search(environment.baseUrl_zxtj + 'api', 'classifyEvent', {
        sort: ['sortId,ASC'],
        filter: ['deleteFlag||$eq||0', `parentid||$eq||${this.secondParentid}`],
      })
      .subscribe((res: any[]) => {
        this.arr = res;
        this.arr.map((item: any) => {
          // 对第3级进行排序
          item.children = item.children.filter(it => it.deleteFlag === 0);
          item.children.sort((a: any, b: any) => {
            return a.sortId - b.sortId;
          });
        });
        this.loading = false;
      });
  }

  // 获取modal中的事件
  getEmitter(callbackResult: any) {

    this.loading = true;
    if (callbackResult.classifiId) {
      this.crudService
        .update2(environment.baseUrl_zxtj + 'api', 'classifyEvent', callbackResult.classifiId, {
          updateUser: this.settingService.user.userId,
          id: 0,
          eventClassifyName: callbackResult.actionClassifyName,
          parent: { id: callbackResult.classifiParentId },
        })
        .subscribe(res => {
          this.ngOnInit();
        });
    } else {
      this.crudService
        .add(environment.baseUrl_zxtj + 'api', 'classifyEvent', {
          createUser: this.settingService.user.userId,
          sortId: this.arr.length,
          id: 0,
          eventClassifyName: callbackResult.actionClassifyName,
          parent: { id: callbackResult.classifiParentId },
        })
        .subscribe(res => {
          this.ngOnInit();
        });
    }
  }

  /* 分类配置 删除 分类配置 */
  deleteClassifiLevel(val: any): void {
    this.crudService
      .search(environment.baseUrl_zxtj + 'api', 'classifyEvent', { filter: ['deleteFlag||$eq||0'] })
      .subscribe((res: any[]) => {

        this.modalService.confirm({
          nzTitle: '删除分类配置',
          nzContent: '<b style="color: red;">确定删除此配置吗？</b>',
          nzOkText: '确定',
          nzOkType: 'danger',
          nzOnOk: () => {
            this.crudService.del(environment.baseUrl_zxtj + 'api', 'classifyEvent', val).subscribe(res => {
              this.msg.create('success', '删除成功');
              this.ngOnInit();
            });
          },
          nzCancelText: '取消',
          nzOnCancel: () => console.log('Cancel'),
        });
        // }
      });
  }

  sortEmitter(callbackItem: any) {
    console.log(callbackItem);
    const newList: any[] = callbackItem.sortItems.map(it => it.id);
    this.loading = true;
    this.crudService
      .update2(environment.baseUrl_zxtj + 'api', `classifyEvent/sortIdChange`, newList.join(','), {})
      .subscribe((res: any) => {
        this.search();
      });
  }
}

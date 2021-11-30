import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { CrudService } from 'src/app/routes/crud.service';
import { environment } from '@env/environment';
import { SettingsService } from '@delon/theme';

import { DatePipe } from '@angular/common';
import {XlsxService} from '@delon/abc/xlsx';
import {STColumn} from '@delon/abc/st';

@Component({
  selector: 'app-configuration-event-management',
  templateUrl: './configuration-event-management.component.html',
  styles: [],
})
export class ConfigurationEventManagementComponent implements OnInit, AfterViewInit {
  constructor(
    private crudService: CrudService,
    private modalService: NzModalService,
    private msg: NzMessageService,
    private router: Router,
    public settingService: SettingsService,
    private xlsx: XlsxService,
    private datePipe: DatePipe,
  ) {}

  breadcrumbs = [{ name: '首页' }, { name: '事件配置' }];
  arr = [];
  addFlg = false;
  newType = '';
  loading: any;
  columns: STColumn[] = [
    { title: '编号', index: 'id' },
    { title: '一级分类', index: 'eventClassifyName1' },
    { title: '二级分类', index: 'eventClassifyName2' },
    { title: '三级分类', index: 'eventClassifyName3' },
    { title: '分类级别', index: 'classifyLevel' },
    { title: '路径', index: 'path' },
    { title: '路径名称', index: 'pathName' },
    { title: '父编号', index: 'parentId' },
    { title: '创建时间', index: 'createdTime', type: 'date', dateFormat: 'yyyy-MM-dd HH:mm:ss' },
    { title: '更新时间', index: 'updatedTime', type: 'date', dateFormat: 'yyyy-MM-dd HH:mm:ss' },
  ];


  ngOnInit(): void {
    this.search();
  }

  search() {
    this.crudService
      .search(environment.baseUrl_zxtj + 'api', 'classifyEvent', {
        sort: ['sortId,ASC'],
        filter: ['deleteFlag||$eq||0', 'parentid||$isnull'],
      })
      .subscribe((res: any[]) => {
        this.arr = res;
        if (this.arr.length > 0) {
          this.router.navigate(['/event/configuration-event-management/configuration-event-right'], {
            queryParams: { parentId: this.arr[0].id },
          });
        }
        this.loading = false;
      });
  }

  ngAfterViewInit() {
    // setTimeout(() => {
    //   if (!this.arr || this.arr.length === 0) {
    //     return;
    //   }
    //   const firstItem = document.querySelector(`#item_${this.arr[0].id}`);
    //   if (firstItem) {
    //     firstItem.classList.add('ant-menu-item-selected');
    //   }
    // }, 100);
  }


  /* 子组件修改后 刷新父页 */
  getEmitter(callbackResult: any) {

    this.loading = true;
    if (callbackResult.classifiId) {
      this.crudService
        .update(environment.baseUrl_zxtj + 'api', 'classifyEvent', callbackResult.classifiId, {
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

  sortEmitter(callbackItem: any) {
    console.log(callbackItem);
    const newList: any[] = callbackItem.sortItems.map(it => it.id);

    this.crudService
      .update2(environment.baseUrl_zxtj + 'api', `classifyEvent/sortIdChange`, newList.join(','), {})
      .subscribe((res: any) => {
        this.search();
      });
  }

  deleteFirstLevel(val: any): void {
    if (val) {
      const delFlag = true;
      if (delFlag) {
        // 判断是否包含子分类
        this.crudService
          .search(environment.baseUrl_zxtj + 'api', 'classifyEvent', { filter: ['deleteFlag||$eq||0'] })
          .subscribe((res: any[]) => {

            // 删除确认信息
            this.modalService.confirm({
              nzTitle: '删除分类配置',
              nzContent: '<b style="color: red;">确定删除此配置吗？</b>',
              nzOkText: '确定',
              nzOkType: 'danger',
              nzOnOk: () => {
                this.crudService.del(environment.baseUrl_zxtj+ 'api', 'classifyEvent', val).subscribe(res => {
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
    }
  }


  convertList(list: any[]) {
    const newList: any[] = [];
    list
      .filter(f => f.classifyLevel === 1)
      .map(c1 => {
        newList.push({
          id: c1.id,
          name: c1.name,
          classifyLevel: c1.classifyLevel,
          path: c1.path,
          pathName: c1.pathName,
          parentId: c1.parentId,
          createdTime: this.datePipe.transform(c1.createdTime, 'yyyy-MM-dd HH:mm:ss'),
          updatedTime: this.datePipe.transform(c1.updatedTime, 'yyyy-MM-dd HH:mm:ss'),
          eventClassifyName1: c1.eventClassifyName,
        });
        list
          .filter(f1 => f1.classifyLevel === 2 && f1.parentId === c1.id)
          .map(c2 => {
            newList.push({
              id: c2.id,
              name: c2.name,
              classifyLevel: c2.classifyLevel,
              path: c2.path,
              pathName: c2.pathName,
              parentId: c2.parentId,
              createdTime: this.datePipe.transform(c2.createdTime, 'yyyy-MM-dd HH:mm:ss'),
              updatedTime: this.datePipe.transform(c2.updatedTime, 'yyyy-MM-dd HH:mm:ss'),
              eventClassifyName2: c2.eventClassifyName,
            });
            list
              .filter(f2 => f2.classifyLevel === 3 && f2.parentId === c2.id)
              .map(c3 => {
                newList.push({
                  id: c3.id,
                  name: c3.name,
                  classifyLevel: c3.classifyLevel,
                  path: c3.path,
                  pathName: c3.pathName,
                  parentId: c3.parentId,
                  createdTime: this.datePipe.transform(c3.createdTime, 'yyyy-MM-dd HH:mm:ss'),
                  updatedTime: this.datePipe.transform(c3.updatedTime, 'yyyy-MM-dd HH:mm:ss'),
                  eventClassifyName3: c3.eventClassifyName,
                });
              });
          });
      });

    return newList;
  }

  async download($event: MouseEvent) {
    const listItem = await new Promise<any>((resolve, reject) => {
      this.crudService.searchAll(environment.baseUrl_zxtj + 'api', `classifyEvent/list`).subscribe((res: any[]) => {
        resolve(res);
      });
    });

    let data = [];
    const sheetName = '事件分类配置';
    const nowDate = new Date();
    const todayStr = this.datePipe.transform(nowDate, 'yyyy-MM-dd');
    const filename = '事件分类配置_' + todayStr + '.xlsx';

    data = [this.columns.map(i => i.title)];
    this.convertList(listItem).forEach(i => data.push(this.columns.map(c => i[c.index as string])));

    this.xlsx.export({
      sheets: [
        {
          data,
          name: sheetName,
        },
      ],
      filename,
    });
  }
}

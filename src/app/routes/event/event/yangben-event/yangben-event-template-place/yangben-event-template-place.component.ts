import {Component, OnInit} from '@angular/core';
import {environment} from '@env/environment';
import {CrudService} from '../../../../crud.service';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzModalService} from 'ng-zorro-antd/modal';
import {SettingsService} from '@delon/theme';
import {StorageService} from 'src/app/routes/storage.service';
import {YangbenService} from "../../../../yangben/yangben.service";

@Component({
  selector: 'app-yangben-event-template-place',
  templateUrl: './yangben-event-template-place.component.html',
  styleUrls: ['./yangben-event-template-place.component.css'],
})
export class YangbenEventTemplatePlaceComponent implements OnInit {
  constructor(
    private crudService: CrudService,
    private modalService: NzModalService,
    public settingService: SettingsService,
    public msg: NzMessageService,
    public yangbenService: YangbenService,
    public storageService: StorageService,
  ) {}

  listOfAllData: any;
  fieldList: any;
  loading: any;

  async ngOnInit() {
    this.fieldList = await this.yangbenService.getAllEventField();
    await this.getData();
  }

  async getData(reset: boolean = false) {
    this.crudService
      .searchAll(environment.baseUrl + 'api', 'yangben-event-template-place')
      .subscribe(async (res: any) => {
        this.listOfAllData = res;
        this.listOfAllData.forEach((it) => {
          it.yangbenEventTemplatePlaceFields.map((m) => {
            const field = this.fieldList.find((f) => f.id === m.fieldId);
            if (field) {
              m.fieldName = field.fieldName;
            }
          });

          it.yangbenEventTemplatePlaceFields.push(
            { sortId: -1, fieldName: '事件名称' },
            { sortId: 0, fieldName: '事件分类' },
          );
          it.yangbenEventTemplatePlaceFields.sort((a: any, b: any) => {
            return a.sortId - b.sortId;
          });
        });

        // console.log(this.listOfAllData);
        this.loading = false;
      });
  }

  getEditorEmitter(item, callbackResult: any) {
    this.loading = true;
    if (callbackResult.inputId) {
      this.crudService
        .update(environment.baseUrl + 'api', 'yangben-event-template-place', callbackResult.inputId, {
          updateUser: this.settingService.user.userId,
          id: 0,
          name: callbackResult.inputName,
        })
        .subscribe((res) => {
          item.name = callbackResult.inputName;
          this.loading = false;
          this.refreshMenu();
        });
    } else {
      this.crudService
        .add(environment.baseUrl + 'api', 'yangben-event-template-place', {
          createUser: this.settingService.user.userId,
          id: 0,
          name: callbackResult.inputName,
        })
        .subscribe((res) => {
          this.getData();
          this.refreshMenu();
        });
    }
  }

  async waitSearch(item: any) {
    this.crudService
      .get(environment.baseUrl + 'api', 'yangben-event-template-place', item.id)
      .subscribe(async (res: any) => {
        item.yangbenEventTemplatePlaceFields = res.yangbenEventTemplatePlaceFields;
        item.yangbenEventTemplatePlaceFields.map((m) => {
          const field = this.fieldList.find((f) => f.id === m.fieldId);
          if (field) {
            m.fieldName = field.fieldName;
          }
        });

        item.yangbenEventTemplatePlaceFields.push(
          { sortId: -1, fieldName: '事件名称' },
          { sortId: 0, fieldName: '事件分类' },
        );
        item.yangbenEventTemplatePlaceFields.sort((a: any, b: any) => {
          return a.sortId - b.sortId;
        });

        this.loading = false;
      });
  }

  /**
   * 是否存在check
   * @param inputName
   * @param id
   */
  async check(inputName: any, id: number): Promise<boolean> {
    const filter = [`name||$eq||${inputName}`];

    if (id) {
      filter.push(`id||$ne||${id}`);
    }

    const cnt: number = await new Promise<number>((resolve) => {
      this.crudService
        .search(environment.baseUrl + 'api', 'yangben-event-template-place', {
          filter: filter,
        })
        .subscribe((res: any[]) => {
          resolve(res.length);
        });
    });
    return cnt > 0;
  }

  del(item: any) {
    if (item.fixName) {
      this.msg.create('info', '此模板为固定模板，不可删除！');
      return;
    }

    this.modalService.confirm({
      nzTitle: `操作删除`,
      nzContent: `<b style="color: red;">确定删除该名称吗？</b>`,
      nzOkType: 'danger',
      nzOnOk: async () => {
        this.crudService
          .del(environment.baseUrl + 'api', 'yangben-event-template-place', item.id)
          .subscribe((res: any) => {
            this.msg.create('success', `删除成功`);
            this.ngOnInit();
            this.refreshMenu();
          });
      },
      nzOnCancel: () => console.log('Cancel'),
    });
  }

  refreshMenu() {
    this.crudService.search(environment.baseUrl + 'api', 'yangben-event-template-place', '').subscribe((res: any[]) => {
      this.storageService.get('menus').splice(0, this.storageService.get('menus').length);
      res.forEach((it) => {
        this.storageService.get('menus').push({ title: it.name, value: it.id });
      });
      this.storageService.get('menus').push({ title: '综合事件查询', value: 0 });
    });
  }
}

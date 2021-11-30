import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { CrudService } from '../../../crud.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ExcelDownloadService } from '../../../excelDownload.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { DatePipe } from '@angular/common';
import { YangbenService } from '../../../yangben/yangben.service';
import { base64decoder, base64encoder } from '@shared/utils/base64';
import { environment } from '@env/environment';
import { fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { ACLService } from '@delon/acl';
import { SettingsService } from '@delon/theme';
import { NzModalEventUpdateDetailComponent } from './nz-modal-event-update-detail/nz-modal-event-update-detail.component';
import { NzModalEventViewDetailComponent } from './nz-modal-event-view-detail/nz-modal-event-view-detail.component';
import { StorageService } from 'src/app/routes/storage.service';
import { CommonService } from '@shared/service/common-service';
import { recentDay } from '@shared/utils/date-util';

@Component({
  selector: 'app-yangben-event',
  templateUrl: './yangben-event.component.html',
  styleUrls: ['./yangben-event.component.css'],
})
export class YangbenEventComponent implements OnInit, AfterViewInit {
  constructor(
    private crudService: CrudService,
    private router: Router,
    private excelService: ExcelDownloadService,
    public msg: NzMessageService,
    private activedrouted: ActivatedRoute,
    private datePipe: DatePipe,
    private aclService: ACLService,
    private yangbenService: YangbenService,
    private modalService: NzModalService,
    private settingService: SettingsService,
    private storageService: StorageService,
    public commonService: CommonService,
  ) {}

  @ViewChild('editEventDrawer', { static: true })
  modalEventUpdateDetailComponent: NzModalEventUpdateDetailComponent;

  @ViewChild('viewEventDrawer', { static: true })
  modalEventViewDetailComponent: NzModalEventViewDetailComponent;

  currentSys = environment.currentSys;
  listOfAllData = [];
  fieldList = [];
  fieldListForSearch = [];
  fieldListForList = [];
  loading = false;
  delLoading = false;
  dateFormat = 'yyyy/MM/dd';

  saveSearchInfo = {
    pageSize: 10,
    pageIndex: 0,
    fieldListForSearch: {},
  };

  sortValue: string | null = null;
  sortKey: string | null = null;

  pageIndex = 1;
  pageSize = 10;
  total = 0;
  searchListStr = '';
  expandForm = true;
  tableWidth = 2000;
  highLightFlag = false;

  isAllDisplayDataChecked = false;
  isIndeterminate = false;
  listOfDisplayData: ItemData[] = [];
  mapOfCheckedId: { [key: string]: boolean } = {};

  nzOptions: any[] | null = null;
  signValues = [];
  options = [];
  signList = [];

  eventName: any;
  expandEventClassifyKeys = [];
  eventClassifyId?: number;
  eventClassifyNodes = [];

  readOnly = false;
  content_width = 1550;

  postId = 0;
  adminFlag = 0;
  wenziFlag = 0;
  viewAllYangben = false;
  signEventClassifyId?: number;
  postChangeFlag?: number;
  eventMapList = [
    { id: 0, name: '用户录入' },
    { id: 1, name: '图谱推荐' },
  ];

  eventTemplateId: any;
  menuTitle: any;
  selectedId = [];
  templateId?: number;
  eventTmplateList = [];
  rowCnt: any;

  visible = false;
  searchValue = '';
  searchCZTime: any;
  dutyList = [
    { label: '白班', value: 'm', checked: false },
    { label: '夜班', value: 'n', checked: false },
  ];
  containChuzhi = false;

  searchList = {
    limit: 0,
    page: 1,
    filter: [],
    join: [],
    postId: 0,
    chuzhiTime: [],
    duty: '',
    ids: '',
  };

  yangbenFieldList: any;
  chuzhiCntFieldId = 0;
  chuzhiTimeFieldId = 0;

  ngAfterViewInit(): void {
    fromEvent(window, 'resize')
      .pipe(debounceTime(200))
      .subscribe((event) => {
        // 这里处理页面变化时的操作
        this.changeSize();
      });
  }

  changeSize() {
    this.content_width = document.querySelector('body').clientWidth - 370;
  }
  async ngOnInit() {
    this.postId = this.settingService.user.posts[0].id;

    if (this.currentSys === 'dt') {
      this.searchCZTime = this.commonService.getOneDay19();
      this.containChuzhi = true;

      this.yangbenFieldList = await this.yangbenService.getAllField();
      const chuzhiCntField = this.yangbenFieldList.find((f) => f.fixName === 'chuzhiCnt');
      const chuzhiTimeField = this.yangbenFieldList.find((f) => f.fixName === 'chuzhiTime');
      if (chuzhiCntField) this.chuzhiCntFieldId = chuzhiCntField.id;
      if (chuzhiTimeField) this.chuzhiTimeFieldId = chuzhiTimeField.id;
    }

    const curRole = this.storageService.curRole;
    if (curRole.indexOf('dagl_post') >= 0 || curRole.indexOf('dagl_editor') >= 0) {
      this.readOnly = true;
    }

    if (curRole.indexOf('dagl_admin') >= 0) {
      // 管理员
      this.adminFlag = 1;
    } else if (curRole.indexOf('dagl_editor') >= 0) {
      // 文字岗
      this.wenziFlag = 1;
    }

    if (this.currentSys === 'dt') {
      this.viewAllYangben = this.adminFlag === 1 || this.wenziFlag === 1;
    } else {
      this.viewAllYangben = this.adminFlag === 1;
    }

    this.content_width = document.querySelector('body').clientWidth - 370;

    this.activedrouted.queryParams.subscribe(async (params) => {
      if (params) {
        this.eventTemplateId = Number(params.eventTemplateId);
        this.clean();
        this.searchListStr = params.searchListStr;

        // 查询模板名称
        if (this.eventTemplateId > 0) {
          this.crudService
            .get(environment.baseUrl + 'api', 'yangben-event-template-place', this.eventTemplateId)
            .subscribe((res: any) => {
              this.menuTitle = res.name;
            });
        }

        await this.init();
      }
    });
  }

  async init() {
    await this.refreshField();
    await this.searchEventClassify();

    const detailSearchStr = this.searchListStr;
    // 如果检索条件不为空（详情页返回）,设置页面检索条件及状态
    if (detailSearchStr) {
      const detailSearchObj = JSON.parse(base64decoder(detailSearchStr));
      this.setSearch(detailSearchObj);
      await this.search(false);
    } else {
      await this.search(true);
    }

    this.options = await this.yangbenService.getSignList();

    setTimeout(() => {
      this.nzOptions = this.options;
    }, 100);
  }

  async searchEventClassify() {
    // 获取所有事件分类，用于下拉
    const treeData: any = await this.yangbenService.searchEventClassify();
    if (treeData) {
      this.eventClassifyNodes = treeData.eventClassifyNodes;
      this.expandEventClassifyKeys = treeData.expandEventClassifyKeys;
    }
  }

  setSearch(detailSearchObj: any) {
    this.pageSize = detailSearchObj.pageSize;
    this.pageIndex = detailSearchObj.pageIndex;
    const fromDetailList = [];
    for (const items of detailSearchObj.fieldListForSearch) {
      for (const item of items.children) {
        fromDetailList.push(item);
      }
    }
    for (const items of this.fieldListForSearch) {
      items.children = items.children.map((m) => {
        const fItem = fromDetailList.find((f) => f.id === m.id);
        if (fItem) {
          return { ...m, ...fItem };
        }
        return m;
      });
    }
  }

  async refreshField() {
    this.fieldList = [];
    this.eventTmplateList = [];

    await new Promise((resolve, reject) => {
      this.crudService
        .searchAll(environment.baseUrl + 'api', 'yangben-event-template-place')
        .subscribe((res: any[]) => {
          this.eventTmplateList.push({ id: 0, name: '无模板' });
          res.map((m) => {
            this.eventTmplateList.push({ id: m.id, name: m.name });
          });
          resolve(res);
        });
    });

    const allFieldList: any = await new Promise((resolve, reject) => {
      this.crudService
        .search(environment.baseUrl + 'api', 'yangben-event-field-define', { sort: [`id,ASC`] })
        .subscribe((res: any[]) => {
          resolve(res);
        });
    });

    if (this.eventTemplateId > 0) {
      this.fieldList = await new Promise((resolve, reject) => {
        this.crudService
          .get(environment.baseUrl + 'api', 'yangben-event-template-place', this.eventTemplateId)
          .subscribe((res: any) => {
            resolve(res.yangbenEventTemplatePlaceFields);
          });
      });

      this.fieldList = this.fieldList.map((m) => {
        allFieldList.map((it) => {
          if (m.fieldId === it.id) {
            m.id = m.fieldId;
            m.fieldName = it.fieldName;
            m.fieldType = it.fieldType;
            m.yangbenOptionConfig = it.yangbenOptionConfig;
          }
        });
        return { ...m };
      });
    } else {
      this.fieldList = await new Promise((resolve, reject) => {
        this.crudService
          .search(environment.baseUrl + 'api', 'yangben-event-field-define', {
            filter: [`deleteFlag||$eq||0`],
            sort: ['sortId,ASC', 'id,ASC'],
          })
          .subscribe((res: any[]) => {
            resolve(res);
          });
      });
    }

    this.fieldList = await Promise.all(
      this.fieldList.map(async (m) => {
        return (async () => {
          if (m.yangbenOptionConfig) {
            const data = await this.yangbenService.getTableData(m.yangbenOptionConfig.id);
            return { ...m, targetTableData: data };
          } else {
            return m;
          }
        })();
      }),
    );

    const colCnt = 3;
    let tmpSearchItem = this.fieldList.filter((f) => f.searchItemFlag === 1);

    // 默认时间
    let dateRange = recentDay(7);

    if (this.eventTemplateId > 0) {
      tmpSearchItem = [
        {
          id: -1,
          fieldType: 3,
          fieldName: '创建时间',
          showTime: true,
          name: 'createdTime',
          exp: 'between',
          val: dateRange,
        },
        {
          id: -2,
          fieldType: 51,
          subType: 'radio',
          fieldName: '事件状态',
          name: 'currentStatus',
          checkItems: [
            { label: '正在使用', value: 1, checked: true },
            { label: '待启动', value: 2, checked: true },
            { label: '已停用', value: 3, checked: false },
          ],
          exp: 'in',
        },
        {
          id: -3,
          fieldType: 51,
          subType: 'radio',
          fieldName: '纳入专项统计',
          name: 'eventStatId',
          checkItems: [
            { label: '是', value: 0, checked: false },
            { label: '否', value: 1, checked: false },
          ],
        },
        { id: -4, fieldType: 1, fieldName: '事件名称', name: 'eventName', exp: 'like' },
        { id: -5, fieldType: 53, fieldName: '事件分类', name: 'classifyEventId' },
        { id: -6, fieldType: 54, fieldName: '事件来源', name: 'postChangeFlag' },

        ...tmpSearchItem,
      ];
    } else {
      tmpSearchItem = [
        {
          id: -1,
          fieldType: 3,
          fieldName: '创建时间',
          showTime: true,
          name: 'createdTime',
          exp: 'between',
          val: dateRange,
        },
        {
          id: -2,
          fieldType: 51,
          subType: 'radio',
          fieldName: '事件状态',
          name: 'currentStatus',
          checkItems: [
            { label: '正在使用', value: 1, checked: true },
            { label: '待启动', value: 2, checked: true },
            { label: '已停用', value: 3, checked: false },
          ],
          exp: 'in',
        },
        {
          id: -3,
          fieldType: 51,
          subType: 'radio',
          fieldName: '纳入专项统计',
          name: 'eventStatId',
          checkItems: [
            { label: '是', value: 0, checked: false },
            { label: '否', value: 1, checked: false },
          ],
        },
        { id: -4, fieldType: 1, fieldName: '事件名称', name: 'eventName', exp: 'like' },
        { id: -5, fieldType: 53, fieldName: '事件分类', name: 'classifyEventId' },
        { id: -6, fieldType: 55, fieldName: '事件模板', name: 'templateId' },
        { id: -7, fieldType: 54, fieldName: '事件来源', name: 'postChangeFlag' },
        ...tmpSearchItem,
      ];
    }

    this.rowCnt = Number(tmpSearchItem.length / colCnt);

    this.fieldListForSearch = [];
    for (let r = 0; r < this.rowCnt; r++) {
      this.fieldListForSearch.push({ children: tmpSearchItem.slice(r * colCnt, (r + 1) * colCnt) });
    }

    this.fieldListForList = this.fieldList.filter((f) => f.showFlag === 1);

    this.tableWidth = this.commonService.setColWidth(this.fieldListForList, this.content_width, '', 760);
  }

  // 高亮显示处理
  findSearchVal(fieldName) {
    for (const items of this.fieldListForSearch) {
      for (const item of items.children) {
        if (item.fieldName === fieldName) {
          const reVal = item.val;
          if (item.fieldType === 5 || item.fieldType === 6) {
            if (item.targetTableData) {
              for (const it of item.targetTableData) {
                if (it.id === reVal) {
                  return it.name;
                }
              }
            }
          }
          return reVal;
        }
      }
    }
    return '';
  }

  // 根据字段类型，返回table显示样式(居中或者居左)
  findShowCss(fieldType) {
    // 如果是输入框居左
    if (fieldType === 1 || fieldType === 2 || fieldType === 5 || fieldType === 6) {
      return 'nzLeft';
    }
    return 'center';
  }

  async search(reset: boolean = false) {
    this.loading = true;

    if (reset) {
      this.pageIndex = 1;
    }
    const res = await this.searchSub();
    this.listOfAllData = res.data;
    this.total = res.total;

    this.loading = false;
  }

  async searchSub() {
    // #region  保存检索条件，用于返回时，保存状态
    this.saveSearchInfo.pageSize = this.pageSize;
    this.saveSearchInfo.pageIndex = this.pageIndex;
    this.saveSearchInfo.fieldListForSearch = this.fieldListForSearch;
    this.searchListStr = base64encoder(JSON.stringify(this.saveSearchInfo));
    //#region

    const searchFilter = [];
    const searchFilterRec = [];
    for (const items of this.fieldListForSearch) {
      for (const item of items.children) {
        if (item.exp === 'between' && item.val) {
          searchFilter.push({
            fieldName: item.name,
            exp: item.exp,
            ...this.getDateRange(item.val, item.showTime),
            others: item.others,
          });
        } else if (item.name === 'eventName' && item.val) {
          searchFilterRec.push({ fieldName: 'name', val: item.val, exp: 'like' });
        } else if (item.name === 'eventStatId') {
          for (const f of item.checkItems) {
            if (f.checked === true) {
              const checkedCnt = item.checkItems.filter((f) => f.checked === true);
              if (checkedCnt.length === 1) {
                if (checkedCnt[0].value === 0) {
                  searchFilterRec.push({ fieldName: 'eventStatId', val: 'not null', exp: 'is' });
                } else {
                  searchFilterRec.push({ fieldName: 'eventStatId', val: ' null', exp: 'is' });
                }
              }
            }
          }
        } else if (item.name === 'currentStatus') {
          const currentStatusList = [];
          const items = item.checkItems.filter((f) => f.checked === true);
          items.map((m) => {
            currentStatusList.push(m.value);
          });
          if (currentStatusList.length > 0) {
            searchFilterRec.push({ fieldName: 'currentStatus', val: currentStatusList, exp: 'in' });
          }
        } else if (item.name === 'classifyEventId' && this.eventClassifyId) {
          searchFilterRec.push({ fieldName: 'classifyEventId', val: this.eventClassifyId });
        } else if (item.name === 'postChangeFlag' && this.postChangeFlag != null) {
          searchFilterRec.push({ fieldName: 'postChangeFlag', val: this.postChangeFlag });
        } else if (item.name === 'templateId' && this.templateId != null) {
          searchFilterRec.push({ fieldName: 'eventTemplateId', val: this.templateId });
        } else {
          if (!item.val && !item.start) continue;

          if (item.fieldType === 1 || item.fieldType === 2) {
            searchFilter.push({ fieldId: item.id, val: item.val, exp: 'like' });
          } else if (item.fieldType === 3) {
            if (item.val && item.val.length > 1) {
              searchFilter.push({ fieldId: item.id, ...this.commonService.getDateRange(item.val) });
            }
          } else if (item.fieldType === 4) {
            searchFilter.push({ fieldId: item.id, start: item.start, end: item.end });
          } else {
            searchFilter.push({ fieldId: item.id, val: item.val });
          }
        }
      }
    }

    if (this.eventTemplateId > 0) {
      searchFilterRec.push({ fieldName: 'eventTemplateId', val: this.eventTemplateId });
    }

    const page = { limit: this.pageSize, page: this.pageIndex, sort: '' };

    if (this.sortKey) {
      page.sort = this.sortKey + ' ' + this.sortValue;
    }

    const res: any = await new Promise((resolve, reject) => {
      this.crudService
        .search(environment.baseUrl + 'api', 'yangben-event', {
          s: JSON.stringify(searchFilter),
          rec: JSON.stringify(searchFilterRec),
          page: JSON.stringify(page),
          other: JSON.stringify({
            postId: this.postId,
            adminFlag: this.adminFlag,
            isWenziPost: this.wenziFlag,
            noLimit: 1,
            containChuzhi: this.containChuzhi,
          }),
        })
        .subscribe((res: any) => {
          resolve(res);
        });
    });
    return res;
  }

  async waitSearch(parent: any) {
    await parent.init();
  }

  deleteRec(data: any) {
    const ids = [];
    const updatYangbenIds = [];
    let content = '';
    if (data.yangbenCnt > 0) {
      content =
        '<b style="color: red;">该事件已有样本数据绑定，删除该事件，相应样本数据绑定也会解除！确定删除此数据吗？</b>';
      updatYangbenIds.push(data.id);
    } else {
      content = '<b style="color: red;">确定删除此数据吗？</b>';
    }

    ids.push(data.recUuid);

    this.modalService.confirm({
      nzTitle: '删除数据',
      nzContent: content,
      nzOkType: 'danger',
      nzOnOk: async () => {
        this.crudService
          .add(environment.baseUrl + 'api', 'yangben-event/removeBatch', {
            ids: ids,
            updatYangbenIds: updatYangbenIds,
          })
          .subscribe((res) => {
            this.loading = false;
            this.msg.success('删除成功');
            this.search();
          });
      },
      nzOnCancel: () => {
        this.loading = false;
        console.log('Cancel');
      },
    });
  }

  async deleteYangbenList() {
    this.delLoading = true;
    const ids = [];
    const updatYangbenIds = [];
    const selectedList = this.listOfAllData.filter((f) => this.mapOfCheckedId[f.recUuid]);

    for (const item of selectedList) {
      ids.push(item.recUuid);
      if (item.yangbenCnt > 0) {
        updatYangbenIds.push(item.id);
      }
    }

    if (ids.length === 0) {
      this.delLoading = false;
      this.msg.create('info', '请选择删除的数据');
      return;
    } else {
      let content = '';
      if (updatYangbenIds.length > 0) {
        content =
          '<b style="color: red;">选中事件中含有被样本数据绑定事件，删除事件，相应样本数据绑定也会解除！确定删除此数据吗？</b>';
      } else {
        content = '<b style="color: red;">确定删除此批数据吗？</b>';
      }

      this.modalService.confirm({
        nzTitle: '删除数据',
        nzContent: content,
        nzOkType: 'danger',
        nzOnOk: async () => {
          this.crudService
            .add(environment.baseUrl + 'api', 'yangben-event/removeBatch', {
              ids: ids,
              updatYangbenIds: updatYangbenIds,
            })
            .subscribe((res) => {
              this.delLoading = false;
              this.msg.success('删除成功');
              this.search();
            });
        },
        nzOnCancel: () => {
          this.delLoading = false;
          console.log('Cancel');
        },
      });
    }
  }

  // async deleteUserForList(params: any): Promise<number> {
  //   let count = 0;
  //   if (params) {
  //     const res = await new Promise(async (resolve, reject) => {
  //       for (const id of params) {
  //         const r = await new Promise((resolve_1, reject_1) => {
  //           this.crudService.del(environment.baseUrl + 'api', 'yangben-event', id).subscribe(res_articles => {
  //             count++;
  //             resolve_1(1);
  //           });
  //         });
  //       }
  //       resolve(count);
  //     });
  //   }
  //   return count;
  // }

  // 重置检索条件
  resetSe() {
    this.clean();
    this.search(true);
  }

  clean() {
    this.eventName = '';
    this.eventClassifyId = null;
    this.postChangeFlag = null;
    this.templateId = null;
    this.fieldListForSearch = this.fieldListForSearch.map((m) => {
      m.children = m.children.map((m1) => {
        delete m1.val;
        delete m1.start;
        delete m1.end;

        if (m1.hasOwnProperty('checkItems')) {
          m1.checkItems.map((it) => {
            it.checked = false;
            return it;
          });
        }

        return m1;
      });
      return m;
    });
  }

  checkAll(value: boolean): void {
    this.listOfDisplayData.forEach((item) => (this.mapOfCheckedId[item.recUuid] = value));
    this.refreshStatus();
  }

  currentPageDataChange($event: ItemData[]): void {
    this.listOfDisplayData = $event;
    this.refreshStatus();
  }

  refreshStatus(): void {
    this.isAllDisplayDataChecked = this.listOfDisplayData.every((item) => this.mapOfCheckedId[item.recUuid]);
    this.isIndeterminate =
      this.listOfDisplayData.some((item) => this.mapOfCheckedId[item.recUuid]) && !this.isAllDisplayDataChecked;

    const selectedList = this.listOfAllData.filter((f) => this.mapOfCheckedId[f.recUuid]);

    for (const item of selectedList) {
      this.selectedId.push(item.id);
    }
  }

  changeNzOptions(): void {
    this.loading = true;

    if (this.signValues.length === 0) {
      this.loading = false;
      this.msg.create('info', '请选择批量标记要替换的值！');
      return;
    }

    const signValue = this.signValues[1];
    const fieldId = this.signValues[0];
    const selectedParent = this.options.find((m) => m.value === this.signValues[0]);
    const optionConfigId = this.getOptionConfigIdByFieldId(selectedParent.value);
    const fieldType = this.getFieldTypeByFieldId(fieldId);

    const selecedItem = selectedParent.children.find((f) => f.value === signValue);

    const ids = [];
    const selectedList = this.listOfAllData.filter((f) => this.mapOfCheckedId[f.recUuid]);

    for (const item of selectedList) {
      ids.push(item.recUuid);
    }

    if (ids.length === 0) {
      this.loading = false;
      this.msg.create('info', '请选择批量标记的数据');
      return;
    } else {
      this.modalService.confirm({
        nzTitle: '批量标记',
        nzContent: '<b style="color: red;">确定批量标记这些数据吗？</b>',
        nzOkType: 'danger',
        nzOnOk: async () => {
          this.crudService
            .add(environment.baseUrl + 'api', 'yangben-event/updateBatch', {
              ids: ids,
              fieldId: this.signValues[0],
              signValId: signValue,
              signVal: selecedItem.label,
              optionConfigId: optionConfigId,
              fieldType: fieldType,
            })
            .subscribe((res) => {
              this.loading = false;
              this.msg.create('success', `批量标记成功`);
              this.search();
            });
        },
        nzOnCancel: () => {
          this.loading = false;
          console.log('Cancel');
        },
      });
    }
  }

  getOptionConfigIdByFieldId(fieldId: any) {
    const fieldInfo = this.fieldList.find((f) => f.id === fieldId);
    if (fieldInfo && fieldInfo.yangbenOptionConfig) {
      return fieldInfo.yangbenOptionConfig.id;
    }
    return null;
  }

  getFieldTypeByFieldId(fieldId: any) {
    const fieldInfo = this.fieldList.find((f) => f.id === fieldId);
    return fieldInfo.fieldType;
  }

  onChanges(values: any): void {
    // console.log(values, this.signValues);
  }

  getEmitterUpdateDetail($event) {}

  async callPage(parent: any) {
    // await parent.ngOnInit();
    //  子窗口回调，翻页功能
  }

  onChange($event: any) {}

  /* 获取排序规则 */
  sort(sort: { key: string; value: string }): void {
    this.sortKey = sort.key;
    if (sort.value) {
      // tslint:disable-next-line: prefer-conditional-expression
      if (sort.value === 'ascend') {
        this.sortValue = 'ASC';
      } else {
        this.sortValue = 'DESC';
      }
    } else {
      this.sortKey = '';
      this.sortValue = '';
    }
    this.search();
  }

  async getEventClassifyIds() {
    let path = '';
    for (const m of this.eventClassifyNodes) {
      if (m.id === this.eventClassifyId) {
        path = m.path;
        break;
      } else {
        for (const m1 of m.children) {
          if (m1.id === this.eventClassifyId) {
            path = m1.path;
            break;
          } else {
            for (const m2 of m1.children) {
              if (m2.id === this.eventClassifyId) {
                path = m2.path;
                break;
              }
            }
          }
        }
      }
    }
    let eventClassifyIds = [];
    if (path) {
      eventClassifyIds = path.split('/');
    }

    return eventClassifyIds;
  }

  changeCurrentStatus(currentStatus: number) {
    const ids = [];
    const selectedList = this.listOfAllData.filter((f) => this.mapOfCheckedId[f.recUuid]);

    for (const item of selectedList) {
      ids.push(item.recUuid);
    }

    if (ids.length === 0) {
      this.loading = false;
      this.msg.create('info', '请选择要修改状态的数据');
      return;
    } else {
      let text = '';
      if (currentStatus === 1) {
        text = '确定<b>启用</b>此批数据吗？';
      } else {
        text = '确定<b>停用</b>此批数据吗？';
      }

      this.modalService.confirm({
        nzTitle: '事件状态修改',
        nzContent: `<span style="color: red;">${text}</span>`,
        nzOkType: 'danger',
        nzOnOk: async () => {
          this.crudService
            .add(environment.baseUrl + 'api', 'yangben-event/updateCurrentStatus', {
              ids: ids,
              currentStatus: currentStatus,
            })
            .subscribe((res) => {
              this.loading = false;
              this.msg.create('success', `事件状态修改成功`);
              this.search();
            });
        },
        nzOnCancel: () => {
          this.loading = false;
          console.log('Cancel');
        },
      });
    }
  }

  showEventModal(recUuid: any) {
    this.modalEventUpdateDetailComponent.showModal(recUuid);
  }

  showEventModalView(recUuid: any) {
    this.modalEventViewDetailComponent.showModal(recUuid);
  }

  changeEventClassify() {
    this.loading = true;

    if (!this.signEventClassifyId) {
      this.loading = false;
      this.msg.create('info', '请选择事件分类要替换的值！');
      return;
    }

    const ids = [];
    const selectedList = this.listOfAllData.filter((f) => this.mapOfCheckedId[f.recUuid]);

    for (const item of selectedList) {
      ids.push(item.recUuid);
    }

    if (ids.length === 0) {
      this.loading = false;
      this.msg.create('info', '请选择事件分类批量标记的数据');
      return;
    } else {
      this.modalService.confirm({
        nzTitle: '事件分类批量标记',
        nzContent: '<b style="color: red;">确定批量标记这些数据吗？</b>',
        nzOkType: 'danger',
        nzOnOk: async () => {
          this.crudService
            .add(environment.baseUrl + 'api', 'yangben-event/batchSignEventClassify', {
              ids: ids,
              eventClassifyId: this.signEventClassifyId,
            })
            .subscribe((res) => {
              this.loading = false;
              this.msg.create('success', `事件分类批量标记成功`);
              this.search();
            });
        },
        nzOnCancel: () => {
          this.loading = false;
          console.log('Cancel');
        },
      });
    }
  }

  signEventClassifyChange($event: any) {}

  showYangbenImport(data: any) {
    //routerLink="/yangben/yangben-data-import"
    if (data.currentStatus === 2) {
      this.msg.create('info', '当前事件为<b>待启动</b>状态，请启用后操作！');
      return;
    }
    if (data.currentStatus === 3) {
      this.msg.create('info', '当前事件为<b>已停用</b>状态，请启用后操作！');
      return;
    }

    this.router.navigate(['/yangben/yangben-data-import'], {
      queryParams: { eventId: data.id, from: 'event' },
    });
  }

  postChange() {
    const ids = [];
    const selectedList = this.listOfAllData.filter((f) => this.mapOfCheckedId[f.recUuid]);

    for (const item of selectedList) {
      ids.push(item.recUuid);
    }

    if (ids.length === 0) {
      this.loading = false;
      this.msg.create('info', '请选择要转换为岗位录入的数据');
      return;
    } else {
      this.modalService.confirm({
        nzTitle: '事件状态修改',
        nzContent: '<b style="color: red;">确定要转换这些数据吗？</b>',
        nzOkType: 'danger',
        nzOnOk: async () => {
          this.crudService
            .add(environment.baseUrl + 'api', 'yangben-event/postChange', {
              ids: ids,
            })
            .subscribe((res) => {
              this.loading = false;
              this.msg.create('success', `数据转换成功`);
              this.search();
            });
        },
        nzOnCancel: () => {
          this.loading = false;
          console.log('Cancel');
        },
      });
    }
  }

  getDateRange(dateRange: any, withTime = false) {
    const res = { start: null, end: null };
    if (withTime) {
      res.start = dateRange[0] ? this.datePipe.transform(dateRange[0], 'yyyy-MM-dd HH:mm:ss') : '2000-01-01 00:00:00';
      res.end = dateRange[1] ? this.datePipe.transform(dateRange[1], 'yyyy-MM-dd HH:mm:ss') : '2099-12-31 23:59:59';
    } else {
      res.start = dateRange[0]
        ? this.datePipe.transform(dateRange[0], 'yyyy-MM-dd') + ' 00:00:00'
        : '2000-01-01 00:00:00';
      res.end = dateRange[1]
        ? this.datePipe.transform(dateRange[1], 'yyyy-MM-dd') + ' 23:59:59'
        : '2099-12-31 23:59:59';
    }

    return res;
  }

  async searchCZ() {
    this.visible = false;
    //处置动作数量检索
    this.searchList.ids = this.listOfAllData
      .map((m) => {
        return m.id;
      })
      .join(',');

    this.searchList.duty = this.dutyList
      .filter((f) => f.checked)
      .map((m) => {
        return m.value;
      })
      .join(',');

    if (this.searchCZTime.length > 0) {
      this.searchList.chuzhiTime = [
        this.commonService.dateToStr(this.searchCZTime[0]),
        this.commonService.dateToStr(this.searchCZTime[1]),
      ];
    }

    const res1: any = await new Promise((resolve, reject) => {
      this.crudService
        .search(environment.baseUrl + 'api', 'yangben-event/getChuzhiCnt', this.searchList)
        .subscribe((res1: any) => {
          resolve(res1);
        });
    });

    console.log('this.listOfAllData', this.listOfAllData);
    console.log('getChuzhiCnt', res1);

    this.listOfAllData = this.listOfAllData.map((m) => {
      m.yangbenChuzhiCnt = res1.find((f) => Number(f.id) === Number(m.id)).cnt;
      return m;
    });
  }
}
interface ItemData {
  recUuid: number;
  name: string;
}

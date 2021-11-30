import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CrudService } from '../../../crud.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ExcelDownloadService } from '../../../excelDownload.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { DatePipe } from '@angular/common';
import { environment } from '@env/environment';
import { ZhanghaoService } from '../../zhanghao.service';
import { base64decoder, base64encoder } from '@shared/utils/base64';
import { ACLService } from '@delon/acl';
import { SettingsService } from '@delon/theme';
import { fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { NzModalUpdateDetailComponent } from './nz-modal-update-detail/nz-modal-update-detail.component';
import { NzModalViewDetailComponent } from './nz-modal-view-detail/nz-modal-view-detail.component';
import { FileDownloadService } from 'src/app/routes/fileDownload.service';
import { NzModalViewPdfComponent } from './nz-modal-view-pdf/nz-modal-view-pdf.component';
import { CommonService } from '@shared/service/common-service';

@Component({
  selector: 'app-zhanghao-data',
  templateUrl: './zhanghao-data.component.html',
  styleUrls: ['./zhanghao-data.component.css'],
})
export class ZhanghaoDataComponent implements OnInit, AfterViewInit {
  constructor(
    private crudService: CrudService,
    private router: Router,
    private excelService: ExcelDownloadService,
    private fileDownloadService: FileDownloadService,
    public msg: NzMessageService,
    private activedrouted: ActivatedRoute,
    private datePipe: DatePipe,
    public zhanghaoService: ZhanghaoService,
    private modalService: NzModalService,
    private aclService: ACLService,
    private settingService: SettingsService,
    public commonService: CommonService,
  ) {}

  listOfAllData = [];
  fieldList = [];
  fieldListForSearch = [];
  fieldListForList: any = [];
  loading = false;
  dateFormat = 'yyyy/MM/dd';
  curUuid: any;

  @ViewChild('editDrawer', { static: true })
  modalUpdateDetailComponent: NzModalUpdateDetailComponent;

  @ViewChild('viewDrawer', { static: true })
  modalViewDetailComponent: NzModalViewDetailComponent;

  @ViewChild('viewPdf', { static: true })
  modalViewPdfComponent: NzModalViewPdfComponent;

  isShowDialog = false;

  saveSearchInfo = {
    pageSize: 10,
    pageIndex: 0,
    mediaPageIndex: 0,
    mediaPageSize: 10,
    fieldListForSearch: {},
  };

  sortValue: string | null = null;
  sortKey: string | null = null;
  postSortKey = 'postId';

  pageIndex = 1;
  pageSize = 50;
  mediaPageIndex = 1;
  mediaPageSize = 24;
  total = 0;
  searchListStr = '';

  expandForm = true;
  tableWidth = 1600;
  highLightFlag = false;

  isAllDisplayDataChecked = false;
  isIndeterminate = false;
  listOfDisplayData: ItemData[] = [];
  mapOfCheckedId: { [key: string]: boolean } = {};
  selectedId = [];

  nzOptions: any[] | null = null;
  signValues = [];
  options = [];
  signList = [];

  otherPostValues = [];
  otherPostList = [];
  postList = [];

  // 用户角色
  userRoles = [];

  OPT_SHARE_NONE = 0;
  OPT_SHARE_OTHER = 1;
  OPT_SHARE_ME = 2;
  // 分享类别
  shareFlag: number = this.OPT_SHARE_NONE;

  // 岗位ID
  postId = 0;
  adminFlag = 0;

  readonly = false;
  content_width = 1550;
  offset_width = 370;
  from = '';
  eventId = 0;
  fromFieldId = 0;
  fromOptionId = 0;
  fromFieldType = 0;
  fromBatchNumber = '';

  attachmentFlag: number = 0;
  showType = 'data';
  tabs: any[] = [
    {
      active: true,
      name: '数据表',
      icon: 'unordered-list',
      showType: 'data',
    },
    {
      active: false,
      name: '多媒体',
      icon: 'play-circle',
      showType: 'media',
    },
  ];
  imgsrc = environment.baseUrl + 'api/zhanghao-attachment/download/';
  extensionNameValue: any = '';
  fileType: any = {};
  fileTypeArr = [];

  ngAfterViewInit(): void {
    fromEvent(window, 'resize')
      .pipe(debounceTime(200))
      .subscribe((event) => {
        // 这里处理页面变化时的操作
        this.changeSize();
      });
  }

  changeSize() {
    this.content_width = document.querySelector('body').clientWidth - this.offset_width;
  }

  async ngOnInit() {
    this.changeSize();
    const fileTypeInfo = this.commonService.getFileType();
    this.fileType = fileTypeInfo.fileType;
    this.fileTypeArr = fileTypeInfo.fileTypeArr;

    this.activedrouted.queryParams.subscribe(async (params) => {
      if (params) {
        this.userRoles = this.aclService.data.roles;
        // console.log("this.userRoles",this.userRoles)

        this.postId = this.settingService.user.posts[0].id;
        this.shareFlag = params.shareFlag ? Number(params.shareFlag) : this.OPT_SHARE_NONE;
        // this.adminFlag = this.userRoles.indexOf("dagl_admin") >= 0 ? 1 : 0;
        // this.readonly = this.adminFlag === 1 || (this.userRoles.indexOf("dagl_post") >= 0 && this.shareFlag > 0);
        //2021-1-29修改，管理员也按照岗位人员可修改
        this.adminFlag =
          this.userRoles.indexOf('dagl_admin') >= 0 && (!params.shareFlag || this.shareFlag === -1) ? 1 : 0;
        this.readonly = this.adminFlag === 1 || this.shareFlag > 0;

        this.postSortKey = 'postId';
        if (this.shareFlag === 1 && !this.adminFlag) {
          this.postSortKey = 'sharePostId';
        }

        this.from = params.from;
        this.eventId = params.eventId;
        this.fromFieldId = params.fieldId;
        this.fromOptionId = params.optionId;
        this.fromFieldType = params.fieldType;
        this.fromBatchNumber = params.batchNumber;

        this.searchListStr = params.searchListStr;
        await this.init();
      }
    });
  }

  launchFullscreen($event) {
    const element = $event.currentTarget;
    //此方法不可以在異步任務中執行，否則火狐無法全屏
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    } else if (element.oRequestFullscreen) {
      element.oRequestFullscreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullScreen();
    }
  }

  async init() {
    this.mapOfCheckedId = {};
    this.listOfDisplayData = [];
    this.selectedId = [];
    await this.getOtherPost();
    await this.refreshField();
    await this.getSignList();

    const detailSearchStr = this.searchListStr;
    // 如果检索条件不为空（详情页返回）,设置页面检索条件及状态
    if (detailSearchStr) {
      const detailSearchObj = JSON.parse(base64decoder(detailSearchStr));
      this.setSearch(detailSearchObj);
      this.search(false);
    } else {
      this.search(true);
    }

    setTimeout(() => {
      this.nzOptions = this.options;
    }, 100);
  }

  async getSignList() {
    this.options = [];

    this.signList = await new Promise((resolve, reject) => {
      this.crudService
        .search(environment.baseUrl + 'api', 'zhanghao-data/getSignList', {
          other: JSON.stringify({
            postId: this.postId,
            adminFlag: this.adminFlag,
            shareFlag: this.shareFlag,
          }),
        })
        .subscribe((res: any[]) => {
          resolve(res);
        });
    });

    if (this.signList) {
      for (const items of this.signList) {
        const object = { value: '', label: '', children: [] };
        object.value = items.id;
        object.label = items.fieldName;
        for (const tableData of items.targetTableData) {
          const leaf = { value: '', label: '', isLeaf: true };
          leaf.value = tableData.id;
          leaf.label = tableData.name;

          object.children.push(leaf);
        }
        this.options.push(object);
      }
    }
  }

  async getOtherPost() {
    this.postList = await new Promise((resolve, reject) => {
      this.crudService
        .search(environment.baseUrl_zxtj + 'api', 'post', {
          //  filter:[`id||$ne||${this.postId}`]
        })
        .subscribe((res: any[]) => {
          resolve(res);
        });
    });
    if (this.adminFlag === 1) {
      this.otherPostList = this.postList;
    } else {
      this.otherPostList = this.postList.filter((f) => f.id !== this.postId);
    }
  }

  setSearch(detailSearchObj: any) {
    this.pageSize = detailSearchObj.pageSize;
    this.pageIndex = detailSearchObj.pageIndex;
    this.mediaPageSize = detailSearchObj.mediaPageSize;
    this.mediaPageIndex = detailSearchObj.mediaPageIndex;
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
    this.fieldList = await new Promise((resolve, reject) => {
      this.crudService
        .search(environment.baseUrl + 'api', 'zhanghao-field-define', {
          filter: [`deleteFlag||$eq||0`],
          sort: ['sortId,ASC', 'id,ASC'],
        })
        .subscribe((res: any[]) => {
          resolve(res);
        });
    });

    this.fieldList = await Promise.all(
      this.fieldList.map(async (m) => {
        return (async () => {
          if (m.zhanghaoOptionConfig) {
            const data = await this.zhanghaoService.getTableData(m.zhanghaoOptionConfig.id);
            return { ...m, targetTableData: data };
          } else {
            return m;
          }
        })();
      }),
    );
    const colCnt = 3;
    let tmpSearchItem: any = [];

    if (this.adminFlag) {
      tmpSearchItem = this.fieldList.filter((f) => f.searchItemFlag === 1);
    } else {
      tmpSearchItem = await this.getSearchItem();
    }

    // 默认时间
    let dateRange = this.commonService.getOneDay19();

    if (this.from) {
      dateRange = [];
    }

    if (!this.adminFlag && this.shareFlag === 0) {
      // 本岗查询
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
          fieldName: '是否共享',
          name: 'isShare',
          checkItems: [
            { value: 1, id: 1, label: '是', checked: false },
            { value: 2, id: 2, label: '否', checked: false },
          ],
          others: { postId: this.postId },
        },
        { id: -3, fieldType: 1, fieldName: '账号名称', name: 'name', exp: 'like' },
        { id: -4, fieldType: 1, fieldName: '导入批次', name: 'batchNumber' },

        ...tmpSearchItem,
      ];
    } else {
      // 管理员或共享我的
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
        { id: -2, fieldType: 1, fieldName: '账号名称', name: 'name', exp: 'like' },
        {
          id: -3,
          fieldType: 5,
          fieldName: '岗位',
          name: 'postId',
          targetTableData: this.otherPostList.map((m) => {
            return { ...m, name: m.postName };
          }),
        },
        // {fieldType:1,fieldName:"导入批次",name:"batchNumber"},
        ...tmpSearchItem,
      ];
    }

    // console.log("tmpSearchItem",tmpSearchItem)

    const rowCnt = Number(tmpSearchItem.length / colCnt);

    this.fieldListForSearch = [];
    for (let r = 0; r < rowCnt; r++) {
      this.fieldListForSearch.push({ children: tmpSearchItem.slice(r * colCnt, (r + 1) * colCnt) });
    }

    if (this.adminFlag) {
      this.fieldListForList = this.fieldList.filter((f) => f.showFlag === 1);
    } else {
      this.fieldListForList = await this.getShowItem();
    }
    if (this.fieldListForList.length === 0) {
      this.msg.create('info', '请先设置显示字段');
      return;
    }

    this.tableWidth = this.commonService.setColWidth(this.fieldListForList, this.content_width, '', 460);
  }

  async getSearchItem() {
    const checkedList: any = await this.zhanghaoService.getSearchCheckedField(
      this.postId,
      this.shareFlag === this.OPT_SHARE_ME ? 1 : 0,
    );
    return checkedList.map((m) => {
      const ff = this.fieldList.find((f1) => f1.id === m.fieldId);
      if (ff) {
        return { ...ff };
      }
      return m;
    });
  }

  async getShowItem() {
    const checkedList: any = await this.zhanghaoService.getShowCheckedField(
      this.postId,
      this.shareFlag === this.OPT_SHARE_ME ? 1 : 0,
    );
    return checkedList.map((m) => {
      const ff = this.fieldList.find((f1) => f1.id === m.fieldId);
      if (ff) {
        return { ...ff };
      }
      return m;
    });
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
      this.mediaPageIndex = 1;
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
    this.saveSearchInfo.mediaPageSize = this.mediaPageSize;
    this.saveSearchInfo.mediaPageIndex = this.mediaPageIndex;
    this.saveSearchInfo.fieldListForSearch = this.fieldListForSearch;
    this.searchListStr = base64encoder(JSON.stringify(this.saveSearchInfo));
    //#region

    // 获取过滤
    let searchFilter = this.commonService.getSearchFilter(this.fieldListForSearch);
    if (this.from === 'option') {
      searchFilter = [...searchFilter, { fieldId: this.fromFieldId, val: this.fromOptionId }];
    } else if (this.from === 'batchImport') {
      searchFilter = [...searchFilter, { id: -2, fieldType: 1, fieldName: 'batchNumber', val: this.fromBatchNumber }];
    }

    let page: any;
    if (this.showType === 'media') {
      page = { limit: this.mediaPageSize, page: this.mediaPageIndex, sort: '' };
    } else {
      page = { limit: this.pageSize, page: this.pageIndex, sort: '' };
    }

    if (this.sortKey) {
      page.sort = this.sortKey + ' ' + this.sortValue;
    }

    const res: any = await new Promise((resolve, reject) => {
      this.crudService
        .search(environment.baseUrl + 'api', 'zhanghao-data', {
          s: JSON.stringify(searchFilter),
          page: JSON.stringify(page),
          other: JSON.stringify({
            postId: this.postId,
            adminFlag: this.adminFlag,
            shareFlag: this.shareFlag,
            attachmentFlag: this.attachmentFlag,
            extensionNames: this.extensionNameValue,
          }),
        })
        .subscribe((res1: any) => {
          resolve(res1);
        });
    });
    return res;
  }

  async waitSearch(parent: any) {
    await parent.init();
  }

  deleteRec(recUuid: string) {
    if (recUuid) {
      this.modalService.confirm({
        nzTitle: '删除数据',
        nzContent: '<b style="color: red;">确定删除此数据吗？</b>',
        nzOkType: 'danger',
        nzOnOk: async () => {
          this.crudService.del(environment.baseUrl + 'api', 'zhanghao-data', recUuid).subscribe((res) => {
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
  }

  async deleteZhanghaoList() {
    this.loading = true;
    const ids = [];
    const selectedList = this.listOfAllData.filter((f) => this.mapOfCheckedId[f.recUuid]);

    for (const item of selectedList) {
      ids.push(item.recUuid);
    }

    if (ids.length === 0) {
      this.loading = false;
      this.msg.create('info', '请选择删除的数据');
      return;
    } else {
      this.modalService.confirm({
        nzTitle: '删除数据',
        nzContent: '<b style="color: red;">确定删除这些数据吗？',
        nzOkType: 'danger',
        nzOnOk: async () => {
          this.crudService
            .add(environment.baseUrl + 'api', 'zhanghao-data/removeBatch', {
              ids: ids,
              postId: this.postId,
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
  }

  // 重置检索条件
  resetSe() {
    this.extensionNameValue = '';
    this.fieldListForSearch = this.fieldListForSearch.map((m) => {
      m.children = m.children.map((m1) => {
        delete m1.val;
        delete m1.start;
        delete m1.end;
        if (m1.checkItems) {
          m1.checkItems.forEach((it) => (it.checked = false));
        }
        return m1;
      });
      return m;
    });
    this.from = '';
    this.eventId = 0;
    this.fromFieldId = 0;
    this.fromOptionId = 0;
    this.fromFieldType = 0;
    this.fromBatchNumber = '';
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
    this.selectedId = [];
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
            .add(environment.baseUrl + 'api', 'zhanghao-data/updateBatch', {
              ids: ids,
              fieldId: fieldId,
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
    if (fieldInfo && fieldInfo.zhanghaoOptionConfig) {
      return fieldInfo.zhanghaoOptionConfig.id;
    }
    return null;
  }

  getFieldTypeByFieldId(fieldId: any) {
    const fieldInfo = this.fieldList.find((f) => f.id === fieldId);
    return fieldInfo.fieldType;
  }

  /**
   * 分享
   */
  share() {
    if (this.otherPostValues.length === 0) {
      this.msg.create('info', '请选择要分享的岗位！');
      return;
    }

    this.loading = true;

    const ids = [];
    const selectedList = this.listOfAllData.filter((f) => this.mapOfCheckedId[f.recUuid]);

    for (const item of selectedList) {
      ids.push(item.recUuid);
    }

    if (ids.length === 0) {
      this.loading = false;
      this.msg.create('info', '请选择要分享的账号数据！');
      return;
    } else {
      this.modalService.confirm({
        nzTitle: '批量分享',
        nzContent: '<b style="color: red;">确定分享这些数据吗？</b>',
        nzOkType: 'danger',
        nzOnOk: async () => {
          this.crudService
            .add(environment.baseUrl + 'api', 'zhanghao-post-data/sharePost', {
              ids: ids,
              sharePosts: this.otherPostValues,
              postId: this.postId,
            })
            .subscribe((res) => {
              this.loading = false;
              this.msg.create('success', `分享成功`);
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

  shareBatch() {
    if (this.otherPostValues.length === 0) {
      this.msg.create('info', '请选择要分享的岗位！');
      return;
    }

    this.modalService.confirm({
      nzTitle: '批量分享',
      nzContent: '<b style="color: red;">确定分享本批次数据吗？</b>',
      nzOkType: 'danger',
      nzOnOk: async () => {
        this.crudService
          .add(environment.baseUrl + 'api', 'zhanghao-post-data/sharePost', {
            batchNumber: this.fromBatchNumber,
            sharePosts: this.otherPostValues,
            postId: this.postId,
          })
          .subscribe((res) => {
            this.loading = false;
            this.msg.create('success', `分享成功`);
            this.search();
          });
      },
      nzOnCancel: () => {
        this.loading = false;
        console.log('Cancel');
      },
    });
  }
  onChanges(values: any): void {
    console.log(values, this.signValues);
  }

  getEmitterUpdateDetail($event) {}

  async callPage(parent: any) {
    // await parent.ngOnInit();
    //  子窗口回调，翻页功能
  }

  cancelShareZhanghaoList() {
    this.loading = true;
    const ids = [];
    const selectedList = this.listOfAllData.filter((f) => this.mapOfCheckedId[f.recUuid]);

    for (const item of selectedList) {
      ids.push(item.recUuid);
    }

    if (ids.length === 0) {
      this.loading = false;
      this.msg.create('info', '请选择取消分享的数据');
      return;
    } else {
      this.modalService.confirm({
        nzTitle: '取消分享',
        nzContent: '<b style="color: red;">确定取消分享这些数据吗？</b>',
        nzOkType: 'danger',
        nzOnOk: async () => {
          this.crudService
            .add(environment.baseUrl + 'api', 'zhanghao-data/cancelShare', {
              ids: ids,
              postId: this.postId,
            })
            .subscribe((res) => {
              this.loading = false;
              this.msg.create('success', `已取消分享`);
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

  // /* 获取排序规则 */
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

  showModal(uuid: any, showPreviousAndNestFlag) {
    this.modalUpdateDetailComponent.showModal(uuid, showPreviousAndNestFlag);
  }

  showModalView(uuid: any, showPreviousAndNestFlag) {
    this.modalViewDetailComponent.showModal(uuid, showPreviousAndNestFlag);
  }

  async download(attachmentId: any, fileName, ext: any) {
    await this.fileDownloadService.download(fileName, ext, `api/zhanghao-attachment/download/${attachmentId}`, {});
  }

  tabTo(tab: any) {
    this.showType = tab.showType;
    if (this.showType === 'media') {
      this.attachmentFlag = 1;
    } else {
      this.attachmentFlag = 0;
    }
    this.search();
  }

  imgClick(item: any) {
    if (this.fileType.pdf.indexOf(item?.extensionName) >= 0) {
      console.log(item);
      this.modalViewPdfComponent.showModal(item);
    }
  }

  extensionNameSearch() {
    this.search();
  }

  backFrom($event) {
    history.go(-1);
  }
}
interface ItemData {
  recUuid: number;
  name: string;
}

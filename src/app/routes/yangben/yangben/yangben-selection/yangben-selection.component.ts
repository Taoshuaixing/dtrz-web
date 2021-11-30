import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild } from '@angular/core';
import { CrudService } from '../../../crud.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ExcelDownloadService } from '../../../excelDownload.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { DatePipe } from '@angular/common';
import { environment } from '@env/environment';
import { YangbenService } from '../../yangben.service';
import { base64decoder, base64encoder } from '@shared/utils/base64';
import { ACLService } from '@delon/acl';
import { SettingsService } from '@delon/theme';
import { fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { NzModalViewDetailComponent } from '../yangben-data/nz-modal-view-detail/nz-modal-view-detail.component';
import { YangbenSimilarListComponent } from '../yangben-data/yangben-similar-list/yangben-similar-list.component';
import { FileDownloadService } from '../../../fileDownload.service';
import { CommonService } from '@shared/service/common-service';

@Component({
  selector: 'app-yangben-selection',
  templateUrl: './yangben-selection.component.html',
  styleUrls: ['./yangben-selection.component.css'],
})
export class YangbenSelectionComponent implements OnInit, AfterViewInit, OnDestroy {
  constructor(
    private crudService: CrudService,
    private router: Router,
    private excelService: ExcelDownloadService,
    public msg: NzMessageService,
    private activedrouted: ActivatedRoute,
    private datePipe: DatePipe,
    public yangbenService: YangbenService,
    private modalService: NzModalService,
    private aclService: ACLService,
    private settingService: SettingsService,
    public commonService: CommonService,
    private fileDownloadService: FileDownloadService,
  ) {}

  listOfAllData = [];
  fieldList = [];
  fieldListForSearch = [];
  fieldListForList: any = [];
  loading = false;
  dateFormat = 'yyyy/MM/dd';

  @ViewChild('viewDrawer', { static: true })
  modalViewDetailComponent: NzModalViewDetailComponent;

  @ViewChild('similarDrawer', { static: true })
  similarListComponent: YangbenSimilarListComponent;

  sortValue = '';
  sortKey = '';

  saveSearchInfo = {
    pageSize: 10,
    pageIndex: 0,
    mediaPageIndex: 0,
    mediaPageSize: 10,
    fieldListForSearch: {},
  };

  pageIndex = 1;
  pageSize = 50;
  mediaPageIndex = 1;
  mediaPageSize = 24;
  total = 0;
  searchListStr = '';

  expandForm = false;
  tableWidth = 2000;
  highLightFlag = false;

  isAllDisplayDataChecked = false;
  isIndeterminate = false;
  listOfDisplayData: ItemData[] = [];
  mapOfCheckedId: { [key: string]: boolean } = {};
  selectedId = [];

  // 用户角色
  userRoles = [];

  OPT_SHARE_NONE = 0;
  OPT_SHARE_OTHER = 1;
  OPT_SHARE_ME = 2;
  // 分享类别
  shareFlag: number = this.OPT_SHARE_ME;

  // 岗位ID
  postId = 0;
  postList = [];
  otherPostList = [];
  selectFlag = '';

  content_width = 1550;
  offset_width = 370;
  timer: any;
  autoRefresh = false;
  timeName = '共享时间';

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
  imgsrc = environment.baseUrl + 'api/yangben-attachment/download/';
  extensionNameValue: any = '';
  fileType: any = {};
  fileTypeArr = [];

  from = '';
  eventId = 0;
  fromFieldId = 0;
  fromOptionId = 0;
  fromFieldType = 0;

  async ngAfterViewInit(): Promise<void> {
    fromEvent(window, 'resize')
      .pipe(debounceTime(200))
      .subscribe((event) => {
        // 这里处理页面变化时的操作
        this.changeSize();
      });

    // this.timer= setInterval(()=>{
    //   if (this.autoRefresh) {
    //     this.search();
    //   }

    // },5000)
  }

  ngOnDestroy() {
    // if (this.timer) {
    //   clearInterval(this.timer);
    // }
  }

  changeSize() {
    this.content_width = document.querySelector('body').clientWidth - this.offset_width;
  }

  async ngOnInit() {
    this.changeSize();
    const fileTypeInfo = this.commonService.getFileType();
    this.fileType = fileTypeInfo.fileType;
    this.fileTypeArr = fileTypeInfo.fileTypeArr;

    this.userRoles = this.aclService.data.roles;
    this.postId = this.settingService.user.posts[0].id;

    this.activedrouted.queryParams.subscribe(async (params) => {
      if (params) {
        this.selectFlag = params.selectFlag;
        this.searchListStr = params.searchListStr;
        this.timeName = this.selectFlag === 'selected' ? '选用时间' : '共享时间';

        this.from = params.from;
        this.eventId = params.eventId;
        this.fromFieldId = params.fieldId;
        this.fromOptionId = params.optionId;
        this.fromFieldType = params.fieldType;

        await this.init();
      }
    });
  }

  async init() {
    this.mapOfCheckedId = {};
    this.selectedId = [];
    await this.getOtherPost();
    await this.refreshField();

    const detailSearchStr = this.searchListStr;
    // 如果检索条件不为空（详情页返回）,设置页面检索条件及状态
    if (detailSearchStr) {
      const detailSearchObj = JSON.parse(base64decoder(detailSearchStr));
      this.setSearch(detailSearchObj);
      this.search(false);
    } else {
      this.search(true);
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
        .search(environment.baseUrl + 'api', 'yangben-field-define', {
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
          if (m.yangbenOptionConfig) {
            const data = await this.yangbenService.getTableData(m.yangbenOptionConfig.id);
            return { ...m, targetTableData: data };
          } else {
            return m;
          }
        })();
      }),
    );
    // console.log("this.fieldList",this.fieldList)
    const colCnt = 3;
    let tmpSearchItem: any = [];
    tmpSearchItem = await this.getSearchItem();

    // 默认时间
    let dateRange = this.commonService.getOneDay19();
    if (this.from) {
      dateRange = [];
    }

    tmpSearchItem = [
      {
        id: -1,
        fieldType: 3,
        showTime: true,
        fieldName: this.timeName,
        name: 'shareUpdatedTime',
        exp: 'between',
        val: dateRange,
        others: { postId: this.postId, selectFlag: this.selectFlag === 'selected' ? 1 : 0 },
      },
      {
        id: -2,
        fieldType: 5,
        fieldName: '岗位来源',
        name: 'postId',
        targetTableData: this.postList.map((m) => {
          return { ...m, name: m.postName };
        }),
      },
      ...tmpSearchItem,
    ];

    const rowCnt = Number(tmpSearchItem.length / colCnt);

    this.fieldListForSearch = [];
    for (let r = 0; r < rowCnt; r++) {
      this.fieldListForSearch.push({ children: tmpSearchItem.slice(r * colCnt, (r + 1) * colCnt) });
    }
    // console.log(this.fieldListForSearch)

    if (this.userRoles.indexOf('dagl_admin') >= 0) {
      this.fieldListForList = this.fieldList.filter((f) => f.showFlag === 1);
    } else {
      this.fieldListForList = await this.getShowItem();
    }
    if (this.fieldListForList.length === 0) {
      this.msg.create('info', '请先设置显示字段');
      return;
    }

    this.tableWidth = this.commonService.setColWidth(this.fieldListForList, this.content_width, 'content', 480);
  }

  async getSearchItem() {
    const checkedList: any = await this.yangbenService.getSearchCheckedField(
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
    const checkedList: any = await this.yangbenService.getShowCheckedField(
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
    // if(!this.sortKey) {
    // this.sortKey = "shareUpdatedTime";
    // this.sortValue = "desc";
    // }

    if (this.from === 'event') {
      console.log(this.fieldList);
      const findField = this.fieldList.find(
        (f) => f.yangbenOptionConfig && f.yangbenOptionConfig.targetTable === 'yangben_event_rec',
      );
      if (findField) {
        searchFilter = [...searchFilter, { fieldId: findField.id, val: this.eventId, exp: '=' }];
      } else {
        console.log('未找到相应的事件字段');
      }
    } else if (this.from === 'option') {
      searchFilter = [...searchFilter, { fieldId: this.fromFieldId, val: this.fromOptionId }];
    }

    let sort = '';
    if (this.sortKey) {
      sort = `${this.sortKey} ${this.sortValue}`;
    }

    let page: any;
    if (this.showType === 'media') {
      page = { limit: this.mediaPageSize, page: this.mediaPageIndex, sort: sort };
    } else {
      page = { limit: this.pageSize, page: this.pageIndex, sort: sort };
    }

    const res: any = await new Promise((resolve, reject) => {
      this.crudService
        .search(environment.baseUrl + 'api', 'yangben-data', {
          s: JSON.stringify(searchFilter),
          page: JSON.stringify(page),
          other: JSON.stringify({
            postId: this.postId,
            adminFlag: this.userRoles.indexOf('dagl_admin') >= 0 ? 1 : 0,
            shareFlag: this.shareFlag,
            selectFlag: this.selectFlag === 'selected' ? 1 : 0,
            attachmentFlag: this.attachmentFlag,
            extensionNames: this.extensionNameValue,
            isWenziPost: 1,
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

  // 重置检索条件
  resetSe() {
    this.extensionNameValue = '';
    this.fieldListForSearch = this.fieldListForSearch.map((m) => {
      m.children = m.children.map((m1) => {
        delete m1.val;
        delete m1.start;
        delete m1.end;
        return m1;
      });
      return m;
    });
    this.search();
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

  /**
   * 选用
   */
  selection(isSelect) {
    let txt = '';
    if (!isSelect) {
      txt = '取消';
    }

    this.loading = true;

    const ids = [];
    const selectedList = this.listOfAllData.filter((f) => this.mapOfCheckedId[f.recUuid]);

    for (const item of selectedList) {
      ids.push(item.recUuid);
    }

    if (ids.length === 0) {
      this.loading = false;
      this.msg.create('info', `请选择要${txt}选用的样本数据!`);
      return;
    } else {
      this.modalService.confirm({
        nzTitle: `批量${txt}选用`,
        nzContent: `<b style="color: red;">确定${txt}选用这些数据吗？</b>`,
        nzOkType: 'danger',
        nzOnOk: async () => {
          this.crudService
            .add(environment.baseUrl + 'api', 'yangben-post-data/selection', {
              ids: ids,
              postId: this.postId,
              selectFlag: isSelect ? 1 : 0,
            })
            .subscribe((res) => {
              this.loading = false;
              this.msg.create('success', `${txt}选用成功`);

              this.mapOfCheckedId = {};
              this.selectedId = [];
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
    this.otherPostList = this.postList.filter((f) => f.id !== this.postId);
  }

  getEmitterUpdateDetail($event) {}

  async callPage(parent: any) {
    // await parent.ngOnInit();
    //  子窗口回调，翻页功能
  }

  showModalView(uuid: any, showPreviousAndNestFlag: number) {
    this.modalViewDetailComponent.showModal(uuid, showPreviousAndNestFlag);
  }

  showModalSimilar(uuid: any, similarCnt: any) {
    this.similarListComponent.showModal(uuid, similarCnt, 1);
  }

  async download(attachmentId: any, fileName, ext: any) {
    await this.fileDownloadService.download(fileName, ext, `api/yangben-attachment/download/${attachmentId}`, {});
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

  imgClick(item: any) {}

  extensionNameSearch() {
    this.search();
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

  backFrom($event) {
    history.go(-1);
  }

  callbackEmitter(isSelection: any) {
    if (isSelection) {
      const ids = [];
      const selectedList = this.listOfAllData.filter((f) => this.mapOfCheckedId[f.recUuid]);

      for (const item of selectedList) {
        ids.push(item.recUuid);
      }

      this.crudService
        .add(environment.baseUrl + 'api', 'yangben-post-data/selection', {
          ids: ids,
          postId: this.postId,
          selectFlag: 1,
        })
        .subscribe((res) => {
          this.loading = false;
          this.msg.create('success', `样本导出并选用成功`);

          this.mapOfCheckedId = {};
          this.selectedId = [];
          this.search();
          // console.log("selected");
        });
    }
  }
}

interface ItemData {
  recUuid: number;
  name: string;
}

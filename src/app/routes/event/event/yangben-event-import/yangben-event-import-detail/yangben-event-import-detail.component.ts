import {Component, OnInit} from '@angular/core';
import {CrudService} from "../../../../crud.service";
import {ActivatedRoute, Router} from "@angular/router";
import {ExcelDownloadService} from "../../../../excelDownload.service";
import {NzMessageService} from "ng-zorro-antd/message";
import {DatePipe} from "@angular/common";
import {YangbenService} from "../../../../yangben/yangben.service";
import {NzModalService} from "ng-zorro-antd/modal";
import {environment} from "@env/environment";

@Component({
  selector: 'app-yangben-event-import-detail',
  templateUrl: './yangben-event-import-detail.component.html',
  styles: []
})
export class YangbenEventImportDetailComponent implements OnInit {

  constructor(
    private crudService: CrudService,
    private router: Router,
    private excelService: ExcelDownloadService,
    public msg: NzMessageService,
    private activedrouted: ActivatedRoute,
    private datePipe: DatePipe,
    private yangbenService: YangbenService,
    private modalService: NzModalService,
  ) {
  }

  breadcrumbs = [{name: '首页'}, {name: '事件导入结果详情 '}];

  listOfAllData = [];
  fieldListForList = [];
  fieldList = [];
  loading = false;
  fieldListForSearch = [];
  pageIndex = 1;
  pageSize = 10;
  total = 0;
  tableWidth = 3000;
  importLogId;
  importResult = {
    totalCnt: 0,
    successCnt: 0,
    sameCnt: 0,
    similarCnt: 0,
    errorCnt: 0,
    importCnt: 0,
    batchNumber: '',
  };

  postId = 0;
  searchloading = false;

  async ngOnInit() {
    this.activedrouted.queryParams.subscribe(params => {
      this.importLogId = params.importLogId;
      if (params.postId) {
        this.postId = Number(params.postId);
      }

    });
    await this.searchImportResult();
    await this.refreshField();
    await this.search();

  }

  async refreshField() {
    this.fieldList = [];

    const fieldDefineList: any = await new Promise((resolve, reject) => {
      this.crudService
        .search(environment.baseUrl + 'api', 'yangben-field-define', {sort: [`id,ASC`]})
        .subscribe((res_1: any[]) => {
          resolve(res_1)
        });
    });

    this.fieldList = await new Promise((resolve, reject) => {
      this.crudService
        .search(environment.baseUrl + 'api', 'yangben-post-field', {
          sort: [`id,ASC`]
          , filter: [
            `postId||$eq||${this.postId}`,
            `shareFlag||$eq|| 0}`
          ]
        })
        .subscribe(async (res: any[]) => {

          res = res.map(m => {
            const ff = fieldDefineList.find(f => f.id === m.fieldId);
            let fieldName = "";
            if (ff) {
              fieldName = ff.fieldName;
            }
            return {...m, fieldName: fieldName, checked: m.impFlag === 1 ? true : false};
          });

          resolve(res);
        });
    });

    this.fieldList = await Promise.all(
      this.fieldList.map(async m => {
        return (async () => {
          if (m.targetTable) {
            const data = await this.yangbenService.getTableData(m.targetTable.name);
            return {...m, targetTableData: data};
          } else {
            return m;
          }
        })();
      }),
    );
    const colCnt = 3;
    const tmpSearchItem = this.fieldList.filter(f => f.searchItemFlag === 1);
    const rowCnt = Number((tmpSearchItem.length / colCnt));

    this.fieldListForSearch = [];
    for (let r = 0; r < rowCnt; r++) {
      this.fieldListForSearch.push({children: tmpSearchItem.slice(r * colCnt, (r + 1) * colCnt)});
    }

    this.fieldListForList = this.fieldList.filter(f => f.showFlag === 1);
    this.tableWidth = 0;
    this.fieldListForList = this.fieldListForList.map(m => {
      let width = 120;
      if (m.fieldType === 3) {
        width = 150;
      }
      this.tableWidth += width;
      return {...m, width: width};
    });
    this.tableWidth = this.tableWidth + 1000;
  }

  async search() {
    this.searchloading = true;
    const searchFilter = [];
    const page = {limit: this.pageSize, page: this.pageIndex};

    this.listOfAllData = await new Promise((resolve, reject) => {
      this.crudService
        .search(environment.baseUrl + 'api', 'yangben-event-tmp', {
          s: JSON.stringify(searchFilter),
          importLogId: this.importLogId,
          page: JSON.stringify(page),
          other: JSON.stringify({
            postId: this.postId,
            adminFlag: 0,
            shareFlag: 0,
          }),
        })
        .subscribe((res: any) => {
          this.searchloading = false;
          this.total = res.total;
          resolve(res.data);
        });
    });

    console.log('yangben-event-tmp', this.listOfAllData);
  }

  currentPageDataChange($event: any[]) {
  }


  back() {
    this.router.navigate(['/event/yangben-event-import']);
  }

  async searchImportResult() {
    this.crudService.get(environment.baseUrl + 'api', 'yangben-event-import-result', this.importLogId)
      .subscribe(async (res: any) => {
        this.importResult = res;
      });
  }

  fmtError(msg: string) {
    if (msg) {
      msg = msg.replace("\r\n", "</br>");
    }
    return msg;

  }


}


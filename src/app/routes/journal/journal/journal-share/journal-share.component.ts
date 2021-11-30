import { Component, OnInit } from '@angular/core';
import {CrudService} from "../../../crud.service";
import {NzModalService} from "ng-zorro-antd/modal";
import {ActivatedRoute, Router} from "@angular/router";
import {DatePipe} from "@angular/common";
import {SettingsService} from "@delon/theme";
import {FileDownloadService} from "../../../fileDownload.service";
import {NzMessageService} from "ng-zorro-antd/message";
import {CommonService} from "@shared/service/common-service";
import differenceInCalendarDays from 'date-fns/differenceInCalendarDays';
import {environment} from "@env/environment";
import {JournalService} from "../../journal.service";

@Component({
  selector: 'app-journal-share',
  templateUrl: './journal-share.component.html',
  styles: [
  ]
})
export class JournalShareComponent implements OnInit {

  constructor( private crudService: CrudService,
               private modalService: NzModalService,
               private router: Router,
               private datePipe: DatePipe,
               private activedrouted: ActivatedRoute,
               private settingService: SettingsService,
               private fileDownloadService: FileDownloadService,
               public msg: NzMessageService,
               private commonService:CommonService,
               public journalService:JournalService) { }

  listOfAllData = [];
  total = 0;
  pageIndex = 1;
  pageSize = 10;
  loading: any;

  isAllDisplayDataChecked = false;
  isIndeterminate = false;
  listOfDisplayData: ItemData[] = [];
  mapOfCheckedId: { [key: string]: boolean } = {};
  checkIds = [];
  postId:any;

  searchJournalName: any;
  templateId: any;
  templateList = [];
  dutyOptions =[
    { label: '白班', value: 0, checked: false },
    { label: '夜班', value: 1, checked: false },
  ];
  disabledDate:any;
  dateRange: any;
  dateFormat = 'yyyy/MM/dd';
  startTime;
  endTime;

  OPT_SHARE_OTHER = 1;
  OPT_SHARE_ME = 2;

  postList = [];
  shareFlag: number;
  searchPostId: any;

  async ngOnInit(){
    this.postList = await this.journalService.getOtherPost();

    this.activedrouted.queryParams.subscribe(async (params) => {
      this.pageIndex = 1;
      this.shareFlag = Number(params.shareFlag);

      this.disabledDate = (current: Date): boolean => {
        return differenceInCalendarDays(current,new Date()) > 0;
      };
      this.mapOfCheckedId = {};
      this.listOfDisplayData = [];
      this.checkIds = [];
      this.postId = this.settingService.user.posts[0].id;

      await this.getTemplateList();
      this.getData();
    });
  }


  async getTemplateList(){
    this.templateList = [];
    const filter = [`status||$eq||1`,`postId||$eq||${this.postId}`,`deleteFlag||$eq||0`];
    this.templateList = await new Promise((resolve, reject) => {
      this.crudService
        .search(environment.baseUrl + 'api', 'journal-config-template',{
          filter: filter,
        })
        .subscribe((res: any[]) => {
          resolve(res);
        });
    });
  }

  getData(){
    const filter =[];
    const jion =[`journal`];
    if(this.shareFlag === 1){
      filter.push(`originPostId||$eq||${this.postId}`);
    }else if (this.shareFlag === 2){
      filter.push(`postId||$eq||${this.postId}`);
    }

    if(this.searchPostId > 0 ){
      if(this.shareFlag === 1){
        filter.push(`postId||$eq||${this.searchPostId}`);
      }else if (this.shareFlag === 2){
        filter.push(`originPostId||$eq||${this.searchPostId}`);
      }
    }

    if (this.searchJournalName) {
      filter.push(`journal.journalName||$cont||${this.searchJournalName.trim()}`);
    }

    const options = this.dutyOptions.filter(f=>f.checked === true);
    if(options.length === 1){
      if(options[0].value === 0){
        filter.push(`journal.template.duty||$eq||m`);
      }else if(options[0].value === 1){
        filter.push(`journal.template.duty||$eq||n`);
      }
    }

    if(this.templateId > 0){
      filter.push(`journal.template.id||$eq||${this.templateId}`);
    }

    if(this.startTime && this.endTime){
      filter.push(`createdTime||$between||${this.startTime},${this.endTime}`);
    }

    this.crudService.search(environment.baseUrl + 'api', 'journal-post-data',{
      filter:filter,
      sort:["id,DESC"]
    }).subscribe((res: any[]) => {
      this.total = res.length;
      this.listOfAllData = res.map(m => {
        const content =[];
        if(m.journal.template.configTemplateDetails.length > 0){
          m.journal.template.configTemplateDetails.map(m=>{
            content.push(m.contentTitle);
          })
        }

        const sharePostName = this.postList.find(f=>f.id === m.postId).postName;
        const originPostName = this.postList.find(f=>f.id === m.originPostId).postName;

        return { ...m,content:content.join("、"),sharePostName:sharePostName,originPostName:originPostName};
      });
      console.log('journal-post-data',this.listOfAllData);
    });
  }

  checkAll(value: boolean): void {
    this.listOfDisplayData.forEach((item) => (this.mapOfCheckedId[item.id] = value));
    this.refreshStatus();
  }

  currentPageDataChange($event: ItemData[]): void {
    this.listOfDisplayData = $event;
    this.refreshStatus();
  }

  refreshStatus(): void {
    this.checkIds = [];
    this.isAllDisplayDataChecked = this.listOfDisplayData.every((item) => this.mapOfCheckedId[item.id]);
    this.isIndeterminate =this.listOfDisplayData.some((item) => this.mapOfCheckedId[item.id]) && !this.isAllDisplayDataChecked;

    const selectedList = this.listOfAllData.filter((f) => this.mapOfCheckedId[f.id]);

    for (const item of selectedList) {
      this.checkIds.push(item.id);
    }
  }

  edit(data: any) {
    this.router.navigate(['/journal/journal-finish'], {
      queryParams: {
        fromBy:'journal-share',
        journalId: data.journal.id,
        shareFlag: this.shareFlag,
      },
    });
  }

  downLoadWord() {
    if (this.checkIds.length === 0) {
      this.msg.create('info', '请选择Word下载数据！');
      this.loading = false;
      return;
    }

    const ids =[];
    this.checkIds.map(m=>{
      const data = this.listOfAllData.find(f=>f.id === m);
      ids.push(data.journal.id);
    });

    this.fileDownloadService.download(
      '日志_' + this.datePipe.transform(new Date(), 'yyyyMMdd'),
      'zip',
      'api/' + 'journal-data/downloadToDoc',
      {
        filter: [`id||$in||${ids.join(',')}`],
      },
    );
  }


  onChange($event: any) {
  }

  dateRangeOnChange($event: any) {
    const range = this.commonService.getDateRange(this.dateRange,true);
    this.startTime = range.start;
    this.endTime = range.end;
    this.getData();
  }


  resetSe() {
    this.searchJournalName ='';
    this.templateId = null;
    this.searchPostId = null;
    this.startTime = null;
    this.endTime = null;
    this.dateRange =[];
    this.dutyOptions.map((it) => {
      it.checked = false;
      return it;
    });
    this.getData();
  }


  cancelShareList() {
    this.loading = true;

    if (this.checkIds.length === 0) {
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
            .add(environment.baseUrl + 'api', 'journal-post-data/cancelShare', {
              ids: this.checkIds
            })
            .subscribe((res) => {
              this.loading = false;
              this.msg.create('success', `已取消分享`);
              this.getData();
            });
        },
        nzOnCancel: () => {
          this.loading = false;
          console.log('Cancel');
        },
      });
    }
  }
}

interface ItemData {
  id: number;
  journalName: string;
}

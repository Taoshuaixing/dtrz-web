import {Component, OnInit, ViewChild} from '@angular/core';
import {recentDay} from "@shared/utils/date-util";
import {DatePipe} from "@angular/common";
import {NzFormatEmitEvent, NzTreeNode} from "ng-zorro-antd/tree";
import {environment} from "@env/environment";
import {CrudService} from "../../../crud.service";
import {YangbenService} from "../../../yangben/yangben.service";
import {NzMessageService} from "ng-zorro-antd/message";
import {NzModalService} from "ng-zorro-antd/modal";
import {ExcelDownloadService} from "../../../excelDownload.service";
import {NzModalKeywordEditComponent} from "./nz-modal-keyword-edit/nz-modal-keyword-edit.component";
import {CommonService} from "@shared/service/common-service";

@Component({
  selector: 'app-keyword-list',
  templateUrl: './keyword-list.component.html',
  styleUrls: ['./keyword-list.component.css'],
})
export class KeywordListComponent implements OnInit {

  constructor( private crudService: CrudService,
               private datePipe: DatePipe,
               public msg: NzMessageService,
               private excelService: ExcelDownloadService,
               private modalService: NzModalService,
               private commonService:CommonService) { }

  @ViewChild('editDrawer', { static: true })
  nzModalKeywordEditComponent: NzModalKeywordEditComponent;

  showType = 'rule';
  tabs: any[] = [
    {
      active: true,
      name: '规则展示',
      icon: 'unordered-list',
      showType: 'rule',
    },
    {
      active: false,
      name: '列表展示',
      icon: 'ordered-list',
      showType: 'list',
    },
  ];

  controlType: any;
  controlTypeList= [
    {id:1,name:'审核'},
    {id:2,name:'禁发'},
    {id:3,name:'屏蔽'},
    {id:4,name:'组合禁发'},
    {id:5,name:'单词禁发'}
    ];

  userId?: number;
  userList = [];

  checkOptions = [
    { label: '已过期', value: 0, checked: false },
    { label: '未过期', value: 1, checked: false },
  ];


  listOfAllData = [];
  ruleOfAllData = [];
  loading = false;
  tableWidth = 1600;


  isAllDisplayDataChecked = false;
  isIndeterminate = false;
  listOfDisplayData: ItemData[] = [];
  mapOfCheckedId: { [key: number]: boolean } = {};
  sortValue: string | null = null;
  sortKey: string | null = null;



  dateRange: any;
  dateFormat = 'yyyy/MM/dd';
  nzButtonValue: any;
  startTime;
  endTime;
  checkIds = [];

  searchKeyword ='';
  themesSearchValue: any;
  themesNodes =[];
  instructSearchValue: any;
  instructNodes = [];
  themesActivated=[];
  instructActivated =[];
  themesActivatedNode?: NzTreeNode;
  searchThemes=[];
  instructActivatedNode?: NzTreeNode;

  instructSearchList = {
    limit: 1000,
    page: 1,
    filter: [],
    join:[],
    sort: ['id,DESC']
  };

  ruleSearchList = {
    limit: 50,
    page: 1,
    total: 0,
    filter: [],
    join:[],
    sort: ['id,DESC']
  };

  listSearchList = {
    limit: 50,
    page: 1,
    total: 0,
    filter: [],
    join:[],
    sort: ['id,DESC']
  };


  async ngOnInit(){
    this.loading = true;
    this.mapOfCheckedId = {};
    this.listOfDisplayData = [];
    this.checkIds = [];

    this.nzButtonValue = 'day3';
    this.dateRange = recentDay(3);
    const range = this.commonService.getDateRange(this.dateRange,true);

    this.startTime = range.start;
    this.endTime = range.end;

    await this.getThemesNodes();
    await this.getInstructNodes();
    await this.getUserList();
    await this.search();

  }

  async getUserList(){
    return new Promise((resolve, reject) => {
      this.crudService.search(environment.baseUrl_zxtj + 'api', 'user',{
        filter: [`deleteFlag||$eq||0`],
      })
        .subscribe(async (res: any) => {
          this.userList = res.map(m=> {
            return {id:m.id, name: m.realName ? m.realName : m.userName};
          });
          resolve(res)
        });
    });
  }

  tabTo(tab: any) {
    this.loading = true;
    this.mapOfCheckedId = {};
    this.listOfDisplayData = [];
    this.checkIds = [];

    this.showType = tab.showType;

    if('rule'===this.showType){
      this.search();
    }else if('list'===this.showType){
      this.searchList();
    }
  }

  async search(reset: boolean = false) {

    this.ruleSearchList.filter = [];

    if (this.searchKeyword) {
    this.ruleSearchList.filter.push(`keywordArr||$cont||${this.searchKeyword.trim()}`);
    }

    if (this.userId) {
      this.ruleSearchList.filter.push(`editUserId||$eq||${this.userId}`);
    }

    if(this.controlType){
      this.ruleSearchList.filter.push(`controlType||$eq||${this.controlType}`);
    }

    if(this.searchThemes &&this.searchThemes.length > 0){
      this.ruleSearchList.filter.push(`keywordTopic.id||$in||${this.searchThemes.join(',')}`);
      this.ruleSearchList.join = ['keywordTopic'];
    }

    if(this.instructActivatedNode){
      this.ruleSearchList.filter.push(`ruleCommand.id||$eq||${this.instructActivatedNode.key}`);
      this.ruleSearchList.join = ['ruleCommand'];
    }

    if(this.startTime &&　this.endTime){
      this.ruleSearchList.filter.push(`createTime||$between||${this.startTime},${this.endTime}`);
    }

    const options = this.checkOptions.filter(f=>f.checked === true);
    if(options.length === 1){
      if(options[0].value === 0){
        this.ruleSearchList.filter.push(`controlEndDate||$lt||${this.datePipe.transform(new Date(), 'yyyy-MM-dd HH:mm:ss')}`);
      }else if(options[0].value === 1){
        this.ruleSearchList.filter.push(`controlEndDate||$gt||${this.datePipe.transform(new Date(), 'yyyy-MM-dd HH:mm:ss')}`);
      }
    }

    this.crudService
      .search(environment.baseUrl + 'api', 'rule',this.ruleSearchList)
      .subscribe((res: any) => {
        // console.log("rule",res);
        this.ruleOfAllData = res.data.map(m=>{
          if(m.keywordTopic){
            m.themesName = m.keywordTopic.name;
          }
          if(m.ruleCommand){
            m.instructName = m.ruleCommand.name;
          }
          if(m.editUserId){
            const user = this.userList.find(f=>f.id === m.editUserId);
            if(user){
              m.createUserName = user.name;
            }
          }
          return m;
        });
        this.ruleOfAllData = res.data;
        this.ruleSearchList.total = res.total;
      });

    this.loading = false;
  }

  async searchList(reset: boolean = false) {
    this.listSearchList.filter = [];

    if (this.searchKeyword) {
      this.listSearchList.filter.push(`word||$cont||${this.searchKeyword.trim()}`);
    }

    if (this.userId) {
      this.listSearchList.filter.push(`rule.editUserId||$eq||${this.userId}`);
      this.listSearchList.join = ['rule'];
    }

    if(this.controlType){
      this.listSearchList.filter.push(`rule.controlType||$eq||${this.controlType}`);
      this.listSearchList.join = ['rule'];
    }

    if(this.searchThemes &&this.searchThemes.length > 0){
      this.listSearchList.filter.push(`keywordTopic.id||$in||${this.searchThemes.join(',')}`);
      this.listSearchList.join = ['keywordTopic'];
    }

    if(this.instructActivatedNode){
      this.listSearchList.filter.push(`rule.ruleCommand.id||$eq||${this.instructActivatedNode.key}`);
      this.listSearchList.join = ['rule.ruleCommand'];
    }

    if(this.startTime &&　this.endTime){
      this.listSearchList.filter.push(`rule.createTime||$between||${this.startTime},${this.endTime}`);
      this.listSearchList.join = ['rule'];
    }

    if (this.sortKey) {
      if (this.sortKey === 'controlBeginDate' || this.sortKey === 'controlEndDate') {
        this.listSearchList.sort = ['rule.' + this.sortKey + ',' + this.sortValue];
        this.listSearchList.join = ['rule'];
      }else {
        this.listSearchList.sort =[this.sortKey + ',' + this.sortValue];
      }
    }else {
      this.listSearchList.sort =['id,DESC'];
    }

    const options = this.checkOptions.filter(f=>f.checked === true);
    if(options.length === 1){
      if(options[0].value === 0){
        this.listSearchList.filter.push(`rule.controlEndDate||$lt||${this.datePipe.transform(new Date(), 'yyyy-MM-dd HH:mm:ss')}`);
        this.listSearchList.join = ['rule'];
      }else if(options[0].value === 1){
        this.listSearchList.filter.push(`rule.controlEndDate||$gt||${this.datePipe.transform(new Date(), 'yyyy-MM-dd HH:mm:ss')}`);
        this.listSearchList.join = ['rule'];
      }
    }

    this.crudService
      .search(environment.baseUrl + 'api', 'keyword',this.listSearchList)
      .subscribe((res: any) => {
        // console.log("keyword",res);
        this.listOfAllData = res.data.map(m=>{

          if(m.rule){
            if(m.rule.editUserId){
              const user = this.userList.find(f=>f.id === m.rule.editUserId);
              if(user){
                m.createUserName = user.name;
              }
            }

            if(this.datePipe.transform(m.rule.controlEndDate, 'yyyy-MM-dd HH:mm:ss') ==='9999-12-31 00:00:00'){
              m.rule.controlEndDate = '永久';
              m.rule.controlBeginDate = null;
            }
          }else{
            m.rule={};
          }

          return m;
        });
        this.listSearchList.total = res.total;
      });

    this.loading = false;
  }

  async getThemesNodes(){
    this.themesNodes = [];
    this.themesNodes = await new Promise((resolve, reject) => {
      this.crudService
        .search(environment.baseUrl + 'api', 'keyword-topic',{
          filter:"parent.id||$isnull",
          join:"parent"
        })
        .subscribe((res: any[]) => {
          // console.log("res",res);
          const vals =[];
          if(res){
            res.map(m=>{
              const leafs = [];
              if(m.children.length > 0){
                m.children.map(it=>{
                  leafs.push({ title: it.name, key: it.id, parentId:m.id,isLeaf: true });
                })
              }
              if(leafs.length>0) {
                vals.push({ title: m.name, key: m.id ,children:leafs});
              } else {
                vals.push({ title: m.name, key: m.id, isLeaf: true});
              }

            })
          }
          resolve(vals);
        });
    });
    // console.log("this.themesNodes",this.themesNodes);
  }


  async getInstructNodes() {
    this.instructSearchList.filter = [];

    if (this.instructSearchValue) {
      this.instructSearchList.page = 1;
      this.instructSearchList.filter.push(`name||$cont||${this.instructSearchValue}`);
    }

    this.instructNodes = [];
    this.instructNodes = await new Promise((resolve, reject) => {
      this.crudService
        .search(environment.baseUrl + 'api', 'rule-command',this.instructSearchList)
        .subscribe((res: any) => {
          console.log("res",res);
          const vals =[];
          if(res.data){
            res.data.map(m=>{
              const leafs = [];
              vals.push({ title: m.name, key: m.id, isLeaf: true});
            })
          }
          resolve(vals);
        });
    });
    // console.log("this.instructNodes",this.instructNodes);
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

    this.searchList();

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
    let selectedList =[];
    if('rule'===this.showType){
      selectedList = this.ruleOfAllData.filter((f) => this.mapOfCheckedId[f.id]);
    }else if('list'===this.showType){
      selectedList = this.listOfAllData.filter((f) => this.mapOfCheckedId[f.id]);
    }

    for (const item of selectedList) {
      this.checkIds.push(item.id);
    }
    // console.log('this.checkIds',this.checkIds);
  }



  delete(id: any) {
    this.modalService.confirm({
      nzTitle: '删除数据',
      nzContent: '<b style="color: red;">确定删除此数据吗？</b>',
      nzOkType: 'danger',
      nzOnOk: async () => {
        this.crudService.del(environment.baseUrl + 'api', 'rule',id).subscribe((res) => {
          this.loading = false;
          this.msg.success('删除成功');
          this.search();
        });
      },
      nzOnCancel: () => {
        this.loading = false;
      },
    });
  }

  resetSe() {
    this.searchKeyword = '';
    this.userId = null;
    this.controlType = null;
    this.startTime = null;
    this.endTime = null;
    this.dateRange =[];
    this.nzButtonValue = 'all';
    this.checkOptions.map((it) => {
      it.checked = false;
      return it;
    });

    this.searchThemes =[];
    if('rule'===this.showType){
      this.search();
    }else if('list'===this.showType){
      this.searchList();
    }

  }


  dateRangeOnChange($event: any) {
    this.nzButtonValue ='all';
    const range = this.commonService.getDateRange(this.dateRange,true);

    this.startTime = range.start;
    this.endTime = range.end;

    if('rule'===this.showType){
      this.search();
    }else if('list'===this.showType){
      this.searchList();
    }
  }

  quickSearch(datepart: string) {
    this.dateRange =[];
    if(datepart ==='all'){
      this.nzButtonValue = datepart;
      this.startTime = null;
      this.endTime = null;
    }else {
      if(datepart ==='3'){
        this.nzButtonValue = 'day3';
        this.dateRange = recentDay(3);
      }else if(datepart ==='7'){
        this.nzButtonValue = 'day7';
        this.dateRange = recentDay(7);
      }
      const range = this.commonService.getDateRange(this.dateRange,true);
      this.startTime = range.start;
      this.endTime = range.end;
    }

    if('rule'===this.showType){
      this.search();
    }else if('list'===this.showType){
      this.searchList();
    }
  }

  nzEvent(flag:any,event: NzFormatEmitEvent): void {
    this.searchThemes =[];
    if('themes'===flag){
      this.themesActivatedNode =event.node!;
      this.searchThemes.push(this.themesActivatedNode.key);
      if(this.themesActivatedNode.children.length >0){
        this.themesActivatedNode.children.map(m=>{
          this.searchThemes.push(m.key);
        })
      }
    }else if('instruct'===flag){
      this.instructActivatedNode =event.node!;
    }
    console.log('node',event.node);
    if('rule'===this.showType){
      this.search();
    }else if('list'===this.showType){
      this.searchList();
    }
  }

  nzExpandChange($event: NzFormatEmitEvent) {
  }

  onChange(event: any) {
  }

  async ruleExport() {

    if(this.checkIds.length === 0){
      this.msg.error('请选择要导出的项！');
      return;
    }

    await this.excelService.download('规则数据', 'api/rule/export', {
      ids: this.checkIds.join(","),
      tab: this.showType,
    },false);

  }

  async callPage(parent: any) {
    // await parent.ngOnInit();
    //  子窗口回调，翻页功能
  }

  instructSearch() {
    console.log(this.instructSearchValue);
    this.getInstructNodes();
  }


  onClose(flag: string) {
    this.searchThemes =[];
    if('themes'===flag){
      this.themesActivatedNode =null;
      this.themesActivated = [];
    }else if('instruct'===flag){
      this.instructActivatedNode =null;
      this.instructActivated = [];
    }

    if('rule'===this.showType){
      this.search();
    }else if('list'===this.showType){
      this.searchList();
    }
  }

  showEdit(id: any) {
    this.nzModalKeywordEditComponent.showModal(id);
  }


}
interface ItemData {
  id: number;
  name: string;
}

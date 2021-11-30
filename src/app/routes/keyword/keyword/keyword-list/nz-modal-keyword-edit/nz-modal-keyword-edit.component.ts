import {Component, Input, OnInit} from '@angular/core';
import {environment} from "@env/environment";
import {CrudService} from "../../../../crud.service";
import {NzMessageService} from "ng-zorro-antd/message";
import {SettingsService} from "@delon/theme";
import {diffDay, recentDay} from "@shared/utils/date-util";
import {DatePipe} from "@angular/common";

@Component({
  selector: 'app-nz-modal-keyword-edit',
  templateUrl: './nz-modal-keyword-edit.component.html',
  styleUrls: ['./nz-modal-keyword-edit.component.css'],
})
export class NzModalKeywordEditComponent implements OnInit {

  constructor(private crudService: CrudService,
              public msg: NzMessageService,
              public settingService: SettingsService,
              private datePipe: DatePipe,) { }

  isVisible = false;
  loading = true;
  fieldList = [];
  // 页面是否变化，用于判断关闭页面之后是否刷新父页面
  isChange = false;

  @Input() btnName: any;
  @Input() onPage: (parent: any) => Promise<void>;
  @Input() parent: any;
  @Input() dataId: number;
  isFirst = false;
  isLast = false;

  controlTypeVal: any;
  controlTypeList= [
    {id:1,name:'审核'},
    {id:2,name:'禁发'},
    {id:3,name:'屏蔽'},
    {id:4,name:'组合禁发'},
    {id:5,name:'单词禁发'}
  ];

  controlTimeVal?: number;
  controlTimeList= [
    {id:1,name:'30天'},
    {id:2,name:'180天'},
    {id:3,name:'永久'},
  ];

  instructVal?: number;
  instructList= [];

  expandThemesKeys = [];
  themesId?: number;
  themesNodes = [];
  keyword1 = '';
  keyword2 = '';
  keyword3 = '';
  delKeyword = '';

  ngOnInit(): void {
  }

  showModal(id: any) {
    this.loading = false;
    this.isChange = false;
    this.isVisible = true;
    this.dataId = id;
    this.searchInstructList();
    this.searchThemesClassify();

    if(this.dataId){
      const currentData = this.parent.ruleOfAllData.find(f=>f.id === this.dataId);
      this.keyword1 = currentData.addWord_1;
      this.keyword2 = currentData.addWord_2;
      this.keyword3 = currentData.addWord_3;
      this.delKeyword = currentData.delWord_1;
      if(currentData.ruleCommand){
        this.instructVal = currentData.ruleCommand.id;
      }
      if(currentData.keywordTopic){
        this.themesId = currentData.keywordTopic.id;
      }
      this.controlTypeVal = currentData.controlType;

      if(this.datePipe.transform(currentData.controlEndDate, 'yyyy-MM-dd HH:mm:ss') ==='9999-12-31 00:00:00'){
        this.controlTimeVal = 3;
      }
      else if(diffDay(new Date(currentData.controlBeginDate),new Date(currentData.controlEndDate)) === 30){
        this.controlTimeVal = 1;
      }else if(diffDay(new Date(currentData.controlBeginDate),new Date(currentData.controlEndDate)) === 180){
        this.controlTimeVal = 2;
      }
    }
  }

  cancel() {
    if (this.isChange ) {
      this.parent.search();
    }
    this.isVisible = false;
  }

  async submit() {

    if (this.keyword1 === ''){
      this.msg.warning('请填写关键词');
      return;
    }

    let controlBeginDate;
    let controlEndDate;

    if(this.controlTimeVal === 1 ){
      const range = recentDay(-30);
      controlBeginDate = range[1];
      controlEndDate = range[0];
    }else if(this.controlTimeVal === 2 ){
      const range = recentDay(-180);
      controlBeginDate = range[1];
      controlEndDate = range[0];
    }else if(this.controlTimeVal === 3 ){
      controlBeginDate = '1970-01-01 00:00:00';
      controlEndDate = '9999-12-31 00:00:00';
    }

    this.isChange = true;
    if (this.dataId) {
      // 修改
      await new Promise((resolve, reject) => {
        this.crudService
          .update2(environment.baseUrl + 'api', 'rule', this.dataId,{
            addWord_1:this.keyword1,
            addWord_2:this.keyword2,
            addWord_3:this.keyword3,
            delWord_1:this.delKeyword,
            systemId:0,
            controlBeginDate: controlBeginDate,
            controlEndDate: controlEndDate,
            controlType: this.controlTypeVal,
            editUserId: this.settingService.user.userId,
            keywordTopic: this.themesId,
            ruleCommand: this.instructVal

          })
          .subscribe(res1 => {
            this.msg.info('保存成功！');
            this.loading = false;
          });
      });
    } else {
      // 新增
      this.crudService
        .add(environment.baseUrl + 'api', 'rule', {
          addWord_1:this.keyword1,
          addWord_2:this.keyword2,
          addWord_3:this.keyword3,
          delWord_1:this.delKeyword,
          systemId:0,
          controlBeginDate: controlBeginDate,
          controlEndDate: controlEndDate,
          controlType: this.controlTypeVal,
          editUserId: this.settingService.user.userId,
          keywordTopic: this.themesId,
          ruleCommand: this.instructVal
        })
        .subscribe((res:any) => {
          this.msg.info('保存成功！');
          this.loading = false;
          this.dataId = res.id;
        });
    }

  }

  async searchInstructList() {
    this.instructList = [];
    this.instructList = await new Promise((resolve, reject) => {
      this.crudService
        .searchAll(environment.baseUrl + 'api', 'rule-command')
        .subscribe((res: any[]) => {
          resolve(res);
        });
    });

  }


  async searchThemesClassify() {
     new Promise((resolve, reject) => {
      this.crudService
        .search(environment.baseUrl + 'api', 'keyword-topic',{
          filter:"parent.id||$isnull",
          join:"parent"
        })
        .subscribe((res: any[]) => {
          for (const item of res) {
            item.title = item.name;
            item.key = item.id;
            if (!item.children || item.children.length === 0) {
              item.isLeaf = true;
            }else{
              for (const item1 of item.children) {
                item1.title = item1.name;
                item1.key = item1.id;
                item1.isLeaf = true;
                this.expandThemesKeys.push(item1.id);
              }
            }
            this.expandThemesKeys.push(item.id);
          }
          this.themesNodes = res;
          resolve();
        });
    });

  }

}

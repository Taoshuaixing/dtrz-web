import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CrudService} from '../../../crud.service';
import {ActivatedRoute, Router} from '@angular/router';
import {NzMessageService} from 'ng-zorro-antd/message';
import {FormBuilder} from '@angular/forms';
import {SettingsService} from '@delon/theme';
import {YangbenService} from '../../../yangben/yangben.service';
import {environment} from '@env/environment';
import {NzFormatEmitEvent} from 'ng-zorro-antd/tree';
import {JournalService} from '../../journal.service';
import {recentDay} from "@shared/utils/date-util";

@Component({
  selector: 'app-nz-modal-journal-event',
  templateUrl: './nz-modal-journal-event.component.html',
  styles: [],
})
export class NzModalJournalEventComponent implements OnInit {
  constructor(
    private crudService: CrudService,
    private activedrouted: ActivatedRoute,
    private router: Router,
    public msgSrv: NzMessageService,
    private fb: FormBuilder,
    public settingService: SettingsService,
    private yangbenService: YangbenService,
    public journalService: JournalService,
  ) {
  }

  isVisible = false;
  loading = false;

  @Input() btnName: any;
  @Input() detail: any;
  @Input() insertIndex: number;
  @Output() editorOk = new EventEmitter();

  eventFieldList: any;
  yangbenFieldList: any;
  eventList = [];
  total = 0;
  pageIndex = 1;
  pageSize = 10;
  expandSet = new Set<any>();

  expandEventClassifyKeys = [];
  eventClassifyNodes = [];
  eventClassifyId: number;
  eventTemplateList = [];
  eventTemplateId: number;
  eventTagList = [];
  eventTags = [];
  listOfControl = [];
  searchTimeRange = [];
  searchEventName: any;

  async ngOnInit() {
    await this.getEventClassifyList();
    this.eventTemplateList = await this.journalService.getEventTemplateList();
    this.eventTagList = await this.yangbenService.getSignList();
    this.yangbenFieldList = await this.yangbenService.getAllField();
    this.eventFieldList = await this.yangbenService.getAllEventField();

  }

  cancel() {
    this.loading = false;
    this.isVisible = false;
  }

  submit() {
    const selectEvent = this.eventList.filter((f) => f.checked === true);
    selectEvent.map((m) => {
      if (m.yangbenNodes) {
        m.yangbenNodes = m.yangbenNodes.filter((it) => it.checked === true);
      }
    });
    console.log('selectEvent', selectEvent);
    // 传递结果给父页面
    this.editorOk.emit({
      selectEvent: selectEvent,
      detail: this.detail,
      index: this.insertIndex,
    });
    this.isVisible = false;
  }

  async showModal(detail: any, index: number) {
    //检索条件置空
    this.eventClassifyId = null;
    this.eventTemplateId = null;
    this.eventTags = [];
    this.searchEventName = '';
    this.searchTimeRange = recentDay(7);

    //检索条件赋值
    this.pageIndex = 1;
    this.detail = detail;
    this.insertIndex = index;
    this.searchEventName = '';
    this.eventClassifyId = detail.eventClassifyId;
    this.eventTemplateId = detail.eventTemplateId;
    if(detail.eventTagFieldId != null &&　detail.eventTagId　!= null　){
      const arr = [];
      arr.push(detail.eventTagFieldId);
      arr.push(detail.eventTagId);
      this.eventTags = arr;
    }
    this.isVisible = true;

    await this.search();
  }

  async search(reset: boolean = false) {
    this.loading = true;
    const searchFilter = [];
    const searchFilterRec = [];

    if (this.eventClassifyId) {
      searchFilterRec.push({fieldName: 'classifyEventId', val: this.eventClassifyId});
    }
    if (this.eventTemplateId) {
      searchFilterRec.push({fieldName: 'eventTemplateId', val: this.eventTemplateId});
    }

    if (this.searchEventName) {
      searchFilterRec.push({fieldName: 'name', val: this.searchEventName, exp: 'like'});
    }

    if (this.eventTags.length > 0 ) {
      searchFilter.push({fieldId: this.eventTags[0], val: this.eventTags[1]});
    }

    if(this.searchTimeRange.length >0){
      //[{"fieldName":"createdTime", "exp":"between", "start":"2020-11-03","end":"2020-11-27"}]
      searchFilter.push({fieldName: 'createdTime', exp:"between", start:this.searchTimeRange[0],end:this.searchTimeRange[1]});
    }

    const page = {limit: this.pageSize, page: this.pageIndex, sort: ''};

    this.eventList = await new Promise((resolve, reject) => {
      this.crudService
        .search(environment.baseUrl + 'api', 'yangben-event', {
          s: JSON.stringify(searchFilter),
          rec: JSON.stringify(searchFilterRec),
          page: JSON.stringify(page),
          other: JSON.stringify({
            postId: this.settingService.user.posts[0].id,
            adminFlag: 0,
            isWenziPost: 0,
          }),
        })
        .subscribe((res: any) => {
          this.total = res.total;
          resolve(res.data);
        });
    });

    const fieldInfo = this.eventFieldList.find((f) => f.fixName === 'startDate');
    await Promise.all(
      this.eventList.map(async (m) => {
        // const yangbenNodes = await this.getYangbenNodes(m.id, '');
        m.eventDate = m[fieldInfo.fieldName];
        // m.yangbenNodes = yangbenNodes;
        // m.yangbenSearchValue = '';
        m.checked = false;
      }),
    );

    this.loading = false;
    console.log('this.eventList', this.eventList);
  }

  async getYangbenNodes(eventId: any, yangbenSearchValue: any) {

    if (this.detail.withYangben == 1) {

      const yangbenSearchFilter = [];
      const findField = this.yangbenFieldList.find(
        (f) => f.yangbenOptionConfig && f.yangbenOptionConfig.targetTable === 'yangben_event_rec',
      );
      if (findField) {
        yangbenSearchFilter.push({fieldId: findField.id, val: eventId, exp: '='});
      }

      const field = this.yangbenFieldList.find((f) => f.fixName === 'content');
      if (yangbenSearchValue) {
        yangbenSearchFilter.push({fieldId: field.id, val: yangbenSearchValue, exp: 'like'});
      }

      const page = {limit: 100, page: 1, sort: ''};

      return await new Promise((resolve, reject) => {
        this.crudService
          .search(environment.baseUrl + 'api', 'yangben-data', {
            s: JSON.stringify(yangbenSearchFilter),
            page: JSON.stringify(page),
            other: JSON.stringify({
              postId: this.settingService.user.posts[0].id,
              adminFlag: 0,
              shareFlag: 0,
              attachmentFlag: 0,
              extensionNames: '',
            }),
          })
          .subscribe((res1: any) => {
            const nodes = [];
            if (res1) {
              res1.data.map((it) => {
                if (it[field.fieldName] != null) {
                  nodes.push({key: it.id, title: it[field.fieldName], isLeaf: true});
                }
              });
            }
            resolve(nodes);
          });
      });
    } else {
      return null;
    }
  }

  async onExpandChange(data: any, checked: boolean) {
    data.yangbenloading = true;
    if (checked) {
      const yangbenNodes = await this.getYangbenNodes(data.id, '');
      data.yangbenNodes = yangbenNodes;
      data.yangbenSearchValue = '';

      this.expandSet.add(data);
    } else {
      this.expandSet.delete(data);
    }

    data.yangbenloading = false;
  }

  nzEvent(item: any, event: NzFormatEmitEvent): void {
    console.log(event);
    if (event.checkedKeys.length > 0) {
      item.checked = true;
    } else {
      item.checked = false;
    }
  }

  eventCheckBox(item: any, checked: boolean) {
    item.checked = checked;
  }

  async yangbenSearch(item: any) {
    item.yangbenSearchloading = true;
    console.log('item.yangbenSearchValue', item.yangbenSearchValue);
    item.yangbenNodes = await this.getYangbenNodes(item.id, item.yangbenSearchValue);
    item.yangbenSearchloading = false;
}

  async getEventClassifyList() {
    // 获取所有事件分类，用于下拉
    const treeData: any = await this.yangbenService.searchEventClassify();
    if (treeData) {
      this.eventClassifyNodes = treeData.eventClassifyNodes;
      this.expandEventClassifyKeys = treeData.expandEventClassifyKeys;
    }
  }


  reset() {
    this.eventClassifyId = null;
    this.eventTemplateId = null;
    this.eventTags = [];
    this.searchEventName = '';
    this.searchTimeRange = [];

    this.search();
  }
}

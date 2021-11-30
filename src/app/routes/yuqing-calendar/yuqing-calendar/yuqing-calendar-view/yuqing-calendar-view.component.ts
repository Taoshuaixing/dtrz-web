import {Component, OnInit, ViewChild} from '@angular/core';
import {DatePipe, registerLocaleData} from '@angular/common';
import zh from '@angular/common/locales/zh';
import {NzModalService} from "ng-zorro-antd/modal";
import {getTimeDistance} from "@delon/util";
import {environment} from "@env/environment";
import {CrudService} from "../../../crud.service";
import {YangbenService} from "../../../yangben/yangben.service";
import {NzMessageService} from "ng-zorro-antd/message";
import {NzDescriptionsSize} from "ng-zorro-antd/descriptions";
import {NzModalEventUpdateDetailComponent} from "../../../event/event/yangben-event/nz-modal-event-update-detail/nz-modal-event-update-detail.component";
import {monthFirstDay, monthLastDate} from '@shared/utils/date-util';
import {YuqingCalendarService} from "../../yuqing.calendar.service";

registerLocaleData(zh);

@Component({
  selector: 'app-yuqing-calendar-view',
  templateUrl: './yuqing-calendar-view.component.html',
  styleUrls: ['./yuqing-calendar-view.component.css'],
})
export class YuqingCalendarViewComponent implements OnInit {

  constructor(private modalService: NzModalService,
    private datePipe: DatePipe,
    private crudService: CrudService,
    public msg: NzMessageService,
    private yangbenService: YangbenService,
    private yuqingCalendarService:YuqingCalendarService,) { }

  @ViewChild("editEventDrawer", { static: true })
  modalEventUpdateDetailComponent: NzModalEventUpdateDetailComponent;

  oldComareStr = "";
  loading = false;
  listOfAllData = [];
  // 日历中事件 气泡卡片
  visible: boolean = false;


  detail: any = {
    name: '',
    eventContent: '',
    sensitivity: 0,
    startDate: '',
    endDate: '',
    recUuid: '',
    keywords: ''
  };

  monthStart;
  monthEnd;
  startDateFieldId;
  selectDate;
  month: Number;
  size: NzDescriptionsSize = 'middle';
  hotSearchList = [];

  expandEventClassifyKeys = [];
  eventClassifyId?: number;
  eventClassifyNodes = [];

  postChangeFlag?: number;
  eventMapList= [{id:0,name:'用户录入'},{id:1,name:'图谱推荐'}];
  templateIds = [];
  eventTemplateList = [];


  async ngOnInit() {

    this.selectDate = new Date();
    this.month = this.selectDate.getMonth();

    const curMonth = getTimeDistance('month');
    this.monthStart = this.datePipe.transform(curMonth[0], 'yyyy-MM-dd 00:00:00');
    this.monthEnd = this.datePipe.transform(curMonth[1], 'yyyy-MM-dd 23:59:59');

    const fieldList = await this.yuqingCalendarService.getEventFieldList();
      const start = fieldList.find(f => f.fixName === 'startDate');
      if (start) {
        this.startDateFieldId = start.id;
      }

      this.eventTemplateList = await this.yuqingCalendarService.getEventTemplateList();
      await this.getHotSearchList();
      await this.searchEventClassify();
      await this.search();

  }

  async searchEventClassify() {
    // 获取所有事件分类，用于下拉
    const treeData:any =await this.yangbenService.searchEventClassify();
    if(treeData){
      this.eventClassifyNodes = treeData.eventClassifyNodes;
      this.expandEventClassifyKeys = treeData.expandEventClassifyKeys;
    }
  }

  async search() {
    this.loading = true;
    const searchFilter = [];
    searchFilter.push({ 
      fieldId: this.startDateFieldId, 
      start: this.monthStart,
      end: this.monthEnd
     });

    const searchFilterRec = [];
    if (this.eventClassifyId > 0) {
      searchFilterRec.push({ fieldName: "classifyEventId", val: this.eventClassifyId });
    }

    if (this.postChangeFlag != null) {
      searchFilterRec.push({ fieldName: "postChangeFlag", val: this.postChangeFlag });
    }

    if(this.templateIds.length > 0){
      searchFilterRec.push({ fieldName: "eventTemplateId", val: this.templateIds ,exp:'in' });
    }

    const page = { limit: 1000, page: 1, sort: '' };
    const other = {noLimit: 1,adminFlag: 1,noExtendFlag: 1,needNameSeg:1 };

    // 放到检索外面清空，防止月份和数据不同步导致加载中错位
    this.listOfAllData = [];

    const eventList: any = await this.yuqingCalendarService.searchEventList(searchFilter,searchFilterRec,page,other);

    if (eventList) {
      for (const item of eventList) {
        const sTime = item.startDate; 
        const day = new Date(sTime).getDate();
        item.sensitivity = this.yuqingCalendarService.getSensitivity(item.sensitivity);

        let curType = "";
        if (item.sensitivity >= 4) {
          curType = "error"
        } else if (item.sensitivity > 2 && item.sensitivity < 4) {
          curType = "warning"
        } else {
          curType = "success"
        }

        const curItem = { type: curType, content: item.name, detail: item, active: false, visible: false }

        const ff = this.listOfAllData.find(f => f.day === day );
        if (ff) {
          ff.data.push(curItem);
        } else {
          this.listOfAllData.push({ day: day, data: [curItem] });
        }
      }

      this.listOfAllData.sort((a: any, b: any) => {
        return a.day - b.day;
      });

      this.listOfAllData.forEach(it => {
        if (it.data.find(f => f.detail.sortId > 1)) {
          it.data.sort((a: any, b: any) => {
            return a.detail.sortId - b.detail.sortId;
          });
        } else {
          it.data.sort((a: any, b: any) => {
            return b.detail.sensitivity - a.detail.sensitivity;
          });
        }
      });

      //初始化详情
      const curDay = (new Date()).getDate();
      let selectedItem: any;

      if (this.listOfAllData.length > 0) {
        // 默认选中第一个
        selectedItem = this.listOfAllData[0].data[0];
      }
      for (const item of this.listOfAllData) {
        if (item.day === curDay) {
          selectedItem = item.data[0];
          break;
        }
      }

      if (selectedItem) {
        this.detail = selectedItem.detail;
        selectedItem.active = true;
        this.selectDate = selectedItem.detail.startDate;
      }
      this.loading = false;
    }
  }

  async getHotSearchList() {

    this.crudService
      .search(environment.baseUrl + 'api', 'yangben-event-hottest', {
        sort: ['heat,DESC'],
      })
      .subscribe((res: any[]) => {
        this.hotSearchList = res;
      });

  }


  del(recUuid: any) {
    this.modalService.confirm({
      nzTitle: `删除事件`,
      nzContent: `<b style="color: red;">确定删除事件吗？</b>`,
      nzOkType: 'danger',
      nzOnOk: () => {
        this.crudService.del(environment.baseUrl + 'api', 'yangben-event', recUuid).subscribe(res => {
          this.msg.create('success', `删除成功`);
          this.search();
        });
      },
      nzOnCancel: () => console.log('Cancel'),
    });
  }

  changeEvent(item: any) {
    this.detail = item.detail;
    this.listOfAllData.forEach(it => it.data.forEach(it1 => it1.active = false));
    item.active = true;
  }


  getLast() {
    let newDate = new Date(this.selectDate);
    newDate.setMonth(newDate.getMonth() - 1);
    return newDate;
  }

  getNext() {
    let newDate = new Date(this.selectDate);
    newDate.setMonth(newDate.getMonth() + 1);
    return newDate;
  }

  getToday() {
    return new Date();
  }

  async selectChange(l_selectDate: Date) {
    this.selectDate = l_selectDate;
    this.month = this.selectDate.getMonth();

    const selectMonthStart = this.datePipe.transform(monthFirstDay(l_selectDate), 'yyyy-MM-dd 00:00:00');
    const selectMonthEnd = this.datePipe.transform(monthLastDate(l_selectDate), 'yyyy-MM-dd 23:59:59');
    if (this.monthStart != selectMonthStart) {
      this.monthStart = selectMonthStart;
      this.monthEnd = selectMonthEnd;
      await this.search();
    }

  }


  getUrl(item: any) {
    if (item.nameSeg) {
      const keywords = [];
      item.nameSeg.forEach(it => {
        keywords.push(it.w);
      });
      return environment.mapUrlByKeyword + keywords.join(" ");
    } else if (item.name) {
      return environment.mapUrlByKeyword + item.name;
    }
  }

  onPopoverVisibleChange($event, data) {
    let comareStr = "";
    data.forEach(it => {
      comareStr += it.detail.recUuid
    });

    if (!$event && comareStr !== this.oldComareStr) {

      const newList: any[] = data.map(it => it.detail.recUuid);
      this.crudService
        .put(environment.baseUrl + 'api', `yangben-event-rec/sortIdChange/${newList.join(',')}`, {})
        .subscribe((res: any) => {
          this.msg.create('success', `排序成功`);
        });
    } else {
      this.oldComareStr = comareStr;
    }
  }

  closePopover(item): void {
    item.visible = false;
  }

  showEventModal(recUuid: any) {
    this.modalEventUpdateDetailComponent.showModal(recUuid);
  }

  onChange($event: any) {
    this.search();
  }
  disabledDate =  (current: Date)=>  {
    if(!current || current.getMonth()!==this.month)
     {
       return true;
      }
    return false;
  }


}

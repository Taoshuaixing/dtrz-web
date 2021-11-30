import {Component, OnInit} from '@angular/core';
import {toDate} from "@delon/util";
import {CrudService} from "../../../crud.service";
import {DatePipe} from "@angular/common";
import differenceInCalendarDays from 'date-fns/differenceInCalendarDays';
import {YuqingCalendarService} from "../../yuqing.calendar.service";

@Component({
  selector: 'app-yuqing-calendar-history-today',
  templateUrl: './yuqing-calendar-history-today.component.html',
  styleUrls: ['./yuqing-calendar-history-today.component.css'],
})
export class YuqingCalendarHistoryTodayComponent implements OnInit {

  constructor(    private crudService: CrudService,
                  private yuqingCalendarService:YuqingCalendarService,
                  private datePipe: DatePipe,
                  ) { }

  classifyList = [
    {id:0,eventClassifyName:'全部'}
  ];
  eventClassifyId?: number;
  startDateFieldId;
  startTime;
  endTime;
  resultData = {
    isEnd:true,
    pageIndex:1,
    pageSize:10000,
    today:"",
    list:[]
  };
  date1 =null;
  disabledDate:any;

  postChangeFlag?: number;
  eventMapList= [{id:0,name:'用户录入'},{id:1,name:'图谱推荐'}];
  templateIds = [];
  eventTemplateList = [];

 async ngOnInit(){

   this.disabledDate = (current: Date): boolean => {
     return differenceInCalendarDays(current,new Date()) > 0;
   };

   const fieldList = await this.yuqingCalendarService.getEventFieldList();
   const start = fieldList.find(f=>f.fixName ==='startDate');
   if(start){
     this.startDateFieldId = start.id;
   }

   const eventClassify:any = await this.yuqingCalendarService.searchEventClassify();
   for (const item of eventClassify) {
     this.classifyList.push({id:item.id,eventClassifyName:item.eventClassifyName});
   }

   this.eventTemplateList = await this.yuqingCalendarService.getEventTemplateList();

   await this.loopSearch();
  }

  async loopSearch(){
    this.resultData.list =[];

    for (let i = 0; i < 10; i++) {

      let curDay = new Date();
      if(this.date1){
        curDay = toDate(this.date1);
      }
      this.resultData.today = curDay.getMonth()+1 + "月" + curDay.getDate() + "日";

      curDay.setFullYear(curDay.getFullYear() - i);
      this.startTime = this.datePipe.transform(curDay, 'yyyy-MM-dd 00:00:00');
      this.endTime = this.datePipe.transform(curDay, 'yyyy-MM-dd 23:59:59');
      await this.search();
    }

  }

  async search(){

    const searchFilter = [];
    if(this.startTime && this.endTime && this.startDateFieldId){
      searchFilter.push({ fieldId: this.startDateFieldId, start: this.startTime, end: this.endTime})
    }
    const searchFilterRec = [];
    if (this.eventClassifyId) {
      searchFilterRec.push({ fieldName: "classifyEventId", val: this.eventClassifyId });
    }

    if (this.postChangeFlag != null) {
      searchFilterRec.push({ fieldName: "postChangeFlag", val: this.postChangeFlag });
    }

    if(this.templateIds.length > 0){
      searchFilterRec.push({ fieldName: "eventTemplateId", val: this.templateIds ,exp:'in' });
    }

    const page = { limit: this.resultData.pageSize, page: this.resultData.pageIndex, sort: '' };
    const other = {noLimit: 1,adminFlag: 1,needNameSeg:1,noExtendFlag:1};
    const eventList: any = await this.yuqingCalendarService.searchEventList(searchFilter,searchFilterRec,page,other);

    if(eventList){

      eventList.sort((a: any, b: any) => {
        return a.startDate - b.startDate;
      });

      eventList.map(m=>{
        let color='#52c41a';
        const sensitivity = this.yuqingCalendarService.getSensitivity(m.sensitivity);
        if(sensitivity >=4){
          color = 'red';
        }else if(sensitivity >2 && sensitivity < 4){
          color = 'orange';
        }
        this.resultData.list.push({
          title: m.name,
          nameSeg: m.nameSeg,
          eventDate: m.startDate.getFullYear()+"年",
          desc: m.eventContent,
          color:color,
          icon:'history',
          width:'600px'
        })
      });

    }
  }


  async tabTo(tab: any) {
    this.eventClassifyId = tab.id;
    await this.loopSearch();
  }

  async onChange(result: Date){
    this.date1 = this.datePipe.transform(result, 'yyyy-MM-dd');
    await this.loopSearch();
  }

  async change(result: Date){
    await this.loopSearch();
  }

  async callbackOnMore(parent: any, page: number, pageSize:number): Promise<any> {
  }


}

import {Component, OnInit} from '@angular/core';
import {CrudService} from "../../../crud.service";
import {DatePipe} from "@angular/common";
import {toDate} from "@delon/util";
import differenceInCalendarDays from 'date-fns/differenceInCalendarDays';
import {future} from "@shared/utils/date-util";
import {YuqingCalendarService} from "../../yuqing.calendar.service";


@Component({
  selector: 'app-yuqing-calendar-future',
  templateUrl: './yuqing-calendar-future.component.html',
  styleUrls: ['./yuqing-calendar-future.component.css'],
})
export class YuqingCalendarFutureComponent implements OnInit {

  constructor(    private crudService: CrudService,
                  private yuqingCalendarService:YuqingCalendarService,
                  private datePipe: DatePipe,) { }

  date:any;
  classifyList = [
    {id:0,eventClassifyName:'全部'}
  ];
  eventClassifyId?: number;
  startDateFieldId;
  startTime;
  endTime;
  selectDate;
  listOfAllData = [];

  resultData = {
    isEnd:true,
    pageIndex:1,
    pageSize:10000,
    today:"",
    list:[]
  };
  dateRange: any;
  dateFormat = 'yyyy/MM/dd';
  disabledDate: any;
  nzButtonValue: any;

  postChangeFlag?: number;
  eventMapList= [{id:0,name:'用户录入'},{id:1,name:'图谱推荐'}];
  templateIds = [];
  eventTemplateList = [];

 async ngOnInit(){
   this.nzButtonValue = 'month';
   this.dateRange = future('month');
   this.disabledDate = (current: Date): boolean => {
     return differenceInCalendarDays(new Date(),current) > 0;
   };

   this.startTime = this.dateRange[0];
   this.endTime = this.dateRange[1];

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

   await this.search();
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

    // 未来事件默认为待下发
    searchFilterRec.push({fieldName:"currentStatus",val:[2],exp:"in"});
    const page = { limit: this.resultData.pageSize, page: this.resultData.pageIndex, sort: '' };
    const other = {noLimit: 1,adminFlag: 1,needNameSeg:1,noExtendFlag:1};
    this.listOfAllData = await this.yuqingCalendarService.searchEventList(searchFilter,searchFilterRec,page,other);

    if(this.listOfAllData){

      this.listOfAllData.sort((a: any, b: any) => {
        return a.startDate - b.startDate;
      });
      // console.log(eventList);

      this.resultData.list=[];
      this.listOfAllData.map(m=>{
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
          eventDate: this.datePipe.transform(m.startDate, 'yyyy-MM-dd'),
          desc: m.eventContent,
          color:color,
          icon:'history',
          width:'600px'
        })
      });
    }
  }

 async tabTo(tab: any) {
    this.resultData.list =[];
    this.eventClassifyId = tab.id;
    await this.search();
  }

  dateRangeOnChange($event: any) {
    this.nzButtonValue ='';
   if(this.dateRange.length >0 ){
     if(this.datePipe.transform(this.dateRange[1], 'yyyy-MM-dd HH:mm:ss') === this.datePipe.transform(this.dateRange[1], 'yyyy-MM-dd HH:mm:ss')){
       this.dateRange[1] = toDate(this.datePipe.transform(this.dateRange[1], 'yyyy-MM-dd 23:59:59'));
     }
     this.startTime = this.dateRange[0];
     this.endTime = this.dateRange[1];
   }else{
     const today = new Date();
     today.setDate(today.getDate() + 1);
     this.startTime = this.datePipe.transform(today, 'yyyy-MM-dd 00:00:00');
     this.endTime = this.datePipe.transform(new Date('2121-01-01 00:00:00'), 'yyyy-MM-dd HH:mm:ss');
   }
    this.search();
  }

  quickSearch(datepart: string) {
   this.nzButtonValue = datepart;
    this.dateRange =[];
    if(datepart ==='all'){
      const today = new Date();
      today.setDate(today.getDate() + 1);
      this.startTime = this.datePipe.transform(today, 'yyyy-MM-dd 00:00:00');
      this.endTime = this.datePipe.transform(new Date('2121-01-01 00:00:00'), 'yyyy-MM-dd HH:mm:ss');
    }else {
      this.dateRange = future(datepart);
      this.startTime = this.dateRange[0];
      this.endTime = this.dateRange[1];
    }
    this.search();
  }

  async callbackOnMore(me: any, page: number, pageSize:number): Promise<any> {
  }

  onChange($event: any) {
    this.search();
  }

}

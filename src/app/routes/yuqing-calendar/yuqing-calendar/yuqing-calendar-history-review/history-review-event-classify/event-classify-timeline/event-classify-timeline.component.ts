import {AfterViewInit, Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {CrudService} from "../../../../../crud.service";
import {DatePipe} from "@angular/common";
import {monthFirstDay, monthLastDate} from '@shared/utils/date-util';
import {YuqingCalendarService} from "../../../../yuqing.calendar.service";
import { fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-event-classify-timeline',
  templateUrl: './event-classify-timeline.component.html',
  styles: [
  ]
})
export class EventClassifyTimelineComponent implements OnInit , AfterViewInit{

  constructor(private activedrouted: ActivatedRoute,
              private crudService: CrudService,
              private yuqingCalendarService:YuqingCalendarService,
              private datePipe: DatePipe,) { }

  classifyId:number;
  classifyId2:number;
  searchMonth;
  startDateFieldId;
  day;
  // fieldList =[];
  resultData = {
    isEnd:true,
    pageIndex:1,
    pageSize:10000,
    today:"",
    list:[],
    style:"margin-left: -40px;"
  };
  loading = false;
  timelineWidth = 700;
  pageWidth = {
    menuWidth: 160,
    dateListWdith: 100,
    classWidth: 230,
    calendarWidth: 332,
    offsetWidth: 136
  };

  postChangeFlag:any;
  templateIds = [];
 
  
  ngAfterViewInit(): void {
    
    fromEvent(window, 'resize')
      .pipe(debounceTime(200))
      .subscribe((event) => {
        // 这里处理页面变化时的操作
       this.resizeWidth();
       
      });
     
  }

  resizeWidth() {
    
    this.timelineWidth = document.querySelector('body').clientWidth 
                        - this.pageWidth.menuWidth - this.pageWidth.dateListWdith - this.pageWidth.classWidth 
                        -this.pageWidth.calendarWidth -this.pageWidth.offsetWidth;
    // console.log(document.querySelector('body').clientWidth,this.timelineWidth)
  }

  ngOnInit(): void {
    this.resizeWidth();
    this.activedrouted.queryParams.subscribe(params => {
      if(params.classifyId2) {
        this.classifyId =Number( params.classifyId);
        this.classifyId2 =Number( params.classifyId2);
        this.searchMonth = params.searchMonth;
        this.day = params.day;
        this.startDateFieldId = params.startDateFieldId;
        this.postChangeFlag = params.postChangeFlag;
        this.templateIds = params.templateIds;

        this.searchEventList();
      } 
     
    });

  }

 async searchEventList(){
   this.resultData.list =[];
   let startTime:string ;
   let endTime:string ;
   if (this.day) {
      //  按天
      startTime = this.datePipe.transform(this.searchMonth+'-' + this.day, 'yyyy-MM-dd 00:00:00');
      endTime = this.datePipe.transform(this.searchMonth+'-' + this.day, 'yyyy-MM-dd 23:59:59');
   } else {
      //  按月
      let lastMonth = monthLastDate(new Date(this.searchMonth+'-1'))
      if(lastMonth> new Date()) {
        lastMonth = new Date();
      }
      startTime = this.datePipe.transform(monthFirstDay(new Date(this.searchMonth+'-1')), 'yyyy-MM-dd 00:00:00');
      endTime = this.datePipe.transform(lastMonth, 'yyyy-MM-dd 23:59:59');

   }
   
    const searchFilter = [];
    if(startTime && endTime && this.startDateFieldId){
      searchFilter.push({ fieldId: this.startDateFieldId, start: startTime, end: endTime})
    }
    const searchFilterRec = [];
    if (this.classifyId2 > 0) {
     searchFilterRec.push({ fieldName: "classifyEventId", val: this.classifyId2 });
    } else if (this.classifyId === 0  ){
      // 一级全部
      if (this.classifyId2 === -1) {
        // 二级的全部
        // 无条件
      } else {
        // 二级的未分类
        searchFilterRec.push({fieldName: "classifyEventId", val: " null", exp: 'is' });
      }
      
    } else if (this.classifyId !== 0){
      // 有一级分类
      if (this.classifyId2 === -1) {
        // 二级的全部
        searchFilterRec.push({fieldName: "classifyEventId", val: this.classifyId });
      } else {
        // 二级的未分类 ??
        // searchFilterRec.push({fieldName: "classifyEventId", val: this.classifyId });
        // searchFilterRec.push({fieldName: "classifyEventId", val: " null", exp: 'is' });
      }
      
    }

   if (this.postChangeFlag != null) {
     searchFilterRec.push({ fieldName: "postChangeFlag", val: this.postChangeFlag });
   }

   if(this.templateIds && this.templateIds.length > 0){
     searchFilterRec.push({ fieldName: "eventTemplateId", val: this.templateIds ,exp:'in' });
   }

   const page = { limit: this.resultData.pageSize, page: this.resultData.pageIndex, sort: '' };
   const other = {noLimit: 1,adminFlag: 1,needNameSeg:1,noExtendFlag:1};

   this.loading = true;

   const eventList: any = await this.yuqingCalendarService.searchEventList(searchFilter,searchFilterRec,page,other);

    if(eventList){

      eventList.sort((a: any, b: any) => {
        return b.startDate.getDate() - a.startDate.getDate() ;
      });

      // await Promise.all(  eventList.forEach( async (m,idx)=>{
        for(let i =0;i<eventList.length;i++) {

          const m = eventList[i];
          let color='#52c41a';
          const sensitivity = this.yuqingCalendarService.getSensitivity(m.sensitivity);
          if(sensitivity >=4){
            color = 'red';
          }else if(sensitivity >2 && sensitivity < 4){
            color = 'orange';
          }
          if (i ===20) {
            this.loading = false;
            // 等待
            await this.sleep(200)
          }
          this.resultData.list.push({
            title: m.name,
            nameSeg: m.nameSeg,
            eventDate: m.startDate.getDate()+"日",
            desc: m.eventContent,
            color:color,
            icon:'history' 
          })
        }
        
      // });

      this.loading = false;

    }
  }

  sleep(millisecond) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(null)
        }, millisecond)
    })
}

}

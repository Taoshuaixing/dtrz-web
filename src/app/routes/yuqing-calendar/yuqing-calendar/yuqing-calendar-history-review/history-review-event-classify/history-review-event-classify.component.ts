import {Component, OnInit} from '@angular/core';
import {CrudService} from "../../../../crud.service";
import {NzModalService} from "ng-zorro-antd/modal";
import {NzMessageService} from "ng-zorro-antd/message";
import {ActivatedRoute, Router} from "@angular/router";
import {SettingsService} from "@delon/theme";
import {environment} from "@env/environment";
import {DatePipe} from "@angular/common";
import {YangbenService} from "../../../../yangben/yangben.service";
import {monthFirstDay, monthLastDate} from '@shared/utils/date-util';
import {YuqingCalendarService} from '../../../yuqing.calendar.service';
import {G2PieData} from '@delon/chart/pie';
import differenceInCalendarDays from 'date-fns/differenceInCalendarDays';

@Component({
  selector: 'app-history-review-event-classify',
  templateUrl: './history-review-event-classify.component.html',
  styleUrls: ['./history-review-event-classify.component.css']
})
export class HistoryReviewEventClassifyComponent implements OnInit {

  constructor(    private crudService: CrudService,
                  private modalService: NzModalService,
                  private msg: NzMessageService,
                  private router: Router,
                  private datePipe: DatePipe,
                  private yangbenService: YangbenService,
                  private activedrouted: ActivatedRoute,
                  public settingService: SettingsService,
                  private yuqingCalendarService:YuqingCalendarService
                  ) { }

  classifyId;
  searchMonth;
  startDateFieldId;
  showClassifyList =[];
  loading = false;
  fieldList = [];
  month: Number;
  selectDate:Date;
  dayList = [];

  classifyPieData: G2PieData[] = [];
  total: string;
  disabledDate1:any;
  next=false;
  postChangeFlag:any;
  templateIds = [];

  ngOnInit(){

  
    this.disabledDate1 = (current: Date): boolean => {
      return differenceInCalendarDays(current,new Date()) > 0;
    };

    this.month = new Date().getMonth();
    this.activedrouted.queryParams.subscribe(async params => {
     
      if(!params.classifyId2) {
        if(params.day) {
            this.selectDate = new Date(params.searchMonth + '-'+ params.day);
        } else {
          this.selectDate = new Date(params.searchMonth+'-01');
        }
        this.month = this.selectDate.getMonth();
        
        // console.log("二级",params)
        // 避免点击二级刷新
        this.searchMonth = params.searchMonth;
        this.classifyId = Number(params.classifyId);
        this.startDateFieldId = params.startDateFieldId;
        this.postChangeFlag = params.postChangeFlag;
        this.templateIds = params.templateIds;
        this.showClassifyList =[];
        this.classifyPieData = [];
        this.dayList=[];
        if(this.searchMonth){
          await this.searchShowClassify();
          await this.setDayList(params.searchMonth,this.postChangeFlag,this.templateIds);
        }
      }

      let newDate = new Date(this.searchMonth);
      newDate.setMonth(newDate.getMonth() + 1);
      if(differenceInCalendarDays(newDate,new Date()) > 0){
        this.next = true;
      }else{
        this.next = false;
      }

    });
  }


  async searchShowClassify() {
    // 获取所有事件分类
    let searchFilter = [];
    if(this.classifyId > 0 ){
      searchFilter = ['deleteFlag||$eq||0', `parentid||$eq||${this.classifyId}`];
    }else{
      searchFilter = ['deleteFlag||$eq||0', `classifyLevel||$eq||2}`];
    }

    let lastMonth = monthLastDate(new Date(this.searchMonth+'-1'));
    if(lastMonth> new Date()) {
      lastMonth = new Date();
    }
    const startTime = this.datePipe.transform(monthFirstDay(new Date(this.searchMonth+'-1')), 'yyyy-MM-dd 00:00:00');
    const endTime = this.datePipe.transform(lastMonth, 'yyyy-MM-dd 23:59:59');
    // console.log(startTime,endTime)

  
    this.loading = true;
    this.crudService
      .search(environment.baseUrl_zxtj + 'api', 'classifyEvent', {
        sort: ['sortId,ASC'],
        filter: searchFilter,
      })
      .subscribe(async (res: any[]) => {
        this.showClassifyList = res;
        
        this.showClassifyList.splice(0,0,{id:-1 ,eventClassifyName:'全部'});
        if(this.classifyId === 0 ){
          this.showClassifyList.push({id:0 ,eventClassifyName:'未分类'});
        }


        const searchFilter = [];
        if (startTime && endTime && this.startDateFieldId) {
          searchFilter.push({fieldId: this.startDateFieldId, start: startTime, end: endTime})
        }

        await Promise.all( 
          this.showClassifyList.map(async m => {

            const searchFilterRec = [];
            if (m.id >0) {
              searchFilterRec.push({fieldName: "classifyEventId", val: m.id});
            } else if (m.id===0){
              
              if(this.classifyId > 0 ){
                // // 一级有分类、二级未分类 ??
                // searchFilterRec.push({fieldName: "classifyEventId", val: this.classifyId});
                // //??
              } else {
                // 一级全部、二级未分类
                searchFilterRec.push({fieldName: "classifyEventId", val: " null", exp: 'is' });
              }
              
            } else if (m.id === -1) {
              
              if(this.classifyId > 0 ){
                  // 一级有分类、二级全部
                searchFilterRec.push({fieldName: "classifyEventId", val: this.classifyId});
              } else {
                  // 一级全部、二级全部
                // 无条件
              }
            }

            if (this.postChangeFlag != null) {
              searchFilterRec.push({ fieldName: "postChangeFlag", val: this.postChangeFlag });
            }
            if(this.templateIds && this.templateIds.length > 0){
              searchFilterRec.push({ fieldName: "eventTemplateId", val: this.templateIds ,exp:'in' });
            }

            const total: any = await new Promise((resolve, reject) => {
              this.crudService
                .search(environment.baseUrl + 'api', 'yangben-event', {
                  s: JSON.stringify(searchFilter),
                  rec: JSON.stringify(searchFilterRec),
                  page: JSON.stringify({limit: 1, page: 1, sort: ''}),
                  other: JSON.stringify({
                    noLimit: 1,
                    adminFlag: 1,
                    noExtendFlag: 1
                  }),
                })
                .subscribe((res: any) => {
                  resolve(res.total);
                });
            });

            m.eventCnt = Number(total);

          })
        );

        const findCnt = this.showClassifyList.find(f=>f.eventCnt>0);
        if (findCnt) { 
          this.router.navigate(['/yuqing-calendar/yuqing-calendar-history-review/history-review-event-classify/event-classify-timeline'], {
            queryParams: { searchMonth: this.searchMonth ,classifyId:this.classifyId, classifyId2: findCnt.id,startDateFieldId:this.startDateFieldId ,postChangeFlag:this.postChangeFlag,templateIds:this.templateIds},
          }); 
        }
        //饼状图数据
        this.classifyPieData =[];
        const classifys = this.showClassifyList.filter(f=>f.id >=0 && f.eventCnt > 0);
        if(classifys.length >0){
          classifys.map(m=>{
            this.classifyPieData.push({x:m.eventClassifyName,y:m.eventCnt});
          })
        }
      
        if (this.showClassifyList.length>0) {
          this.total = this.showClassifyList[0].eventCnt;
        } else {
          this.total="0"
        }
        

      });
        // console.log(this.showClassifyList);
      this.loading = false;
  }

  disabledDate =  (current: Date)=>  {
    if(!current || current.getMonth()!==this.month)
     {
       return true;
      }
    return false;
  };


  async selectChange(l_selectDate: Date, changeMonth: boolean = false) {
    // console.log(l_selectDate)
    this.month = l_selectDate.getMonth();

    this.selectDate = l_selectDate;
    
    if (changeMonth) {
      let newDate = new Date(l_selectDate);
      newDate.setMonth(newDate.getMonth() + 1);
      if(differenceInCalendarDays(newDate,new Date()) >= 0){
        this.next = true;
      }else{
        this.next = false;
      }
      this.searchMonth =this.datePipe.transform(l_selectDate, 'yyyy-MM');
      await this.setDayList(this.searchMonth, this.postChangeFlag,this.templateIds);
      await this.searchShowClassify();
    } else {
      this.router.navigate(['/yuqing-calendar/yuqing-calendar-history-review/history-review-event-classify/event-classify-timeline'], {
        queryParams: {
          searchMonth: this.datePipe.transform(l_selectDate, 'yyyy-MM') ,
          classifyId:this.classifyId,
          classifyId2: -1,
          startDateFieldId:this.startDateFieldId,
          day: this.datePipe.transform(l_selectDate, 'dd'),
          postChangeFlag:this.postChangeFlag,templateIds:this.templateIds
        },
      });
    }
  }

  async setDayList(selectedMonth:string,postChangeFlag:any ,templateIds:any[]) {

    let lastMonth = monthLastDate(new Date(selectedMonth+'-1'));
    if(lastMonth> new Date()) {
      lastMonth = new Date();
    }
    const startTime = this.datePipe.transform(monthFirstDay(new Date(selectedMonth+'-1')), 'yyyy-MM-dd 00:00:00');
    const endTime = this.datePipe.transform(lastMonth, 'yyyy-MM-dd 23:59:59');

    //获取当月事件发生的天
    const searchFilter_day = [];
    searchFilter_day.push({ fieldId: this.startDateFieldId, start: startTime, end: endTime});
    
    const searchFilterRec_day = [];
    if (this.classifyId > 0) {
      searchFilterRec_day.push({ fieldName: "classifyEventId", val: this.classifyId });
    }

    if (this.postChangeFlag != null) {
      searchFilterRec_day.push({ fieldName: "postChangeFlag", val: this.postChangeFlag });
    }

    if(this.templateIds && this.templateIds.length > 0){
      searchFilterRec_day.push({ fieldName: "eventTemplateId", val: this.templateIds ,exp:'in' });
    }

    const page = { limit: 10000, page: 1, sort: '' };
    const other = {noLimit: 1,adminFlag: 1,noExtendFlag: 1,showItems:["发生时间"]};

    const eventList: any = await this.yuqingCalendarService.searchEventList(searchFilter_day
      ,searchFilterRec_day
      ,page
      ,other
      );

    
    this.dayList=[];
    eventList.forEach(it=>{
      this.dayList.push(Number( this.datePipe.transform(it.startDate, 'dd')))
    }) 
    // console.log(this.dayList)
  }



  getLast() {
    let newDate = new Date(this.searchMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    return newDate;
  }

  getNext() {
    let newDate = new Date(this.searchMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    return newDate;
  }
}

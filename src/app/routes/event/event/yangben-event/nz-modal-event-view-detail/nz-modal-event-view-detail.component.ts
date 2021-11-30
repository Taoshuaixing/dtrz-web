import {Component, Input, OnInit} from '@angular/core';
import {CrudService} from "../../../../crud.service";
import {ActivatedRoute, Router} from "@angular/router";
import {NzMessageService} from "ng-zorro-antd/message";
import {FormBuilder} from "@angular/forms";
import {SettingsService} from "@delon/theme";
import {environment} from "@env/environment";
import {YangbenService} from "../../../../yangben/yangben.service";

@Component({
  selector: 'app-nz-modal-event-view-detail',
  templateUrl: './nz-modal-event-view-detail.component.html',
  styleUrls: ['./nz-modal-event-view-detail.component.css'],
})
export class NzModalEventViewDetailComponent implements OnInit {

  constructor(
    private crudService: CrudService,
    private activedrouted: ActivatedRoute,
    private router: Router,
    public msgSrv: NzMessageService,
    private fb: FormBuilder,
    public settingService: SettingsService,
    private yangbenService: YangbenService,
  ) {}

  isVisible = false;
  loading = true;
  fieldList = [];
  // 页面是否变化，用于判断关闭页面之后是否刷新父页面
  isChange= false;

  @Input() btnName: any;
  @Input() recUuid: string;
  @Input() onPage: (parent: any) => Promise<void>;
  @Input() parent: any;
  isFirst = false;
  isLast = false;
  subListOfAllData = [];
  eventName: any;
  eventClassifyId?: number;
  eventStatId?: number;
  eventStatList = [];
  eventStatName:any;
  eventClassifyName:any;
  eventClassifyList = [];

  async ngOnInit() {
    this.searchEventClassify();
    this.searchEventStat();
  }

  searchEventStat(){

    this.crudService
      .searchAll(environment.baseUrl_zxtj + 'api', 'eventStat')
      .subscribe((res: any[]) => {
        for (const item of res) {
          this.eventStatList.push({id:item.id,name:item.eventName});
        }
      });

  }

  searchEventClassify() {
    // 获取所有事件分类
    this.crudService
      .search(environment.baseUrl_zxtj + 'api', 'classifyEvent', {
        sort: ['sortId,ASC'],
        filter: ['deleteFlag||$eq||0'],
      })
      .subscribe((res: any[]) => {
        for (const item of res) {
          this.eventClassifyList.push({id:item.id,name:item.eventClassifyName});

          if(item && item.hasOwnProperty('children' && item.children.length >0)){
            for(const item1 of item.children){
              this.eventClassifyList.push({id:item1.id,name:item1.eventClassifyName});

              if(item1 && item1.hasOwnProperty('children' && item1.children.length >0)){
                for(const item2 of item1.children){
                  this.eventClassifyList.push({id:item2.id,name:item2.eventClassifyName});
                }
              }

            }
          }
        }
      });
  }


  showModal(recUuid: any) {
    this.recUuid = recUuid;
    this.loading = false;
    this.isChange =false;
    this.isVisible = true;
    this.subListOfAllData = this.parent.listOfAllData;
    this.eventName = '';
    this.eventClassifyId =null;
    this.eventStatId =null;
    this.searchFieldList();
    this.getData('');
  }
  async searchFieldList(){
    this.fieldList = await new Promise((resolve, reject) => {
      this.crudService
        .search(environment.baseUrl + 'api', 'yangben-event-field-define', {
          filter: [`deleteFlag||$eq||0`, `showFlag||$eq||1`],
          sort: ['sortId,ASC', 'id,ASC'],
        })
        .subscribe((res: any[]) => {
          resolve(res);
        });
    });

    this.fieldList = await Promise.all(
      this.fieldList.map(async m => {
        return (async () => {
          if (m.yangbenOptionConfig) {
            const data = await this.yangbenService.getTableData(m.yangbenOptionConfig.id);
            return { ...m, fieldId: m.id, targetTableData: data };
          } else {
            return { ...m, fieldId: m.id };
          }
        })();
      }),
    );

    // 获取当前记录
    if (this.recUuid) {
      this.crudService.get(environment.baseUrl + 'api', 'yangben-event/getOne', this.recUuid).subscribe((res: any) => {
        this.eventName = res.rec.name;
        this.eventClassifyId = res.rec.classifyEventId;
        this.eventStatId = res.rec.eventStatId;
        const eventStat = this.eventStatList.find(f=>f.id === this.eventStatId);
        if(eventStat){
          this.eventStatName = eventStat.name;
        } else {
          this.eventStatName = "";
        }

        const eventClassify = this.eventClassifyList.find(f=>f.id === this.eventClassifyId);
        if(eventClassify){
          this.eventClassifyName = eventClassify.name;
        } else {
          this.eventClassifyName = "";
        }


        this.fieldList = this.fieldList.map(m => {
          const curData = res.data.filter(f => f.fieldId === m.id);
          if (curData.length > 0) {
            if (curData[0].valIdMulti) {
              curData[0].valIdMulti = JSON.parse(curData[0].valIdMulti);
            } else if (curData[0].valId) {
              curData[0].valId = Number(curData[0].valId);
            }
            return { ...m, ...curData[0], recUuid: this.recUuid };
          }
          return { ...m, recUuid: this.recUuid };
        }); 
      });
    }
  }


  async getData(falg: string) {
    this.loading = true;
    this.isFirst = false;
    this.isLast = false;
    let currentDataindex = this.subListOfAllData.findIndex(f=> f.recUuid===this.recUuid);

    if(falg === 'previous'){
      this.isChange =true;
      if(this.parent.pageIndex!=1 && currentDataindex ==0){
        this.parent.pageIndex =this.parent.pageIndex-1;
        const res:any = await this.parent.searchSub();
        this.subListOfAllData = res.data;
        this.recUuid = this.subListOfAllData[this.parent.pageSize-1].recUuid;
      }else {
        this.recUuid = this.subListOfAllData[currentDataindex-1].recUuid;
      }

      this.searchFieldList();
      currentDataindex = this.subListOfAllData.findIndex(f=> f.recUuid===this.recUuid);

    }else if(falg === 'next'){
      this.isChange =true;
      if(!((this.parent.pageIndex-1) * this.parent.pageSize + this.parent.listOfAllData.length == this.parent.total) && currentDataindex == this.subListOfAllData.length-1){
        this.parent.pageIndex =this.parent.pageIndex+1;
        const res:any = await this.parent.searchSub();
        this.subListOfAllData = res.data;
        this.recUuid = this.subListOfAllData[0].recUuid;
      }else{
        this.recUuid = this.subListOfAllData[currentDataindex+1].recUuid;
      }

      this.searchFieldList();
      currentDataindex = this.subListOfAllData.findIndex(f=> f.recUuid===this.recUuid);
    }


    if(this.parent.pageIndex ===1 && currentDataindex ===0 ){
      this.isFirst = true;
    }
    if((this.parent.pageIndex-1) * this.parent.pageSize + this.subListOfAllData.length == this.parent.total && currentDataindex + 1 == this.subListOfAllData.length){
      this.isLast = true;
    }

    this.loading = false;
  }

  cancel() {
    if (this.isChange ) {
      this.parent.search();
    }
    this.isVisible =false;

  }

}

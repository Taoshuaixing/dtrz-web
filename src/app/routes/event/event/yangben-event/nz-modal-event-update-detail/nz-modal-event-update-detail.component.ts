import {Component, Input, OnInit} from '@angular/core';
import {CrudService} from "../../../../crud.service";
import {ActivatedRoute, Router} from "@angular/router";
import {environment} from "@env/environment";
import { NzMessageService } from 'ng-zorro-antd/message';
import {FormBuilder} from "@angular/forms";
import {SettingsService} from "@delon/theme";
import {YangbenService} from "../../../../yangben/yangben.service";

@Component({
  selector: 'app-nz-modal-event-update-detail',
  templateUrl: './nz-modal-event-update-detail.component.html',
  styleUrls: ['./nz-modal-event-update-detail.component.css'],
})
export class NzModalEventUpdateDetailComponent implements OnInit {

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
  @Input() selectDate :any;
  @Input() eventTemplateId:any;
  isFirst = false;
  isLast = false;
  subListOfAllData = [];
  eventName: any;
  expandEventClassifyKeys = [];
  eventClassifyId?: number;
  eventClassifyNodes = [];
  eventStatId?: number;
  eventStatList = [];

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

  async searchEventClassify() {
    // 获取所有事件分类，用于下拉
    const treeData:any =await this.yangbenService.searchEventClassify();
    if(treeData){
      this.eventClassifyNodes = treeData.eventClassifyNodes;
      this.expandEventClassifyKeys = treeData.expandEventClassifyKeys;
    }
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
          filter: [`deleteFlag||$eq||0`],
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
    }else{
      this.fieldList.map(m=>{
        if(m.fixName === 'startDate' || m.fixName === 'endDate'){
          m.valDate = this.selectDate
        }
      })
    }
  }



  async submit() {

    if(!this.eventName || this.eventName === ""){
      this.msgSrv.warning('事件名称不能为空！');
      return;
    }

    const checkName = await this.validateEventName(this.eventName);
    if(checkName){
      this.msgSrv.warning('事件名称已存在，请重新输入！');
      return;
    }

    const sDate = this.fieldList.find(f=>f.fixName === 'startDate');
    if(sDate && !sDate.valDate){
      this.msgSrv.warning('发生时间不能为空！');
      return;
    }


    this.fieldList = this.fieldList.map(m => {
      if (m.targetTableData) {
        if (m.valId) {
          const selectedList = m.targetTableData.filter(f => f.id === m.valId);
          if (selectedList.length > 0) {
            m.val = selectedList[0].name;
          }
        } else if (m.valIdMulti) {
          m.valIdMulti.sort((a,b) => a-b);
          const vals = [];
          m.valIdMulti.filter(f1 => {
            const selectedList = m.targetTableData.filter(f => f.id === f1);
            if (selectedList.length > 0) {
              vals.push(selectedList[0].name);
            }
          });
          m.val = vals.join('、');
        }

        if (!m.valId && m.fieldType === 5) {
          m.val ="";
        }
        if (!m.valIdMulti && m.fieldType === 6) {
          m.val ="";
        }

      }

      return m;
    });

    const searchFilterRec = [];
    if(this.eventName){
      searchFilterRec.push({ fieldName: "name", val: this.eventName, exp: 'like' });
    }
    if(this.eventClassifyId){
      searchFilterRec.push({ fieldName: "classifyEventId", val: this.eventClassifyId});
    }


    this.isChange =true;
    if (this.recUuid) {
      // 修改
      await new Promise((resolve, reject) => {
        this.crudService.get(environment.baseUrl + 'api', 'yangben-event/getOne', this.recUuid).subscribe((res: any) => {
          this.crudService
            .put(environment.baseUrl + 'api', 'yangben-event', {
              rec: { ...res.rec, createUser: this.settingService.user.userId,name:this.eventName,classifyEventId:this.eventClassifyId ,eventStatId:this.eventStatId },
              data: this.fieldList,
            })
            .subscribe(res1 => {

              const searchFilter = [];
              searchFilter.push({ fieldName: 'recUuid', val: this.recUuid });
              this.crudService.search(environment.baseUrl + 'api', 'yangben-event', {
                s: JSON.stringify(searchFilter),
                rec:JSON.stringify(searchFilterRec),
                })
                .subscribe((res_new: any) => {
                  this.msgSrv.info('保存成功！');
                  this.loading = false;
                });

            });
        });
      });
    } else {
      // 新增
      this.crudService
        .add(environment.baseUrl + 'api', 'yangben-event', {
          rec: { createUser: this.settingService.user.userId,name:this.eventName,classifyEventId:this.eventClassifyId ,eventStatId:this.eventStatId ,eventTemplateId:this.eventTemplateId,currentStatus:1},
          data: this.fieldList,
        })
        .subscribe((res:any) => {
          this.msgSrv.info('保存成功！');
          this.loading = false;
          this.recUuid = res.recUuid;
          this.searchFieldList();
        });
    }


  }

  async validateFieldList(fieldList: any[]) {

    const md5Str = await new Promise((resolve, reject) => {
      this.crudService
        .add(environment.baseUrl + 'api', 'yangben-event/getFieldListMd5', {
          data: fieldList,
        })
        .subscribe(async (res:any) => {
          resolve(res.md5);
        });
    });
    console.log('md5='+md5Str);

    const filter =  [`md5||$eq||${md5Str}`];
    if(this.recUuid) {
      filter.push(`recUuid||$ne||${this.recUuid}`)
    }
    // 验证MD5是否存在
    const res = await new Promise((resolve, reject) => {
      this.crudService.search(environment.baseUrl + 'api', 'yangben-event-rec', {
        filter: filter,
      }).subscribe((res: any[]) => {
        resolve(res.length>0);
      });
    });
    if (res) {
      return true;
    } else {
      return false;
    }

  }

  async validateEventName(eventName: any) {
    const filter =  [`name||$eq||${this.eventName}`];
    if(this.recUuid) {
      filter.push(`recUuid||$ne||${this.recUuid}`)
    }
    //查询字段名称是否存在
    const res = await new Promise((resolve, reject) => {
      this.crudService.search(environment.baseUrl + 'api', 'yangben-event-rec', {
        filter: filter,
      }).subscribe((res: any[]) => {
        resolve(res.length>0);
      });
    });
    if (res) {
      return true;
    } else {
      return false;
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

    this.recUuid = '';
    this.subListOfAllData = [];
    this.eventName = '';
    this.eventClassifyId =null;
    this.eventStatId =null;
    this.fieldList = [];
  }

  onChange($event: any) {
  }

}

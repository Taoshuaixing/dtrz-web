import {Component, Input, OnInit} from '@angular/core';
import {CrudService} from "../../../../crud.service";
import {ActivatedRoute, Router} from "@angular/router";
import {environment} from "@env/environment";
import { NzMessageService } from 'ng-zorro-antd/message';
import {FormBuilder} from "@angular/forms";
import {SettingsService} from "@delon/theme";
import {YangbenService} from "../../../yangben.service";
import { ACLService } from '@delon/acl';
import * as ClassicEditorBuild from "../../../../../../assets/ckeditor";
import { StorageService } from 'src/app/routes/storage.service';

@Component({
  selector: 'app-nz-modal-view-detail',
  templateUrl: './nz-modal-view-detail.component.html',
  styleUrls: ['./nz-modal-view-detail.component.css'],
})
export class NzModalViewDetailComponent implements OnInit {

  constructor(
    private crudService: CrudService,
    private activedrouted: ActivatedRoute,
    private router: Router,
    public msgSrv: NzMessageService,
    private fb: FormBuilder,
    public settingService: SettingsService,
    private yangbenService: YangbenService,
    private aclService: ACLService,
    private storageService:StorageService,
  ) {}

  isVisible = false;
  loading = true;
  fieldList = [];
  // 页面是否变化，用于判断关闭页面之后是否刷新父页面
  isChange= false;

  @Input() btnName: any;
  recUuid: string;
  @Input() onPage: (parent: any) => Promise<void>;
  @Input() parent: any;
  @Input() shareFlag: number;
  isFirst = false;
  isLast = false;
  subListOfAllData = [];
  saveRefresh:false;
  showPreviousAndNestFlag:number;
  currentSys = environment.currentSys;
  // 岗位ID
  postId = 0;
  adminFlag = 0;
  html = "";
  curRole: any;

  public Editor = ClassicEditorBuild;

  config = {
    // language: 'zh-cn',
    placeholder: '多媒体样本',
    ckfinder: {
      // Upload the images to the server using the CKFinder QuickUpload command.
      uploadUrl: environment.baseUrl + 'api/article/uploadFileBase64',
    },
  };

  fileList:any;
  showUploadList:any= { showPreviewIcon: false, showRemoveIcon: false, showDownloadIcon: true };
 
  async ngOnInit() {
   
  }
  showModal(uuid:any,showPreviousAndNestFlag) {

    this.curRole = this.storageService.curRole;
    this.recUuid=uuid;
    this.showPreviousAndNestFlag = showPreviousAndNestFlag;
    this.postId = this.settingService.user.posts[0].id;
    this.adminFlag = this.curRole.indexOf("dagl_admin")>=0 ? 1: 0;
    
    this.saveRefresh= this.parent.autoRefresh;
    if (this.parent.autoRefresh) {
      this.parent.autoRefresh = false;
    }

    this.loading = false;
    this.isChange =false;
    this.isVisible = true;
    this.subListOfAllData = this.parent.listOfAllData;
    this.searchFieldList();
    this.getData('');
  }
 async searchFieldList(){
   
   
    const fieldList_all:any = await new Promise((resolve, reject) => {
      this.crudService
        .search(environment.baseUrl + 'api', 'yangben-field-define', {
          filter: [`deleteFlag||$eq||0` ],
          sort: ['sortId,ASC', 'id,ASC'],
        })
        .subscribe((res: any[]) => {
          resolve(res);
        });
    });
    if (this.adminFlag ===1 || this.shareFlag===-1) {
       // 管理员
       this.fieldList = fieldList_all.filter(f=>f.showFlag === 1);
    } else {
      let filedList_post:any;
      // 岗位用户
      if (this.shareFlag === 2) {
        filedList_post = await new Promise((resolve, reject) => {
          this.crudService
            .search(environment.baseUrl + 'api', 'yangben-post-field', { 
            sort: [`sortId,ASC`], 
            filter:[
              `postId||$eq||${this.postId}`,
              `shareFlag||$eq||${this.shareFlag === 2 ?1:0}`
          ] })
            .subscribe((res: any[]) => {
                resolve(res);
            })
          });
      } else {
        filedList_post =  (await this.yangbenService.getShowItem_post(this.postId)).fieldList
      }
      
      // 补充
      this.fieldList = filedList_post.map(
        m=>{
          const ff = fieldList_all.find(f=>f.id=== m.fieldId);
          if(ff) {
            return {...ff,}
          }
          return m;
        }

      );

    }
  

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
      this.crudService.get(environment.baseUrl + 'api', 'yangben-data/getOne', this.recUuid).subscribe((res: any) => {
        if(res.rec) {
          this.html = res.rec.html;
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
        // console.log(this.fieldList);

        this.fileList =[];
        if(res.attachmentList && res.attachmentList.length >0){
          for(const att of res.attachmentList){
            this.fileList.push(
              {
                uid: att.id,
                name: att.originalName,
                status: 'done',
                url: `${environment.baseUrl}api/yangben-attachment/download/${att.id}`,
                thumbUrl: `${environment.baseUrl}api/yangben-attachment/download/${att.id}`
              }
            )
          }
        }
      });
    }
  }

 async getData(falg: string) {
    this.loading = true;
    this.isFirst = false;
    this.isLast = false;

    if(this.subListOfAllData.length === 1){
      this.isFirst = true;
      this.isLast = true;
    }

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
      // const totalPage = Math.ceil(this.parent.total/this.parent.pageSize);
      if(!((this.parent.pageIndex-1) * this.parent.pageSize + this.parent.listOfAllData.length === this.parent.total) && currentDataindex === this.subListOfAllData.length-1){
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
    this.parent.autoRefresh = this.saveRefresh;
    this.isVisible =false;
    
  }
}

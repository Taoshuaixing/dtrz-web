import {Component, Input, OnInit} from '@angular/core';
import {CrudService} from '../../../../crud.service';
import {ActivatedRoute, Router} from '@angular/router';
import {environment} from '@env/environment';
import { NzMessageService } from 'ng-zorro-antd/message';
import {FormBuilder} from '@angular/forms';
import {SettingsService} from '@delon/theme';
import {ZhanghaoService} from '../../../zhanghao.service';
import { ACLService } from '@delon/acl';
import * as ClassicEditorBuild from 'src/assets/ckeditor.js';
import {NzUploadChangeParam, NzUploadFile} from "ng-zorro-antd/upload";
import { StorageService } from 'src/app/routes/storage.service';
import {CommonService} from "@shared/service/common-service";

@Component({
  selector: 'app-nz-modal-update-detail',
  templateUrl: './nz-modal-update-detail.component.html',
  styleUrls: ['./nz-modal-update-detail.component.css'],
})
export class NzModalUpdateDetailComponent implements OnInit {

  constructor(
    private crudService: CrudService,
    private activedrouted: ActivatedRoute,
    private router: Router,
    public msgSrv: NzMessageService,
    private fb: FormBuilder,
    public settingService: SettingsService,
    private zhanghaoService: ZhanghaoService,
    private aclService: ACLService,
    private storageService:StorageService,
  ) {}

  isVisible = false;
  loading = true;
  fieldList = [];
  // 页面是否变化，用于判断关闭页面之后是否刷新父页面
  isChange = false;

  @Input() btnName: any;
  recUuid: string;
  @Input() onPage: (parent: any) => Promise<void>;
  @Input() parent: any;
  @Input() shareFlag: number;
  isFirst = false;
  isLast = false;
  subListOfAllData = [];
  showPreviousAndNestFlag:number;

  currentSys = environment.currentSys;
  // 岗位ID
  postId = 0;
  adminFlag = 0;
  html = '';
  public Editor = ClassicEditorBuild;
  config = {
    // language: 'zh-cn',
    placeholder: '多媒体账号',
    ckfinder: {
      // Upload the images to the server using the CKFinder QuickUpload command.
      uploadUrl: environment.baseUrl + 'api/article/uploadFileBase64',
    },
  };
  attachmentActionUrl= environment.baseUrl + 'api/zhanghao-attachment/upload';
  fileList: any=[];
  curRole: any;
  zhanghaoName: any;

  async ngOnInit() {

  }
  showModal(uuid:any,showPreviousAndNestFlag) {

    this.curRole = this.storageService.curRole;
    this.recUuid = uuid;
    this.showPreviousAndNestFlag = showPreviousAndNestFlag;
    this.postId = this.settingService.user.posts[0].id;
    this.adminFlag = this.curRole.indexOf("dagl_admin")>=0 ? 1: 0;
    this.html = '';
    this.zhanghaoName = '';
    this.loading = false;
    this.isChange = false;
    this.isVisible = true;
    this.subListOfAllData = this.parent.listOfAllData;
    this.searchFieldList();
    this.getData('');
  }


 async searchFieldList(){
    const fieldList_all: any = await new Promise((resolve, reject) => {
      this.crudService
        .search(environment.baseUrl + 'api', 'zhanghao-field-define', {
          filter: [`deleteFlag||$eq||0` ],
          sort: ['sortId,ASC', 'id,ASC'],
        })
        .subscribe((res: any[]) => {
          resolve(res);
        });
    });
    if (this.adminFlag ===1 && this.shareFlag===-1) {
       // 管理员
       this.fieldList = fieldList_all.filter(f => f.showFlag === 1);
    } else {
      // 岗位用户
      // const filedList_post:any = await new Promise((resolve, reject) => {
      //   this.crudService
      //     .search(environment.baseUrl + 'api', 'zhanghao-post-field', {
      //     sort: [`sortId,ASC`],
      //     filter:[
      //       `postId||$eq||${this.postId}`,
      //       `shareFlag||$eq||0`
      //   ] })
      //     .subscribe((res: any[]) => {
      //         resolve(res);
      //     })
      //   });
      const filedList_post: any = (await this.zhanghaoService.getShowItem_post(this.postId)).fieldList;

      // 补充
      this.fieldList = filedList_post.map(
        m => {
          const ff = fieldList_all.find(f => f.id === m.fieldId);
          if (ff) {
            return {...ff, };
          }
          return m;
        }

      );

    }


    this.fieldList = await Promise.all(
      this.fieldList.map(async m => {
        return (async () => {
          if (m.zhanghaoOptionConfig) {
            const data = await this.zhanghaoService.getTableData(m.zhanghaoOptionConfig.id);
            return { ...m, fieldId: m.id, targetTableData: data };
          } else {
            return { ...m, fieldId: m.id };
          }
        })();
      }),
    );

    // 获取当前记录
    if (this.recUuid) {

      this.crudService.get(environment.baseUrl + 'api', 'zhanghao-data/getOne', this.recUuid).subscribe((res: any) => {
        if (res.rec) {
          this.html = res.rec.html;
          this.zhanghaoName = res.rec.name;
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
                url: `${environment.baseUrl}api/zhanghao-attachment/download/${att.id}`,
                thumbUrl: `${environment.baseUrl}api/zhanghao-attachment/download/${att.id}`,
              }
            )
          }
        }

      });
    }
  }


  async submit() {

    if(!this.zhanghaoName || this.zhanghaoName === ""){
      this.msgSrv.warning('账号名称不能为空！');
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
          m.valIdMulti.sort((a, b) => a - b);
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
          m.val = '';
        }
        if (!m.valIdMulti && m.fieldType === 6) {
          m.val = '';
        }

      }

      return m;
    });
    // 开始保存

    const checkFieldList = await this.validateFieldList( this.fieldList);
    if (checkFieldList){
      this.msgSrv.warning('输入内容已存在，请重新输入！');
      return;
    }

    this.isChange = true;
      if (this.recUuid) {
      // 修改
      await new Promise((resolve, reject) => {
        this.crudService.get(environment.baseUrl + 'api', 'zhanghao-data/getOne', this.recUuid).subscribe((res: any) => {
          this.crudService
            .put(environment.baseUrl + 'api', 'zhanghao-data', {
              rec: { ...res.rec,
                 createUser: this.settingService.user.userId ,
                 postId: this.postId,
                 html: this.html,
                 name:this.zhanghaoName
                },
              data: this.fieldList,
            })
            .subscribe(res1 => {

              const searchFilter = [];
              searchFilter.push({ fieldName: 'recUuid', val: this.recUuid });
              this.crudService.search(environment.baseUrl + 'api', 'zhanghao-data', {
                  s: JSON.stringify(searchFilter),
                  other: JSON.stringify({
                    postId: this.postId,
                    adminFlag: this.adminFlag,
                    shareFlag: 0,
                  }),
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
        .add(environment.baseUrl + 'api', 'zhanghao-data', {
          rec: {
            createUser: this.settingService.user.userId ,
            postId: this.postId,
            html: this.html,
            name:this.zhanghaoName
          },
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
        .add(environment.baseUrl + 'api', 'zhanghao-data/getFieldListMd5', {
          data: fieldList,
        })
        .subscribe(async (res: any) => {
          resolve(res.md5);
        });
    });
    console.log('md5=' + md5Str);
    if (md5Str) {
      const filter =  [`md5||$eq||${md5Str}`,`name||$eq||${this.zhanghaoName}`];
      if (this.recUuid) {
        filter.push(`recUuid||$ne||${this.recUuid}`);
      }
      // 查询字段名称是否存在
      const res = await new Promise((resolve, reject) => {
        this.crudService.search(environment.baseUrl + 'api', 'zhanghao-data-rec', {
          filter,
        }).subscribe((res: any[]) => {
          resolve(res.length > 0);
        });
      });
      if (res) {
        return true;
      } else {
        return false;
      }
    }
    return false;
  }


 async getData(falg: string) {
    this.fileList =[];
    this.loading = true;
    this.isFirst = false;
    this.isLast = false;
    let currentDataindex = this.subListOfAllData.findIndex(f => f.recUuid === this.recUuid);

    if (falg === 'previous'){
      this.isChange = true;
      if (this.parent.pageIndex != 1 && currentDataindex == 0){
        this.parent.pageIndex = this.parent.pageIndex - 1;
        const res: any = await this.parent.searchSub();
        this.subListOfAllData = res.data;
        this.recUuid = this.subListOfAllData[this.parent.pageSize - 1].recUuid;
      }else {
        this.recUuid = this.subListOfAllData[currentDataindex - 1].recUuid;
      }

      this.searchFieldList();
      currentDataindex = this.subListOfAllData.findIndex(f => f.recUuid === this.recUuid);

    }else if (falg === 'next'){
      this.isChange = true;
      if (!((this.parent.pageIndex - 1) * this.parent.pageSize + this.parent.listOfAllData.length == this.parent.total) && currentDataindex == this.subListOfAllData.length - 1){
        this.parent.pageIndex = this.parent.pageIndex + 1;
        const res: any = await this.parent.searchSub();
        this.subListOfAllData = res.data;
        this.recUuid = this.subListOfAllData[0].recUuid;
      }else{
        this.recUuid = this.subListOfAllData[currentDataindex + 1].recUuid;
      }

      this.searchFieldList();
      currentDataindex = this.subListOfAllData.findIndex(f => f.recUuid === this.recUuid);
    }


    if (this.parent.pageIndex === 1 && currentDataindex === 0 ){
      this.isFirst = true;
    }
    if ((this.parent.pageIndex - 1) * this.parent.pageSize + this.subListOfAllData.length == this.parent.total && currentDataindex + 1 == this.subListOfAllData.length){
      this.isLast = true;
    }

    this.loading = false;
  }

  cancel() {
    if (this.isChange ) {
      this.parent.search();
    }
    this.isVisible = false;

  }

  removeHandle = (file: NzUploadFile) => {
    // if (this.reportStatus === 3) {
    //   return false;
    // }
    return true;
  };


  upLoadChange($event) {
    console.log('$event.type= ' + $event.type);
    if (!$event) {
      return;
    }

    if (
      $event.type === 'success' &&
      $event.fileList.length > 0
    ) {

      this.fileList = this.fileList.map(m=>{
        if(m.response && m.response.attachmentId){
          return{
            uid: m.response.attachmentId,
            name: m.name,
            status: 'done',
            url: `${environment.baseUrl}api/zhanghao-attachment/download/${m.response.attachmentId}`,
            thumbUrl: `${environment.baseUrl}api/zhanghao-attachment/download/${m.response.attachmentId}`,
          }
        }else{
          return m;
        }
      });

      this.msgSrv.create('success', '附件上传成功！');
    }else if($event.type === 'removed'){
      const attachmentId = $event.file.uid;
      this.crudService.del(environment.baseUrl + 'api', 'zhanghao-attachment', attachmentId).subscribe(res => {
        this.msgSrv.create('success', `删除成功`);
      });
    }

  }

}

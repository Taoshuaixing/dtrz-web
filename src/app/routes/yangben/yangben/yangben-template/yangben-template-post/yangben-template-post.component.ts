import { Component, OnInit } from '@angular/core';
import {environment} from "@env/environment";
import {CrudService} from "../../../../crud.service";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import {SettingsService} from "@delon/theme";
import {Router} from "@angular/router";
import { YangbenService } from '../../../yangben.service';

@Component({
  selector: 'app-yangben-template-post',
  templateUrl: './yangben-template-post.component.html',
  styleUrls: ['./yangben-template-post.component.css']
})
export class YangbenTemplatePostComponent implements OnInit {


  constructor(private crudService: CrudService,
              private modalService: NzModalService,
              public settingService: SettingsService,
              public msg: NzMessageService,
              public yangbenService:YangbenService,
              private router: Router,) { }

  listOfAllPost:any=[];
  templatePlaceList:any=[];
  templatePostList:any = [];
  fieldList:any;
  loading: any;

  async ngOnInit() {
    this.fieldList = await this.yangbenService.getAllField()
    this.templatePlaceList = await this.getTemplatePlaceList();
    this.templatePostList = await this.getTemplatePostList();
    this.listOfAllPost = await this.getPostList();
  }

  async getPostList(){
     
    return new Promise((resolve, reject) => {
      this.crudService.searchAll(environment.baseUrl_zxtj + 'api', 'post')
        .subscribe(async (res: any) => { 
          res = res.map(m=> {
            const fItem = this.templatePostList.filter(f=>f.postId === m.id);
            return { ...m, templatePosts:fItem};
          });
          this.loading =false;
          resolve(res)
        });
    });
  }

  async getTemplatePostList() {
   
    return new Promise((resolve, reject) => {
        this.crudService.searchAll(environment.baseUrl + 'api', 'yangben-template-post')
          .subscribe((res: any) => {
            res = res.map(m=> {
              const fItem = this.templatePlaceList.find(f=>f.id === m.placeId);
              return { ...m, templatePlace:fItem};
            });
            this.loading =false;
            resolve(res)
          });
       });
  }

  getTemplatePlaceList() {
   
    

    return new Promise((resolve, reject) => {
      this.crudService.searchAll(environment.baseUrl + 'api', 'yangben-template-place')
        .subscribe(async (res: any) => {
          

          res.forEach(it => {
            it.yangbenTemplatePlaceFields.map(m=>{

              // this.crudService.get(environment.baseUrl + 'api','yangben-field-define',m.fieldId)
              //   .subscribe((res_1:any) => {
              //     m.fieldName = res_1.fieldName;
              //   });

              const field = this.fieldList.find(f=>f.id===m.fieldId);
              if (field) {
                m.fieldName = field.fieldName;
              }

            })
          });

          this.loading = false;
          resolve(res)
        });
    });
  }

  getEditorEmitter(item: any, $event: any) {

  }

  /**
   * 是否存在check
   * @param inputName
   * @param id
   */
  async check(inputName: any, id: number): Promise<boolean> {

    const filter =  [`name||$eq||${inputName}`];

    if (id) {
      filter.push(`id||$ne||${id}`)
    }

    const cnt: number = await new Promise<number>(resolve => {
      this.crudService
        .search(environment.baseUrl + 'api', 'yangben-template-post', {
          filter: filter,
        })
        .subscribe((res: any[]) => {
          resolve(res.length);
        });
    });
    return cnt > 0;
  }

  async waitSearch(parent: any,postItem:any) {

    this.crudService.search(environment.baseUrl + 'api', 'yangben-template-post',{
      filter: [`postId||$eq||${postItem.id}`],
    })
      .subscribe(async (res: any[]) => {
        if(res){
          res = res.map(m=> {
            const fItem = parent.templatePlaceList.find(f=>f.id === m.placeId);
            return { ...m, templatePlace:fItem};
          });
        }
        postItem.templatePosts = res;
        this.loading =false;
      });
  }

  del(placeId: any,postItem:any) {
    this.modalService.confirm({
      nzTitle: `操作删除`,
      nzContent: `<b style="color: red;">确定删除该模板吗？</b>`,
      nzOkType: 'danger',
      nzOnOk: () => {
          this.crudService.add(environment.baseUrl + 'api', 'yangben-template-post/del', {placeId:placeId,postId:postItem.id}).subscribe((res:any) => {
            this.msg.create('success', `删除成功`);
            this.waitSearch(this,postItem);
          });
      },
      nzOnCancel: () => console.log('Cancel'),
    });
  }

}

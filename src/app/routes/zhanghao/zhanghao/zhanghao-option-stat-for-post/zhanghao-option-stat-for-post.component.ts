import { Component, OnInit } from '@angular/core';
import {CrudService} from "../../../crud.service";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import {SettingsService} from "@delon/theme";
import {ActivatedRoute, Router} from "@angular/router";
import {environment} from "@env/environment";
import {ACLService} from "@delon/acl";
import {ZhanghaoService} from "../../zhanghao.service";


@Component({
  selector: 'app-zhanghao-option-stat-for-post',
  templateUrl: './zhanghao-option-stat-for-post.component.html',
  styles: [
  ]
})
export class ZhanghaoOptionStatForPostComponent implements OnInit {
  listOfAllData=[];
  loading: any;
  total =1;
  pageIndex =1;
  pageSize =10;

  searchList = {
    limit: 0,
    page: 1,
    filter: [],
    join:[],
    postId:0
  };

  adminFlag = 0;
  wenziFlag = 0;
  
  fieldList:any;

  constructor(private crudService: CrudService,
              private modalService: NzModalService,
              public settingService: SettingsService,
              private activedrouted: ActivatedRoute,
              public msg: NzMessageService,
              private aclService: ACLService,
              public zhanghaoService:ZhanghaoService,
              private router: Router,) { }

  async ngOnInit() {

    // if (this.aclService.data.roles.indexOf("dagl_admin") >= 0) {
    //   // 管理员
    //   this.adminFlag = 1;
    // } else if (this.aclService.data.roles.indexOf("dagl_editor") >= 0 ){
    //   // 文字岗
    //   this.wenziFlag = 1;
    // } 
    
    
    if(this.aclService.data.roles.indexOf("dagl_post") >= 0 || this.aclService.data.roles.indexOf("dagl_admin") >= 0){
      this.searchList.postId  = this.settingService.user.posts[0].id;
    } 

    this.fieldList = await this.zhanghaoService.getAllField();
    await this.getData();

  }

  async getData(  reset: boolean = false) {
    this.listOfAllData =[];
    this.loading =true;
    this.crudService
      .search(environment.baseUrl + 'api', 'zhanghao-option-config/getParentData','')
      .subscribe(async (res: any) => {
        this.listOfAllData = res;

        for (let i=0;i<this.listOfAllData.length;i++) {
          let item = this.listOfAllData[i];
          const field = this.fieldList.find(f=>f.zhanghaoOptionConfig?.id===item.id);
          if (field) {
            item.field = field;
          }

          this.searchList.filter = [];
 
          this.searchList.filter.push(`parent.id||$eq||${item.id}`);
          this.searchList.join = ['parent'];
          this.searchList.filter.push(`deleteFlag||$eq||0}`);
          this.searchList.limit = this.pageSize;
          this.searchList.page = this.pageIndex;

          const res1: any = await new Promise((resolve, reject) => {
            this.crudService.search(environment.baseUrl + 'api', 'zhanghao-option-config/listByPostId',
              this.searchList

            ).subscribe((res1: any) => {
              resolve(res1)
            });
          });

          this.listOfAllData[i] = {...item, children: res1.data, total: res1.total,pageIndex:this.pageIndex,pageSize:this.pageSize,searchName:''}
        }

        console.log(this.listOfAllData);
        this.loading =false;
      });

  }

  async getData_one( item=null, reset: boolean = false) {

          this.searchList.filter = [];
          this.searchList.join = [];

          this.searchList.filter.push(`parent.id||$eq||${item.id}`);
          this.searchList.join = ['parent'];
          this.searchList.filter.push(`deleteFlag||$eq||0}`);
          this.searchList.limit = item.pageSize;
          this.searchList.page = item.pageIndex;

          if (item.searchName) {
            this.searchList.page = 1;
            this.searchList.filter.push(`name||$cont||${item.searchName}`);
          }

          const res1: any = await new Promise((resolve, reject) => {
            this.crudService.search(environment.baseUrl + 'api', 'zhanghao-option-config/listByPostId',
              this.searchList

            ).subscribe((res1: any) => {
              resolve(res1)
            });
          });
        item.children = res1.data;
        item.total = res1.total;
        // console.log(item.children);
        this.loading =false;
  }

  

 

     

}

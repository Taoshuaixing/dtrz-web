import {Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {CrudService} from "../../../../crud.service";
import {environment} from '@env/environment';

@Component({
  selector: 'app-zhanghao-similar-list',
  templateUrl: './zhanghao-similar-list.component.html',
  styleUrls: ['./zhanghao-similar-list.component.css'],
})
export class ZhanghaoSimilarListComponent implements OnInit {

  constructor(private crudService: CrudService,
              private router: Router,
              private activedrouted: ActivatedRoute,) {}

  isVisible = false;
  loading = true;
  pageIndex = 1;
  pageSize = 20;
  total = 1;
  dataList: any = [];
  fieldInfoList:any =[];
  expandSet = new Set<string>();
  saveRefresh:false;

  recUuid: string;
  similarCnt: number;
  @Input() parent: any;
  @Input() userName: any;
  @Input() postId: number;
  @Input() sourceFlag:number;

  ngOnInit() {

  }

  async showModal(uuid:any ,similarCnt:any,sourceFlag:any){

    this.recUuid = uuid;
    this.similarCnt = similarCnt;
    this.sourceFlag = sourceFlag;
    this.saveRefresh= this.parent.autoRefresh;
    if (this.parent.autoRefresh) {
      this.parent.autoRefresh = false;
    }

    this.loading = false;
    this.isVisible = true;

    this.crudService.get(environment.baseUrl + 'api', 'zhanghao-field-define/fieldInfo', this.postId)
      .subscribe((res: any[]) => {
        this.fieldInfoList =res;
      });

    this.search(true);

  }

  
  async search(reset: boolean = false) {

      this.loading = true;

      if (reset) {
        this.pageIndex = 1;
      }
      this.crudService.add(environment.baseUrl + 'api', 'zhanghao-data-tmp/getSimilarList', {
        recUuid:this.recUuid,
        sourceFlag:this.sourceFlag,
        postId:this.postId,
        limit: this.pageSize, 
        page: this.pageIndex

      }).subscribe((res: any) => {
          this.dataList = res.data;
          this.total = res.total;
          this.loading = false;
      });

    
  }

  onExpandChange(data: any, checked: boolean) {
    if (checked) {
      this.fieldInfoList = this.fieldInfoList.map(m=>{
        const val =data[m.fieldName];
        return{...m,fieldVal:val}
      });
      this.expandSet.add(data);
    } else {
      this.expandSet.delete(data);
    }


  }


  handleCancel() {
    // this.parent.search();
    this.parent.autoRefresh = this.saveRefresh;
    this.isVisible =false;
  }



}

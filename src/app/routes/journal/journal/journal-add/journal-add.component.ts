import {Component, OnInit} from '@angular/core';
import {environment} from "@env/environment";
import {CrudService} from "../../../crud.service";
import {Router} from "@angular/router";
import {NzMessageService} from "ng-zorro-antd/message";
import {SettingsService} from "@delon/theme";

@Component({
  selector: 'app-journal-add',
  templateUrl: './journal-add.component.html',
  styleUrls: ['./journal-add.component.css'],
})
export class JournalAddComponent implements OnInit {

  constructor( private crudService: CrudService,
               private router: Router,
               private settingService: SettingsService,
               public msg: NzMessageService,) { }

  isVisible = false;
  isOkLoading = false;
  loading: any;
  templateList:any;
  postId:any;

  ngOnInit(): void {
    this.postId = this.settingService.user.posts[0].id;
  }

  async showModal() {
    this.isVisible = true;
    this.templateList = await this.getTemplateList();
  }

  async getTemplateList(){

    return  new Promise((resolve, reject) => {
      this.crudService.search(environment.baseUrl + 'api', 'journal-config-template',{
        filter: [`status||$eq||1`,`postId||$eq||${this.postId}`,`deleteFlag||$eq||0`],
        sort:["id,ASC"]
      }).subscribe((res: any[]) => {
        if(res){
          res = res.map(m=>{
            const content =[];
            m.configTemplateDetails.map(it=>{
              content.push(it.contentTitle);
            });
            return {...m,content:content.join("、")};
          });
          resolve(res);
        }
      });
    });
  }


  handleCancel(): void {
    this.isVisible = false;
  }


  async handleOk() {
    this.isVisible = false;
  }


  toDetail(data: any) {
    this.router.navigate(['/journal/journal-detail'], {
      queryParams: {
        templateId: data.id,
        journalId: null ,
        fromBy: 'journal-report'
      },
    });
  }
}

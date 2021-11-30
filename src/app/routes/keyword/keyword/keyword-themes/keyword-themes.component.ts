import {Component, OnInit} from '@angular/core';
import {NzFormatEmitEvent, NzTreeNode} from "ng-zorro-antd/tree";
import {environment} from "@env/environment";
import {CrudService} from "../../../crud.service";
import {SettingsService} from "@delon/theme";
import {NzModalService} from "ng-zorro-antd/modal";
import {NzMessageService} from "ng-zorro-antd/message";


@Component({
  selector: 'app-keyword-themes',
  templateUrl: './keyword-themes.component.html',
  styleUrls: ['./keyword-themes.component.css'],
})
export class KeywordThemesComponent implements OnInit {

  constructor(private crudService: CrudService,
              public settingService: SettingsService,
              public msg: NzMessageService,
              private modalService: NzModalService,) { }

  themesSearchValue: any;
  themesNodes:NzTreeNode[] =[];
  loading: any;

 async ngOnInit(){

   await this.search();
  }

  async search(){
    this.themesNodes = [];
    this.themesNodes = await new Promise((resolve, reject) => {
      this.crudService
        .search(environment.baseUrl + 'api', 'keyword-topic',{
          filter:"parent.id||$isnull",
          join:"parent"
        })
        .subscribe((res: any[]) => {
          console.log("res",res);
          const vals =[];
          if(res){
            res.map(m=>{
              const leafs = [];
              if(m.children.length > 0){
                m.children.map(it=>{
                  leafs.push({ title: it.name, key: it.id, parentId:m.id,isLeaf: true });
                })
              }
              if(leafs.length>0) {
                vals.push({ title: m.name, key: m.id ,children:leafs});
              } else {
                vals.push({ title: m.name, key: m.id, isLeaf: true});
              }

            })
          }
          resolve(vals);
        });
    });
    // console.log("this.themesNodes",this.themesNodes);
  }

  nzEvent(event: NzFormatEmitEvent): void {
    console.log(event);
  }

  getEditorEmitter(item,callbackResult: any) {
    this.loading = true;
    if (callbackResult.inputId) {
      this.crudService.update(environment.baseUrl + 'api', 'keyword-topic', callbackResult.inputId, {
        updateUser: this.settingService.user.userId,
        name: callbackResult.inputName
      })
        .subscribe(res => {
          item.title = callbackResult.inputName;
          this.loading = false;
        });
    } else {
      this.crudService.add(environment.baseUrl + 'api', 'keyword-topic', {
        createUser: this.settingService.user.userId,
        id: 0,
        name: callbackResult.inputName,
        parent: { id: callbackResult.parentId },
      })
        .subscribe((res:any)=> {
          if(item){
            item.children.push(new NzTreeNode({ title: res.name, key: res.id, isLeaf: true },item));
            item.isExpanded = true;
            item.isLeaf = false;
          }else{
            this.search();
          }

        });
    }
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
        .search(environment.baseUrl + 'api', 'keyword-topic', {
          filter: filter,
        })
        .subscribe((res: any[]) => {
          resolve(res.length);
        });
    });
    return cnt > 0;
  }

  del(item:any) {

    this.crudService.search(environment.baseUrl + 'api', 'rule',{
      filter:[`keywordTopic.id||$eq||${Number(item.key)}`],
      join:['rule']
    }).subscribe((res1: any) => {
      if(res1.length > 0){
        this.msg.success('主题已被使用，不可删除');
        return;
      }else{
        this.modalService.confirm({
          nzTitle: '删除数据',
          nzContent: '<b style="color: red;">确定删除此数据吗？</b>',
          nzOkType: 'danger',
          nzOnOk: async () => {
            this.crudService.del(environment.baseUrl + 'api', 'keyword-topic', Number(item.key)).subscribe((res) => {
              this.loading = false;
              this.msg.success('删除成功');

              const parentNode =  item.getParentNode();
              if(parentNode){
                if(parentNode.children.length === 1){
                  parentNode.clearChildren();
                  parentNode.isSelected = true;
                  parentNode.isExpanded = false;
                  parentNode.isLeaf = true;
                }else{
                  item.remove();
                }
              }else{
                this.search();
              }

            });
          },
          nzOnCancel: () => {
            this.loading = false;
          },
        });
      }
    });
  }

}

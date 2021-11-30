import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {TransferItem} from "ng-zorro-antd/transfer";
import {environment} from "@env/environment";
import {CrudService} from "../../../../../crud.service";
import {NzMessageService} from "ng-zorro-antd/message";

@Component({
  selector: 'app-yangben-template-option-field-setting',
  templateUrl: './yangben-template-option-field-setting.component.html',
  styleUrls: ['./yangben-template-option-field-setting.component.css']
})
export class YangbenTemplateOptionFieldSettingComponent implements OnInit {

  constructor(private crudService: CrudService,
              public msg: NzMessageService,) { }

  isVisible: boolean;
  isOkLoading: any;

  @Input() templateId: any;
  @Input() fieldId: any;
  @Input() yangbenOptionConfigParentId: any;
  @Output() editorOk = new EventEmitter();

  list: TransferItem[] = [];


 async showModal() {
    this.isVisible = true;

    this.list = [];
    const allOptionList:any = await new Promise((resolve, reject) => {
      this.crudService.search(environment.baseUrl + 'api', 'yangben-option-config',{
          filter: [`parent.id||$eq||${this.yangbenOptionConfigParentId}`]
        }
      ).subscribe((res1: any) => {
        resolve(res1)
      });
    });

   const templateOptionList:any = await new Promise((resolve, reject) => {
     this.crudService.search(environment.baseUrl + 'api', 'yangben-template-option-field',{
         filter: [`templateId||$eq||${this.templateId}`,`fieldId||$eq||${this.fieldId}`,`optionConfigParentId||$eq||${this.yangbenOptionConfigParentId}`]
       }
     ).subscribe((res: any) => {
       resolve(res)
     });
   });

   console.log(allOptionList);
   console.log(templateOptionList);

   const list2 = [];
   for (let i = 0; i < allOptionList.length; i++) {
     list2.push({
       key: allOptionList[i].id.toString(),
       title: allOptionList[i].name,
       direction: templateOptionList.filter(f=>f.optionConfigId === allOptionList[i].id).length > 0 ? 'right' : undefined
     });
   }

   this.list = list2;
   // console.log("this.list=",this.list)
  }

  ngOnInit(): void {

  }

  // tslint:disable-next-line:no-any
  filterOption(inputValue: string, item: any): boolean {
    return item.title.indexOf(inputValue) > -1;
  }

  search(ret: {}): void {
    console.log('nzSearchChange', ret);
  }

  select(ret: {}): void {
    console.log('nzSelectChange', ret);
  }

  change(ret: {}): void {
    console.log('nzChange', ret);
  }

  handleCancel() {
    this.isVisible = false;
  }

  handleOk() {
    const saveList = [];

    const selectList  = this.list.filter(f=>f.direction === 'right');
    if(selectList.length > 0){
      selectList.map(m=>{
        saveList.push({
          id: 0,
          templateId: Number(this.templateId),
          fieldId: Number(this.fieldId),
          optionConfigParentId: Number(this.yangbenOptionConfigParentId),
          optionConfigId: Number(m.key)
        });
      })
    }

    this.crudService
      .add(environment.baseUrl + 'api', 'yangben-template-option-field/saveBatch', {
        yangbenTemplateOptionFields: saveList,
        templateId: Number(this.templateId),
        fieldId: Number(this.fieldId),
      })
      .subscribe((res) => {
        this.msg.create('success', `设置成功！`);
      });

    // 传递结果给父页面
    this.editorOk.emit({
      selectCnt: selectList.length,
    });

    this.isVisible = false;
  }

}

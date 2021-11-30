import {Component, Input, OnInit} from '@angular/core';
import {environment} from '@env/environment';
import {NzMessageService} from 'ng-zorro-antd/message';
import {Observable, Observer} from 'rxjs';
import {CrudService} from 'src/app/routes/crud.service';
import {ExcelDownloadService} from 'src/app/routes/excelDownload.service';

@Component({
  selector: 'app-yangben-event-modal-import',
  templateUrl: './yangben-event-modal-import.component.html',
  styles: []
})
export class YangbenEventModalImportComponent implements OnInit {
  isVisible = false;
  isOkLoading = false;
  fieldList = [];
  templatePlaceList=[];
  loading: any;
  @Input() postId : number;
  @Input() userId : number;
  @Input() parent : any;
  @Input() onWaitSearch: (parent: any) => Promise<void>;
  actionUrl = environment.baseUrl + 'api/yangben-event/upload';
  showUploadList = false;
  uploadLoading = false;

  constructor(private crudService: CrudService,
              private excelService: ExcelDownloadService,
              public msg: NzMessageService,
  ) { }

  ngOnInit() {
  }

  async showModal(): Promise<void> {
    this.isOkLoading = false;
    await this.getTemplatePlaceList();

    this.fieldList =  await new Promise((resolve, reject) => {
      this.crudService
        .search(environment.baseUrl + 'api', 'yangben-event-field-define', { sort: [`id,ASC`] })
        .subscribe((res: any[]) => {
          resolve(res)
        });

    });

    this.isVisible = true;
  }

  getTemplatePlaceList() {
    this.templatePlaceList =[];
    return new Promise((resolve, reject) => {
      this.crudService.searchAll(environment.baseUrl + 'api', 'yangben-event-template-place')
        .subscribe(async (res: any) => {
          this.templatePlaceList = res;
          this.loading = false;
          resolve()
        });
    });
  }


  handleCancel(): void {
    this.isVisible = false;
  }


  async handleOk() {
    this.isVisible = false;
  }


  async downloadTemplate(templatePlace:any){

    if (!(templatePlace &&　templatePlace.yangbenEventTemplatePlaceFields.length >0)) {
      this.msg.error('当前模板未配置字段！');
      return;
    }

    templatePlace.yangbenEventTemplatePlaceFields = templatePlace.yangbenEventTemplatePlaceFields.map(m=>{

      const field = this.fieldList.find(f=>f.id===m.fieldId);
      if (field.yangbenOptionConfig) {
        return {...m
          ,fieldName:field.fieldName
          ,fieldType:field.fieldType
          ,yangbenOptionConfigId: field.yangbenOptionConfig.id
          ,targetTableName:field.yangbenOptionConfig.targetTable}
      }
      return {...m,fieldName:field.fieldName,fieldType:field.fieldType }

    });
    this.excelService.download('event', 'api/yangben-event/downloadTemplate', {
      yangbenEventFieldDefines: JSON.stringify(templatePlace.yangbenEventTemplatePlaceFields),
      postId:this.postId,
      templateName:templatePlace.name,
    },true);

  }

  beforeUpload = (file: File) => {
    const fileName:any = file.name;
    return new Observable((observer: Observer<boolean>) => {
      // const isExcel =  file.type.indexOf('excel') >= 0 || file.type.indexOf('spreadsheetml') >= 0;
      const isExcel = /(xls|xlsx)$/i.test(fileName)
      if (!isExcel) {
        this.msg.error('只能导入Excel类型的文件！');
        observer.complete();
        return;
      }

      observer.next(isExcel);
      observer.complete();
    });
  };

  async uploadChange($event: any) {
    if (!$event) {
      return;
    }

    this.showUploadList = true;
    this.uploadLoading = true;

    if ($event.type === 'success') {
      this.showUploadList = false;
      this.uploadLoading = false;
      $event.fileList.pop();

    } else if ($event.type === 'error') {
      this.msg.create('error', '上传失败！');
      this.showUploadList = false;
      this.uploadLoading = false;
      $event.fileList.pop();
    }

    if ($event.type === 'success' || $event.type === 'error') {
      this.isVisible = false;
      await this.onWaitSearch(this.parent);
    }
  }
}

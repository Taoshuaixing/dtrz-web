import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import { Observable, Observer } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-avatar-uploader',
  templateUrl: './avatar-uploader.component.html',
})
export class AvatarUploaderComponent implements OnInit, OnChanges {
  @Input() baseUrl = '';
  @Input() subUrl = '';
  @Input() maxlength = 1;
  @Input() uploadTitle = '上传头像';
  showUploadList = {
    showPreviewIcon: true,
    showRemoveIcon: true,
    hidePreviewIconInNonImage: true,
  };
  @Input() fileList = [];
  @Output() uploaderChange = new EventEmitter<any>();
  previewImage: string | undefined = '';
  previewVisible = false;
  headers = { ticket: this.cookieService.get('ticket') };
  uploadUrl = this.baseUrl + this.subUrl;
  handlePreview = (file: NzUploadFile) => {
    this.previewImage = file.url || file.thumbUrl;
    this.previewVisible = true;
  };

  constructor(private cookieService: CookieService, public msg: NzMessageService) {}

  ngOnInit() {
    this.uploadUrl = this.baseUrl + this.subUrl;
  }

  ngOnChanges() {
    this.uploadUrl = this.baseUrl + this.subUrl;
  }

  onUploaderChange(upInfo: any) {
    this.uploaderChange.emit(upInfo);
  }

  beforeUpload = (file: File) => {
    const fileName: any = file.name;
    return new Observable((observer: Observer<boolean>) => {
      // const isExcel =  file.type.indexOf('excel') >= 0 || file.type.indexOf('spreadsheetml') >= 0;
      const isExcel = /(jpg|png)$/i.test(fileName);
      if (!isExcel) {
        observer.complete();
        this.msg.error('只能导入jpg/png类型的文件！');
        return;
      } else {
        observer.next(isExcel);
        observer.complete();
      }
    });
  };
}

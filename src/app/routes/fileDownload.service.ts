import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import {NzMessageService} from "ng-zorro-antd/message";

@Injectable()
export class FileDownloadService {
  constructor(private http: HttpClient, private datePipe: DatePipe,public msg: NzMessageService,) {}

  loading = true;

  async download(fileName: string, ext: string, subUrl: string, params: any) {
    this.loading = true;
    const msgId = this.msg.loading('文档生成中，请您耐心等待！', { nzDuration: 0 }).messageId;
    const p = await new Promise((resolve, reject) => {
      this.http
        .get(environment.baseUrl + subUrl, {
          params,
          responseType: 'blob',
          headers: new HttpHeaders().append('Content-Type', 'application/json'),
        })
        .subscribe(
          (resp) => {
            // resp: 文件流
            this.downloadFile(resp, fileName, ext);
            this.loading = false;
            this.msg.remove(msgId);
            resolve(true);
          },
          (error1) => {
            reject(false);
            this.loading = false;
          },
        );
    });
  }

  downloadFile(data, name, ext) {
    // 下载类型 xls
    const contentType = 'application/octet-stream';

    const blob = new Blob([data], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    // 打开新窗口方式进行下载
    // window.open(url);

    // 以动态创建a标签进行下载
    const a = document.createElement('a');
    // const fileName = name + '_' + this.datePipe.transform(new Date(), 'yyyyMMdd');
    a.href = url;
    // a.download = fileName;
    //
    if (ext) {
      a.download = name + '.' + ext;
    } else {
      a.download = name;
    }

    a.click();
    window.URL.revokeObjectURL(url);
  }
}

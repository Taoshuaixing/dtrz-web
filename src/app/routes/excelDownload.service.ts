import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { NzMessageService } from 'ng-zorro-antd/message';

@Injectable()
export class ExcelDownloadService {
  constructor(private http: HttpClient, private datePipe: DatePipe, public msg: NzMessageService) {}

  loading = true;

  async download(fileName: string, subUrl: string, params: any, extendFileName = true) {
    this.loading = true;
    const msgId = this.msg.loading('操作中，请您耐心等候......', { nzDuration: 0 }).messageId;
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
            this.downloadFile(resp, fileName, extendFileName);
            this.loading = false;
            this.msg.remove(msgId);
            resolve(true);
          },
          (error1) => {
            reject(false);
            this.loading = false;
            this.msg.remove(msgId);
          },
        );
    });
  }

  async downloadByPost(fileName: string, subUrl: string, params: any, extendFileName = true) {
    this.loading = true;
    const msgId = this.msg.loading('操作中，请您耐心等候......', { nzDuration: 0 }).messageId;
    const p = await new Promise((resolve, reject) => {
      this.http
        .post(environment.baseUrl + subUrl, params, {
          responseType: 'blob',
          headers: new HttpHeaders().append('Content-Type', 'application/json'),
        })
        .subscribe(
          (resp) => {
            // resp: 文件流
            this.downloadFile(resp, fileName, extendFileName);
            this.loading = false;
            this.msg.remove(msgId);
            resolve(true);
          },
          (error1) => {
            reject(false);
            this.loading = false;
            this.msg.remove(msgId);
          },
        );
    });
  }

  downloadFile(data, name, extendFileName) {
    // 下载类型 xls
    const contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    const blob = new Blob([data], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    // 打开新窗口方式进行下载
    // window.open(url);

    // 以动态创建a标签进行下载
    const a = document.createElement('a');
    let fileName;
    if (extendFileName) {
      fileName = name + '_' + this.datePipe.transform(new Date(), 'yyyyMMdd');
    } else {
      fileName = name;
    }

    a.href = url;
    // a.download = fileName;
    a.download = fileName + '.xlsx';
    a.click();
    window.URL.revokeObjectURL(url);
  }
}

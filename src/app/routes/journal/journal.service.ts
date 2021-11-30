import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { CrudService } from '../crud.service';
import { FileDownloadService } from '../fileDownload.service';
import { DatePipe } from '@angular/common';
import { NzMessageService } from 'ng-zorro-antd/message';

@Injectable()
export class JournalService {
  constructor(
    private crudService: CrudService,
    public msg: NzMessageService,
    private datePipe: DatePipe,
    private fileDownloadService: FileDownloadService,
  ) {}

  async getOtherPost() {
    const postList: any = await new Promise((resolve, reject) => {
      this.crudService.search(environment.baseUrl_zxtj + 'api', 'post', {}).subscribe((res: any[]) => {
        resolve(res);
      });
    });
    return postList;
  }

  async getEventTemplateList() {
    const eventTemplateList: any = await new Promise((resolve, reject) => {
      this.crudService
        .searchAll(environment.baseUrl + 'api', 'yangben-event-template-place')
        .subscribe((res: any[]) => {
          const eventTmplateList = [];
          res.map((m) => {
            eventTmplateList.push({ id: m.id, name: m.name });
          });
          resolve(eventTmplateList);
        });
    });
    return eventTemplateList;
  }

  download(ids: any) {
    this.fileDownloadService.download(
      '日志_' + this.datePipe.transform(new Date(), 'yyyyMMdd'),
      'zip',
      'api/' + `journal-data/downloadToDoc/${ids}`,
      {},
    );
  }
}

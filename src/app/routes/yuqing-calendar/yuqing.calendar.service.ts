import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CrudService } from '../crud.service';
import { environment } from '@env/environment';
import { toDate } from '@delon/util';
import { YangbenService } from '../yangben/yangben.service';

@Injectable()
export class YuqingCalendarService {
  constructor(private http: HttpClient, private crudService: CrudService, private yangbenService: YangbenService) {}

  async searchEventList(searchFilter: any, searchFilterRec: any, page: any, other: any) {
    const eventList: any = await new Promise((resolve, reject) => {
      this.crudService
        .search(environment.baseUrl + 'api', 'yangben-event', {
          s: JSON.stringify(searchFilter),
          rec: JSON.stringify(searchFilterRec),
          page: JSON.stringify(page),
          other: JSON.stringify(other),
        })
        .subscribe((res: any) => {
          resolve(res.data);
        });
    });

    if (eventList.length > 0) {
      const fieldList = await this.getFieldList();
      const fixFieldList = fieldList.filter((f) => f.fixFlag === 1);
      eventList.map((m) => {
        fixFieldList.map((f) => {
          let val = m[f.fieldName];
          if (val) {
            if (f.fixName === 'startDate' || f.fixName === 'endDate') {
              val = toDate(val);
            }
            m[f.fixName] = val;
          }
        });
      });
    }

    return eventList;
  }

  async getFieldList(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.crudService
        .search(environment.baseUrl + 'api', 'yangben-event-field-define', {
          filter: [`deleteFlag||$eq||0`],
          sort: ['sortId,ASC', 'id,ASC'],
        })
        .subscribe((res: any) => {
          resolve(res);
        });
    });
  }

  async getEventFieldList() {
    const fieldList = await this.getFieldList();
    const fieldListEx: any = await Promise.all(
      fieldList.map(async (m) => {
        return (async () => {
          if (m.yangbenOptionConfig) {
            const data = await this.yangbenService.getTableData(m.yangbenOptionConfig.id);
            return { ...m, targetTableData: data };
          } else {
            return m;
          }
        })();
      }),
    );

    return fieldListEx;
  }

  async searchEventClassify() {
    // 获取所有事件分类，用于下拉
    const eventClassify = await new Promise((resolve, reject) => {
      this.crudService
        .search(environment.baseUrl_zxtj + 'api', 'classifyEvent', {
          sort: ['sortId,ASC'],
          filter: ['deleteFlag||$eq||0', `parentId||$isnull`],
        })
        .subscribe((res: any[]) => {
          resolve(res);
        });
    });

    return eventClassify;
  }

  getSensitivity(sensitivity: any) {
    //计算敏感度
    if (sensitivity) {
      const mgd = Number(sensitivity);
      const mgd1 = Math.round(mgd / 10);
      return mgd1 / 2;
    }
    return 0;
  }

  getEventTemplateList(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.crudService
        .searchAll(environment.baseUrl + 'api', 'yangben-event-template-place')
        .subscribe((res: any[]) => {
          const eventTmplateList = [];
          eventTmplateList.push({ id: 0, name: '无模板' });
          res.map((m) => {
            eventTmplateList.push({ id: m.id, name: m.name });
          });
          resolve(eventTmplateList);
        });
    });
  }
}

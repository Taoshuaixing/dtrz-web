import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../../environments/environment';
import { CrudService } from '../crud.service';
import { DatePipe } from '@angular/common';
import { CommonService } from '@shared/service/common-service';

@Injectable()
export class ZhanghaoService {
  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
    private crudService: CrudService,
    private datePipe: DatePipe,
    private commonService: CommonService,
  ) {}

  async getTableData(zhanghaoOptionConfigId: number) {
    const tableData = new Promise((resolve, reject) => {
      if (zhanghaoOptionConfigId) {
        this.crudService
          .search(environment.baseUrl + 'api', 'zhanghao-option-config/getTargetData', {
            optionConfigId: zhanghaoOptionConfigId,
          })
          .subscribe((res: any[]) => {
            resolve(res);
          });
      } else {
        resolve([]);
      }
    });
    return tableData;
  }

  /**
   * 读取显示项和已选中的项
   *  默认：全部字段
   */
  async getShowItem(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.crudService
        .search(environment.baseUrl + 'api', 'zhanghao-field-define', { sort: [`id,ASC`] })
        .subscribe((res: any[]) => {
          let fieldList: any[] = res;
          const checkedList: any[] = [];
          fieldList = fieldList.map((m) => {
            if (m.showFlag === 1) {
              checkedList.push(m);
            }
            return { ...m, checked: m.showFlag === 1 ? true : false };
          });
          checkedList.sort((a: any, b: any) => {
            return a.sortId - b.sortId;
          });

          resolve({ fieldList, checkedList });
        });
    });
  }

  /**
   * 普通岗 (该岗下的所有字段)
   * @param postId 岗位ID
   */
  async getShowItem_post(postId: any): Promise<any> {
    const postAndPlaceList: any[] = await new Promise((resolve, reject) => {
      this.crudService
        .search(environment.baseUrl + 'api', 'zhanghao-template-post', { filter: [`postId||$eq||${postId}`] })
        .subscribe((res: any[]) => {
          resolve(res);
        });
    });

    const placeList = [];
    for (const place of postAndPlaceList) {
      const curPlace = await new Promise((resolve, reject) => {
        this.crudService
          .get(environment.baseUrl + 'api', 'zhanghao-template-place', place.placeId)
          .subscribe((res: any[]) => {
            resolve(res);
          });
      });
      placeList.push(curPlace);
    }

    // console.log("this.placeLis",this.placeList)
    const fieldList_all = await this.getAllField();

    const fieldList = [];
    const existField = [];
    const checkedFields: any = await this.getShowCheckedField(postId, 0);
    const checkedList = [];
    placeList.map((m) => {
      m.zhanghaoTemplatePlaceFields.forEach((m1) => {
        const ff = checkedFields.find((f) => f.fieldId === m1.fieldId);
        if (existField.indexOf(m1.fieldId) < 0) {
          existField.push(m1.fieldId);
          const fieldInfo = this.findField(m1.fieldId, fieldList_all);

          const showFlag = ff && ff.showFlag === 1 ? true : false;
          if (showFlag) {
            checkedList.push({ ...fieldInfo, sortId: ff.sortId });
          }
          fieldList.push({ ...fieldInfo, fieldId: m1.fieldId, checked: showFlag });
        }
      });
    });

    checkedList.sort((a: any, b: any) => {
      return a.sortId - b.sortId;
    });

    return { fieldList, checkedList };
  }

  findField(fieldId: number, fieldList: any) {
    return fieldList.find((f) => f.id === fieldId);
  }

  /**
   *  * 分享给我的
   * @param postId 岗位ID
   */
  async getShowItem_shareMe(postId: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const checkedList = [];
      this.crudService
        .search(environment.baseUrl + 'api', 'zhanghao-field-define', { sort: [`id,ASC`] })
        .subscribe(async (res: any[]) => {
          let fieldList = res;
          const checkedFields: any = await this.getShowCheckedField(postId, 1);

          fieldList = fieldList.map((m) => {
            const ff = checkedFields.find((f) => f.fieldId === m.id);
            if (ff && ff.showFlag === 1) {
              checkedList.push({ ...ff, id: ff.fieldId, fieldName: m.fieldName });
            }
            return { ...m, checked: (ff && ff.showFlag) === 1 ? true : false };
          });
          checkedList.sort((a: any, b: any) => {
            return a.sortId - b.sortId;
          });
          resolve({ fieldList, checkedList });
        });
    });
  }

  getShowCheckedField(postId: any, shareFlag: any) {
    return new Promise((resolve, reject) => {
      this.crudService
        .search(environment.baseUrl + 'api', 'zhanghao-post-field', {
          sort: [`sortId,ASC`],
          filter: [`postId||$eq||${postId}`, `shareFlag||$eq||${shareFlag}`],
        })
        .subscribe((res: any[]) => {
          resolve(res);
        });
    });
  }

  getSearchCheckedField(postId: any, shareFlag: any) {
    return new Promise((resolve, reject) => {
      this.crudService
        .search(environment.baseUrl + 'api', 'zhanghao-post-field-search', {
          sort: [`id,ASC`],
          filter: [`postId||$eq||${postId}`, `shareFlag||$eq||${shareFlag}`],
        })
        .subscribe((res: any[]) => {
          resolve(res);
        });
    });
  }

  getAllField() {
    return new Promise((resolve, reject) => {
      this.crudService
        .search(environment.baseUrl + 'api', 'zhanghao-field-define', { sort: [`id,ASC`] })
        .subscribe((res: any[]) => {
          resolve(res);
        });
    });
  }
}

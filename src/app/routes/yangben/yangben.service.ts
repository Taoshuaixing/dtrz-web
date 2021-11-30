import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {CookieService} from 'ngx-cookie-service';
import {environment} from '../../../environments/environment';
import {CrudService} from '../crud.service';
import {DatePipe} from '@angular/common';
import {CommonService} from '@shared/service/common-service';

@Injectable()
export class YangbenService {
  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
    private crudService: CrudService,
    private datePipe: DatePipe,
    private commonService: CommonService,
  ) {
  }

  async getTableData(yangbenOptionConfigId: number,postId =0) {
    let tableData:any = await new Promise((resolve, reject) => {
      if (yangbenOptionConfigId) {
        this.crudService
          .search(environment.baseUrl + 'api', 'yangben-option-config/getTargetData', {
            optionConfigId: yangbenOptionConfigId,
            postId:postId
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

  async searchEventClassify() {
    const treeData = new Promise((resolve, reject) => {
      const expandEventClassifyKeys = [];
      let eventClassifyNodes = [];
      // 获取所有事件分类，用于下拉
      this.crudService
        .search(environment.baseUrl_zxtj + 'api', 'classifyEvent', {
          sort: ['sortId,ASC'],
          filter: ['deleteFlag||$eq||0', `parentId||$isnull`],
        })
        .subscribe((res: any[]) => {
          for (const item of res) {
            item.title = item.eventClassifyName;
            item.key = item.id;
            if (!item.children || item.children.length === 0) {
              item.isLeaf = true;
            } else {
              item.children = item.children.filter((it) => it.deleteFlag === 0);
              item.children.sort((a: any, b: any) => {
                return a.sortId - b.sortId;
              });

              for (const item1 of item.children) {
                item1.title = item1.eventClassifyName;
                item1.key = item1.id;
                expandEventClassifyKeys.push(item1.id);

                if (!item1.children || item1.children.length === 0) {
                  item1.isLeaf = true;
                } else {
                  item1.children = item1.children.filter((it) => it.deleteFlag === 0);
                  item1.children.sort((a: any, b: any) => {
                    return a.sortId - b.sortId;
                  });

                  for (const item2 of item1.children) {
                    item2.title = item2.eventClassifyName;
                    item2.key = item2.id;
                    item2.isLeaf = true;
                  }
                }
              }
            }
            expandEventClassifyKeys.push(item.id);
          }
          eventClassifyNodes = res;

          resolve({eventClassifyNodes, expandEventClassifyKeys});
        });
    });

    return treeData;
  }

  /**
   * 读取显示项和已选中的项
   *  默认：全部字段
   */
  async getShowItem(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.crudService
        .search(environment.baseUrl + 'api', 'yangben-field-define', {sort: [`id,ASC`]})
        .subscribe((res: any[]) => {
          let fieldList: any[] = res;
          const checkedList: any[] = [];
          fieldList = fieldList.map((m) => {
            if (m.showFlag === 1) {
              checkedList.push(m);
            }
            return {...m, checked: m.showFlag === 1 ? true : false};
          });
          checkedList.sort((a: any, b: any) => {
            return a.sortId - b.sortId;
          });

          resolve({fieldList, checkedList});
        });
    });
  }

  // /**
  //  * 普通岗 (基于模板展示)
  //  * @param postId 岗位ID
  //  */
  // async getShowItem_post(postId:any):Promise<any> {

  //   const postAndPlaceList:any[] = await new Promise((resolve, reject) => {
  //     this.crudService
  //       .search(environment.baseUrl + 'api', 'yangben-template-post',{filter:[`postId||$eq||${postId}`]})
  //       .subscribe((res: any[]) => {
  //         resolve(res);
  //       });
  //   });

  //   const placeList=[];
  //   for(const place of postAndPlaceList) {
  //      const curPlace =  await new Promise((resolve, reject) => {
  //       this.crudService
  //       .get(environment.baseUrl + 'api', 'yangben-template-place',place.placeId)
  //       .subscribe((res: any[]) => {
  //         resolve(res);
  //       });

  //     });
  //     placeList.push(curPlace);
  //   }

  //   // console.log("this.placeLis",this.placeList)

  //   const checkedFields:any = await this.getShowCheckedField(postId,0);
  //   const checkedList = []
  //   placeList.map(m=>{
  //     m.yangbenFieldDefines = m.yangbenFieldDefines.map(m1=>{

  //       const ff = checkedFields.find(f=>f.fieldId === m1.id && f.placeId === m.id);
  //       const showFlag = (ff && ff.showFlag === 1)  ? true:false
  //       if (showFlag) {
  //         checkedList.push({...m1,sortId:ff.sortId, placeId:m.id});
  //       }

  //       return { ...m1, placeId:m.id, checked: showFlag};
  //     })
  //     return m;
  //   })

  //   checkedList.sort((a: any, b: any) => {
  //     return a.sortId - b.sortId;
  //   });

  //   return {placeList,checkedList}

  // }

  /**
   * 普通岗 (该岗下的所有字段)
   * @param postId 岗位ID
   */
  async getShowItem_post(postId: any): Promise<any> {
    const postAndPlaceList: any[] = await new Promise((resolve, reject) => {
      this.crudService
        .search(environment.baseUrl + 'api', 'yangben-template-post', {filter: [`postId||$eq||${postId}`]})
        .subscribe((res: any[]) => {
          resolve(res);
        });
    });

    const placeList = [];
    for (const place of postAndPlaceList) {
      const curPlace = await new Promise((resolve, reject) => {
        this.crudService
          .get(environment.baseUrl + 'api', 'yangben-template-place', place.placeId)
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
      m.yangbenTemplatePlaceFields.forEach((m1) => {
        const ff = checkedFields.find((f) => f.fieldId === m1.fieldId);
        if (existField.indexOf(m1.fieldId) < 0) {
          existField.push(m1.fieldId);
          const fieldInfo = this.findField(m1.fieldId, fieldList_all);

          const showFlag = ff && ff.showFlag === 1 ? true : false;
          if (showFlag) {
            checkedList.push({...fieldInfo, sortId: ff.sortId});
          }
          fieldList.push({...fieldInfo, fieldId: m1.fieldId, checked: showFlag});
        }
      });
    });

    checkedList.sort((a: any, b: any) => {
      return a.sortId - b.sortId;
    });

    return {fieldList, checkedList};
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
        .search(environment.baseUrl + 'api', 'yangben-field-define', {sort: [`id,ASC`]})
        .subscribe(async (res: any[]) => {
          let fieldList = res;
          const checkedFields: any = await this.getShowCheckedField(postId, 1);

          fieldList = fieldList.map((m) => {
            const ff = checkedFields.find((f) => f.fieldId === m.id);
            if (ff && ff.showFlag === 1) {
              checkedList.push({...ff, id: ff.fieldId, fieldName: m.fieldName});
            }
            return {...m, checked: (ff && ff.showFlag) === 1 ? true : false};
          });
          checkedList.sort((a: any, b: any) => {
            return a.sortId - b.sortId;
          });
          resolve({fieldList, checkedList});
        });
    });
  }

  getShowCheckedField(postId: any, shareFlag: any) {
    return new Promise((resolve, reject) => {
      this.crudService
        .search(environment.baseUrl + 'api', 'yangben-post-field', {
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
        .search(environment.baseUrl + 'api', 'yangben-post-field-search', {
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
        .search(environment.baseUrl + 'api', 'yangben-field-define', {sort: [`id,ASC`]})
        .subscribe((res: any[]) => {
          resolve(res);
        });
    });
  }

  getAllEventField() {
    return new Promise((resolve, reject) => {
      this.crudService
        .search(environment.baseUrl + 'api', 'yangben-event-field-define', {sort: [`id,ASC`]})
        .subscribe((res: any[]) => {
          resolve(res);
        });
    });
  }

  getEventFieldId() {
    return new Promise((resolve, reject) => {
      this.crudService
        .search(environment.baseUrl + 'api', 'yangben-event/getEventFieldId', {})
        .subscribe((res: any[]) => {
          resolve(res);
        });
    });
  }

  async getSignList() {
    const options = [];

    const signList: any = await new Promise((resolve, reject) => {
      this.crudService.searchAll(environment.baseUrl + 'api', 'yangben-event/getSignList').subscribe((res: any[]) => {
        resolve(res);
      });
    });

    if (signList) {
      for (const items of signList) {
        const object = {value: '', label: '', children: []};
        object.value = items.id;
        object.label = items.fieldName;
        for (const tableData of items.targetTableData) {
          const leaf = {value: '', label: '', isLeaf: true};
          leaf.value = tableData.id;
          leaf.label = tableData.name;

          object.children.push(leaf);
        }
        options.push(object);
      }
    }

    return options;
  }

  /**
   * 数据统计
   */
  getStatsService(params:any){
    return this.http.post(environment.baseUrl+'api/yangben-stat/data-stat',params)
  }
  exportDataService(params:any){
    return this.http.post(environment.baseUrl+'api/yangben-stat/data-stat/xls',params)
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { DatePipe } from '@angular/common';
import { DisabledTimeFn, DisabledTimePartial } from 'ng-zorro-antd/date-picker/standard-types';

@Injectable()
export class CommonService {
  constructor(private http: HttpClient, private cookieService: CookieService, private datePipe: DatePipe) {}

  getOneDay19() {
    const yesterday = new Date();
    const today = new Date();
    const tomorrow = new Date();

    yesterday.setDate(yesterday.getDate() - 1);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // console.log((new Date()).getHours())
    if (new Date().getHours() >= 19) {
      return [
        this.datePipe.transform(today, 'yyyy-MM-dd 19:00:00'),
        this.datePipe.transform(tomorrow, 'yyyy-MM-dd 19:00:00'),
      ];
    }
    return [
      this.datePipe.transform(yesterday, 'yyyy-MM-dd 19:00:00'),
      this.datePipe.transform(today, 'yyyy-MM-dd 19:00:00'),
    ];
  }

  getDateRange(dateRange: any, withTime = false) {
    const res = { start: null, end: null };
    if (withTime) {
      res.start = dateRange[0] ? this.datePipe.transform(dateRange[0], 'yyyy-MM-dd HH:mm:ss') : '2000-01-01 00:00:00';
      res.end = dateRange[1] ? this.datePipe.transform(dateRange[1], 'yyyy-MM-dd HH:mm:ss') : '2099-12-31 23:59:59';
    } else {
      res.start = dateRange[0]
        ? this.datePipe.transform(dateRange[0], 'yyyy-MM-dd') + ' 00:00:00'
        : '2000-01-01 00:00:00';
      res.end = dateRange[1]
        ? this.datePipe.transform(dateRange[1], 'yyyy-MM-dd') + ' 23:59:59'
        : '2099-12-31 23:59:59';
    }

    return res;
  }

  range(start: number, end: number): number[] {
    const result: number[] = [];
    for (let i = start; i < end; i++) {
      result.push(i);
    }
    return result;
  }

  nzDefaultPickerValue = [
    new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 19, 0, 0, 0),
    new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 19, 0, 0, 0),
  ];

  dateToStr(date: Date): string {
    return this.datePipe.transform(date, 'yyyy-MM-dd HH:mm:ss');
  }

  dateRangeToStr(dates: any): any[] {

    if (dates.length === 2) {
      dates[0] = this.datePipe.transform(dates[0], 'yyyy-MM-dd HH:mm:ss');
      dates[1] = this.datePipe.transform(dates[1], 'yyyy-MM-dd HH:mm:ss');
    }
    return dates;
  }
  disabledRangeTime: DisabledTimeFn = (_value, type?: DisabledTimePartial) => {
    const hours = this.range(1, 24);
    hours.splice(18, 1);
    return {
      nzDisabledHours: () => hours,
      nzDisabledMinutes: () => this.range(1, 60),
      nzDisabledSeconds: () => this.range(1, 60),
    };
  };

  /**
   *
   * @param fieldListForList 活动列字段信息
   * @param winWidth 窗口大小
   * @param contentColName 长文本列名称
   * @param otherFixColWidth 除活动列之外的其他固定列的宽度之和
   */
  setColWidth(fieldListForList: any, winWidth: number, contentColName: string, otherFixColWidth: number): number {
    const hasContent =
      fieldListForList.filter((f) => f.fixName === contentColName || (!contentColName && f.fieldType === 2)).length > 0
        ? true
        : false;

    let tableWidth = 0;
    let otherWidth = 0;
    let first = true;
    fieldListForList.map((m) => {
      let width = 0;
      if ((m.fixName === contentColName || (!contentColName && m.fieldType === 2)) && first) {
        first = false;
        width = 550;
      } else {
        if (m.fieldName) {
          if (m.fieldName.length === 2) {
            width = 80;
          } else if (m.fieldName.length > 2 && m.fieldName.length < 10) {
            width = 80 + 10 * m.fieldName.length;
          } else {
            width = 200;
          }
          otherWidth = otherWidth + width;
        }
      }
      tableWidth += width;
      m.width = width;
    });
    tableWidth = tableWidth + otherFixColWidth;

    if (tableWidth <= winWidth) {
      first = true;
      const len1 = winWidth - otherWidth - otherFixColWidth - 10;
      fieldListForList.forEach((f, idx) => {
        if ((f.fixName === contentColName || (!contentColName && f.fieldType === 2)) && first) {
          first = false;
          f.width = len1;
        }
        if (idx === fieldListForList.length - 1 && !hasContent) {
          f.width = len1;
        }
      });
    }
    return tableWidth;
  }

  /**
   * 返回文件格式
   */
  getFileType() {
    const fileType = {
      txt: ['txt'],
      pdf: ['pdf'],
      excel: ['xlsx', 'xls'],
      word: ['doc', 'docx'],
      vedio: ['rm', 'rmvb', 'wmv', 'avi', 'mp4', '3gp', 'mkv', 'mpeg', 'webm', 'ogg'],
      vedioH5: ['mp4', 'webm', 'ogg'],
      audio: ['mp3', 'wav', 'flac', 'aac'],
      audioH5: ['mp3'],
      image: [
        'bmp',
        'jpg',
        'png',
        'tif',
        'jpeg',
        'gif',
        'pcx',
        'tga',
        'exif',
        'fpx',
        'svg',
        'psd',
        'cdr',
        'pcd',
        'dxf',
        'ufo',
        'eps',
        'ai',
        'raw',
        'wmf',
        'webp',
        'avif',
      ],
      imageH5: ['bmp', 'jpg', 'png', 'tif', 'jpeg', 'gif', 'svg'],
    };
    const fileTypeArr = [];
    for (const k in fileType) {
      fileTypeArr.push(...fileType[k]);
    }

    return { fileType, fileTypeArr };
  }

  getSearchFilter(fieldListForSearch: any) {
    const searchFilter = [];
    // console.log(fieldListForSearch)
    for (const items of fieldListForSearch) {
      for (const item of items.children) {
        // [{"field":1, "val":"管理","exp":"="}]
        // [{"field":1, "val":"管理","exp":"like"}]
        // [{"field":1, "start":"","end":"" }]
        // [{"field":1, "val":"27"}]
        if (!(item.val || item.start || (item.checkItems && item.checkItems.some((it) => it.checked)))) {
          continue;
        }

        if (item.name) {
          // 常用固定字段
          if (item.exp === 'between') {
            searchFilter.push({
              fieldName: item.name,
              exp: item.exp,
              ...this.getDateRange(item.val, item.showTime),
              others: item.others,
            });
          } else if (item.checkItems && item.checkItems.some((it) => it.checked)) {
            searchFilter.push({ fieldName: item.name, checkItems: item.checkItems, others: item.others });
          } else {
            searchFilter.push({ fieldName: item.name, val: item.val, exp: item.exp, others: item.others });
          }
        } else if (item.fieldType === 1 || item.fieldType === 2) {
          searchFilter.push({ fieldId: item.id, val: item.val, exp: 'like', others: item.others });
        } else if (item.fieldType === 3) {
          if (item.val && item.val.length > 1) {
            let duty = '';
            if (item.duty) {
              duty = item.duty.filter(f=>f.checked).map(m=>{return m.value}).join(",")
            }
            searchFilter.push({ fieldId: item.id, ...this.getDateRange(item.val, item.showTime), others: item.others,duty:duty });
          }
        } else if (item.fieldType === 4) {
          searchFilter.push({ fieldId: item.id, start: item.start, end: item.end, others: item.others });
        } else {
          searchFilter.push({ fieldId: item.id, val: item.val, others: item.others });
        }
      }
    }
    return searchFilter;
  }
}

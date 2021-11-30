import {DatePipe} from '@angular/common';
import {Component, OnInit} from '@angular/core';
import {YangbenService} from "../../yangben.service";
import {CommonService} from "@shared/service/common-service";
import {NzMessageService} from "ng-zorro-antd/message";
import {ExcelDownloadService} from "../../../excelDownload.service";

@Component({
  selector: 'app-yangben-data-stat',
  templateUrl: './yangben-data-stat.component.html',
  styles: []
})
export class YangbenDataStatComponent implements OnInit {
  requestParams = {
    beginTime: "2021-01-01",
    endTime: "2021-05-31"
  }
  tongJiTime = ["2021-01-01", "2021-05-01"];
  listOfData = [];
  isSpinning = false;
  loading = false;

  constructor(public yangbenService: YangbenService, private datePipe: DatePipe, public commonService: CommonService,
              private excelService: ExcelDownloadService, public msg: NzMessageService,
  ) {
  }

  async ngOnInit() {
    this.selectedTime()
    await this.getStartData();
  }

  /*
  *查询数据*/
  async getStartData(reset: boolean = false) {
    this.isSpinning = true;
    this.listOfData = [];
    this.yangbenService.getStatsService(this.requestParams).subscribe(async (res: any) => {
      this.listOfData = res;
      console.log(res)
      this.isSpinning = false;
    }, error => {
      this.isSpinning = false;
      console.log(error);
    });
  }

  //默认时间
  selectedTime() {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1);
    let t = this.datePipe.transform(new Date(tomorrow), 'yyyy-MM-dd')
    let b = this.datePipe.transform(new Date(), 'yyyy-MM-dd')
    const times = this.datePipe.transform(new Date(), 'HH:mm:ss')
    if (times > '08:30:00' && times < '18:30:00') {
      const beginTime = b + ' 08:30:00';
      const endTime = b + ' 18:30:59';
      this.tongJiTime = [beginTime, endTime];
      // this.requestParams.beginTime = beginTime;
      // this.requestParams.endTime = endTime;
    } else {
      const beginTime = b + ' 18:31:00';
      const endTime = t + ' 8:29:59';
      this.tongJiTime = [beginTime, endTime]
      // this.requestParams.beginTime = beginTime;
      // this.requestParams.endTime = endTime;
    }
  }

  timeOK(tongJiTime: string[]) {
    if (tongJiTime.length === 0) {
      this.msg.error('请输入统计时间！');
      return;
    } else {
      this.requestParams.beginTime = this.datePipe.transform(tongJiTime[0], 'yyyy-MM-dd HH:mm:ss');
      this.requestParams.endTime = this.datePipe.transform(tongJiTime[1], 'yyyy-MM-dd HH:mm:ss');
      this.getStartData();
    }
  }

  //下载
  exportData() {
    this.excelService.downloadByPost('样本数据统计', 'api/yangben-stat/data-stat/xls', this.requestParams, false);
  }
}

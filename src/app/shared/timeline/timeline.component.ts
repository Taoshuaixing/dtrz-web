import { AfterViewInit } from '@angular/core';
import { Component, Input, OnInit } from '@angular/core';
import { environment } from '@env/environment';
import { fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.css'],
})
export class TimelineComponent implements OnInit, AfterViewInit {
  constructor() {}

  @Input() resultData: ResultData;
  @Input() parent: any;
  @Input() onMore: (parent: any, page: number, pageSize: number) => Promise<ResultData>;
  loading = false;

  descWidth = 700;
  resizeWidth() {
    if (document.getElementById('timeline-content')) {
      this.descWidth = document.getElementById('timeline-content').clientWidth - 225;
      // console.log(  document.getElementById("timeline-content").clientWidth )
    }
  }

  ngOnInit(): void {
    this.loading = true;
    this.resizeWidth();
  }
  ngAfterViewInit(): void {
    fromEvent(window, 'resize')
      .pipe(debounceTime(200))
      .subscribe((event) => {
        // 这里处理页面变化时的操作
        this.resizeWidth();
      });

    setTimeout(() => {
      this.loading = false;
    }, 400);
  }
  async getMore(): Promise<void> {
    this.loading = true;
    const rec = await this.onMore(this.parent, ++this.resultData.page, this.resultData.pageSize);
    this.resultData.isEnd = rec.isEnd;
    this.resultData.page = rec.page;
    this.resultData.pageSize = rec.pageSize;
    this.resultData.list.push.apply(this.resultData.list, rec.list);
    this.loading = false;
    console.log(rec);
  }

  getDateMarginLeft(str: any) {
    if (str.length <= 3) {
      return 80;
    } else if (str.length <= 5) {
      return 65;
    }
    return 30;
  }

  getUrl(item: any) {
    if (item.nameSeg) {
      const keywords = [];
      item.nameSeg.forEach((it) => {
        keywords.push(it.w);
      });
      return environment.mapUrlByKeyword + keywords.join(' ');
    } else if (item.title) {
      return environment.mapUrlByKeyword + item.title;
    }
  }
}

interface ItemData {
  title: string;
  nameSeg: string;
  eventDate: string;
  desc: string;
  color: string;
  icon: string;
  width: string;
}
interface ResultData {
  style:"",
  isEnd: false;
  today: string;
  page: number;
  pageSize: number;
  list: ItemData[];
}

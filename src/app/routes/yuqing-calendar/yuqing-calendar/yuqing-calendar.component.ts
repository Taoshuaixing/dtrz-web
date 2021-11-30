import { AfterViewInit, Component, OnInit } from '@angular/core';
import { fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-yuqing-calendar',
  templateUrl: './yuqing-calendar.component.html',
  styleUrls: ['./yuqing-calendar.component.css'],
})
export class YuqingCalendarComponent implements OnInit, AfterViewInit {
  constructor() {}
  isCollapsed = false;
  content_width = 1500;
  sidebar_width = 160;
  offset_width = 50;

  ngAfterViewInit(): void {
    fromEvent(window, 'resize')
      .pipe(debounceTime(200))
      .subscribe((event) => {
        // 这里处理页面变化时的操作
        this.changeSize();
      });
  }
  changeSize() {
    this.content_width = document.querySelector('body').clientWidth - this.sidebar_width - this.offset_width;
  }
  ngOnInit() {
    this.changeSize();
  }
}

import { Component, OnInit, AfterViewInit } from '@angular/core';
import { fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
})
export class SettingsComponent implements OnInit, AfterViewInit {
  constructor() {}

  content_width = 1500;
  sidebar_width = 240;
  offset_width = 50;

  OPT_SHARE_NONE = 0;
  OPT_SHARE_OTHER = 1;
  OPT_SHARE_ME = 2;

  ngAfterViewInit(): void {
    fromEvent(window, 'resize')
      .pipe(debounceTime(200))
      .subscribe((event) => {
        // 这里处理页面变化时的操作
        this.changeSize();
      });
  }

  ngOnInit() {
    this.changeSize();
  }

  changeSize() {
    this.content_width = document.querySelector('body').clientWidth - this.sidebar_width - this.offset_width;
  }
}

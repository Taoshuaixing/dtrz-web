import { Component, OnInit } from '@angular/core';
import {StorageService} from "../../storage.service";
import {fromEvent} from "rxjs";
import {debounceTime} from "rxjs/operators";

@Component({
  selector: 'app-journal',
  templateUrl: './journal.component.html',
  styleUrls: ['./journal.component.css'],
})
export class JournalComponent implements OnInit {

  constructor(public storageService: StorageService) {}

  content_width = 1500;
  sidebar_width = 240;
  offset_width = 50;

  OPT_SHARE_OTHER = 1;
  OPT_SHARE_ME = 2;

  ngAfterViewInit(): void {
    fromEvent(window, 'resize')
      .pipe(debounceTime(200))
      .subscribe((event) => {
        // 这里处理页面变化时的操作
        this.changeSize();
      });
    // this.curRole = localStorage.getItem('curRole');
    // console.log(this.curRole)
  }

  ngOnInit(): void {
    this.changeSize();
  }

  changeSize() {
    this.content_width = document.querySelector('body').clientWidth - this.sidebar_width - this.offset_width;
  }

}

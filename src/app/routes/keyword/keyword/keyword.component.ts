import {AfterViewInit, Component, OnInit} from '@angular/core';
import {StorageService} from "../../storage.service";
import {CrudService} from "../../crud.service";
import {fromEvent} from "rxjs";
import {debounceTime} from "rxjs/operators";

@Component({
  selector: 'app-keyword',
  templateUrl: './keyword.component.html',
  styleUrls: ['./keyword.component.css'],
})
export class KeywordComponent implements OnInit, AfterViewInit {

  constructor(public storageService: StorageService, private crudService: CrudService) {}

  content_width = 1500;
  sidebar_width = 240;
  offset_width = 50;


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

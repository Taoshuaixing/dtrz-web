import {AfterViewInit, Component, OnInit} from '@angular/core';
import {StorageService} from "../../storage.service";
import {CrudService} from "../../crud.service";
import {Router} from "@angular/router";
import {fromEvent} from "rxjs";
import {debounceTime} from "rxjs/operators";
import {environment} from "@env/environment";

@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.css'],
})
export class EventComponent implements OnInit, AfterViewInit {
  constructor(public storageService: StorageService, private crudService: CrudService, private router: Router) {}

  content_width = 1500;
  sidebar_width = 240;
  offset_width = 50;

  curRole = '';
  menus: any = [];

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

  ngOnInit() {
    this.changeSize();

    // 显示动态菜单
    this.menus = [];
    this.storageService.set('menus', this.menus);
    this.crudService.search(environment.baseUrl + 'api', 'yangben-event-template-place', '').subscribe((res: any[]) => {
      res.forEach((it) => {
        this.menus.push({ title: it.name, value: it.id });
      });

      this.menus.push({ title: '事件综合查询', value: 0 });
    });

  }

  changeSize() {
    this.content_width = document.querySelector('body').clientWidth - this.sidebar_width - this.offset_width;
  }
}

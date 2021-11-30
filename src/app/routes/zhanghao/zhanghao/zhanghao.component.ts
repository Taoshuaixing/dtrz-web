import { AfterViewInit, Component, OnInit } from '@angular/core';
import { fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { StorageService } from '../../storage.service';
import { CrudService } from '../../crud.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-zhanghao',
  templateUrl: './zhanghao.component.html',
  styleUrls: ['./zhanghao.component.css'],
})
export class ZhanghaoComponent implements OnInit, AfterViewInit {
  constructor(public storageService: StorageService, private crudService: CrudService, private router: Router) {}

  content_width = 1500;
  sidebar_width = 240;
  offset_width = 50;

  OPT_SHARE_QUERY = -1;
  OPT_SHARE_NONE = 0;
  OPT_SHARE_OTHER = 1;
  OPT_SHARE_ME = 2;
  curRole = '';
  menus: any = [];

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

    // 重定向
    const curRole = this.storageService.curRole;
    this.router.navigate(['/zhanghao/zhanghao-data'], {
      queryParams: { shareFlag: 0 },
    });
  }

  changeSize() {
    this.content_width = document.querySelector('body').clientWidth - this.sidebar_width - this.offset_width;
  }
}

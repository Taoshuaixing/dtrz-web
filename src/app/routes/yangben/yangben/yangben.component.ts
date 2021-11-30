import { Component, OnInit, AfterViewInit } from '@angular/core';
import { fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { StorageService } from '../../storage.service';
import { environment } from '@env/environment';
import { CrudService } from '../../crud.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-yangben',
  templateUrl: './yangben.component.html',
  styleUrls: ['./yangben.component.css'],
})
export class YangbenComponent implements OnInit, AfterViewInit {
  constructor(
    public storageService: StorageService,
    private crudService: CrudService,
    private router: Router,
    private activedrouted: ActivatedRoute,
  ) {}
  currentSys = environment.currentSys;
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
    // this.curRole = localStorage.getItem('curRole');
    // console.log(this.curRole)
  }

  ngOnInit() {
    this.changeSize();

    let from = '';
    this.activedrouted.queryParams.subscribe((params) => {
      if (params) {
        from = params.from;
      }
    });

    if (from != 'event' && from != 'option') {
      // 重定向
      const curRole = this.storageService.curRole;
      if (curRole.indexOf('dagl_editor') >= 0) {
        this.router.navigate(['/yangben/yangben-selection'], {
          queryParams: { selectFlag: 'unselected' },
        });
      } else {
        this.router.navigate(['/yangben/yangben-data'], {
          queryParams: { shareFlag: 0 },
        });
      }
    }
  }

  changeSize() {
    this.content_width = document.querySelector('body').clientWidth - this.sidebar_width - this.offset_width;
  }
}

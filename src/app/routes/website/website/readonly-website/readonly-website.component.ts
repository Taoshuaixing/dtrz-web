import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {NzMessageService} from 'ng-zorro-antd/message';
import {environment} from '@env/environment';
import {CrudService} from 'src/app/routes/crud.service';

@Component({
  selector: 'app-readonly-website',
  templateUrl: './readonly-website.component.html',
  styleUrls: ['./readonly-website.component.css'],
})
export class ReadonlyWebsiteComponent implements OnInit, OnDestroy {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    public msgSrv: NzMessageService,
    private crudService: CrudService,
  ) {
  }

  isCollapsed = false;
  public isDisabled = true;
  loading = false;
  categoriesArr = [];
  website: any = {};

  baseUrl = environment.baseUrl;
  imgsrc = environment.baseUrl + 'api/website/down/';
  websiteageId = 0;
  uploadFlg = false;
  scrollTop = 10; // 滚动标记
  userKeyValues = [];

  ngOnInit() {
    if (this.route.snapshot.paramMap.has('id')) {
      this.websiteageId = Number(this.route.snapshot.paramMap.get('id'));
      if (this.websiteageId) {
        this.initData();
      }
    }
  }

  ngOnDestroy() {
    // 滚动事件移除
    window.removeEventListener('scroll', this.scroll, true);
  }

  scroll = (): void => {
    // 滚动事件位置取得
    this.scrollTop = window.pageYOffset;
  }

  initData() {
    this.crudService.get(environment.baseUrl + 'api', 'website', this.websiteageId)
      .subscribe((website: any) => {
        if (!website) {
          this.msgSrv.create('error', '该条数据已删除！');
          return;
        }
        this.website.id = this.websiteageId;
        this.website.title = website.title;
        this.website.brief = website.brief;
        this.website.baseInfo = website.baseInfo;

        this.website.contentHtml = website.contentHtml;
        this.website.avatar = website.avatar;
        this.website.type = website.type;

        const baseInfoStr = website.baseInfo;
        if (baseInfoStr) {
          const baseInfo = JSON.parse(baseInfoStr);
          for (const key in baseInfo) {
            if (baseInfo.hasOwnProperty(key)) {
              // if (baseInfo[key].val) {
              this.userKeyValues.push(baseInfo[key]);
              // }
            }
          }
        }
        const menuContent = website.content;
        if (menuContent) {
          this.website.menus = JSON.parse(menuContent);
          const menuData = JSON.parse(menuContent);
          if (menuData) {
            this.website.content = menuData.data;
          }
        }

        this.crudService.get(environment.baseUrl + 'api', 'website', this.website.id).subscribe((res1: any) => {
          if (res1.categories !== undefined && res1.categories.length !== 0) {
            res1.categories.forEach(element => {
              this.categoriesArr.push(element.name);
            });
          }
        });
      });
  }

  updateWebsite() {
    // window.open('/#/website/detail/' + this.websiteageId);
    this.router.navigate(['/website/detail/' + this.websiteageId]);
  }

  closeWin() {
    // window.close();  /dashboard
    this.router.navigate(['/website/list']);
  }
}

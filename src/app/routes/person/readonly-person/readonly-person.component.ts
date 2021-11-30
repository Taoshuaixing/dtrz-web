import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {NzMessageService} from 'ng-zorro-antd/message';
import {CrudService} from '../../crud.service';
import {PersonageI} from '../person.module';
import {environment} from '@env/environment';

@Component({
  selector: 'app-readonly-person',
  templateUrl: './readonly-person.component.html',
  styleUrls: ['./readonly-person.component.css'],
})
export class ReadonlyPersonComponent implements OnInit, OnDestroy {
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
  person: PersonageI = {
    id: 1,
    title: '',
    // brief:'<p>编辑简介内容</p><p>&nbsp;</p>',
    brief: '编辑简介内容',
    baseInfo: '',
    // content:'<p>编辑详细内容</p><p>&nbsp;</p>',
    content: '编辑详细内容',
    menus: [],
  };

  baseUrl = environment.baseUrl;
  imgsrc = environment.baseUrl + 'api/article/down/';
  personageId = 0;
  uploadFlg = false;

  scrollTop = 10; // 滚动标记

  userKeyValues = [];

  ngOnInit() {
    // 滚动事件添加
    // window.addEventListener('scroll', this.scroll, true); // third parameter
    //
    if (this.route.snapshot.paramMap.has('id')) {
      this.personageId = Number(this.route.snapshot.paramMap.get('id'));
      if (this.personageId) {
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

    this.crudService.get(environment.baseUrl + 'api', 'article', this.personageId)
      .subscribe((person: any) => {
        if (!person) {
          this.msgSrv.create('error', '该条数据已删除！');
          return;
        }
        this.person.id = this.personageId;
        this.person.title = person.title;
        this.person.brief = person.brief;
        this.person.baseInfo = person.baseInfo;

        this.person.contentHtml = person.contentHtml;
        this.person.avatar = person.avatar;
        this.person.type = person.type;

        const baseInfoStr = person.baseInfo;
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
        const menuContent = person.content;
        if (menuContent) {
          this.person.menus = JSON.parse(menuContent);
          const menuData = JSON.parse(menuContent);
          if (menuData) {
            this.person.content = menuData.data;
          }
        }

        this.crudService.get(environment.baseUrl + 'api', 'article', this.person.id).subscribe((res1: any) => {
          if (res1.categories !== undefined && res1.categories.length !== 0) {
            res1.categories.forEach(element => {
              this.categoriesArr.push(element.name);
            });
          }
        });
      });

  }

  updatePerson() {
    // window.open('/#/person/detail/' + this.personageId);
    this.router.navigate(['/person/detail/' + this.personageId]);
  }

  closeWin() {
    // window.close();  /dashboard
    this.router.navigate(['/person/list']);
  }
}

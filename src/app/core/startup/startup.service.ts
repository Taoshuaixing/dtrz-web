import { Injectable, Injector, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { zip } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MenuService, SettingsService, TitleService, ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { ACLService } from '@delon/acl';

import { NzIconService } from 'ng-zorro-antd/icon';
import { ICONS_AUTO } from '../../../style-icons-auto';
import { ICONS } from '../../../style-icons';
import { environment } from '@env/environment';
import { PlatformLocation } from '@angular/common';
import { NzMessageService } from 'ng-zorro-antd/message';
import { StorageService } from 'src/app/routes/storage.service';
import { CrudService } from 'src/app/routes/crud.service';

/**
 * Used for application startup
 * Generally used to get the basic data of the application, like: Menu Data, User Data, etc.
 */
@Injectable()
export class StartupService {
  constructor(
    iconSrv: NzIconService,
    private menuService: MenuService,
    private settingService: SettingsService,
    private aclService: ACLService,
    private titleService: TitleService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private httpClient: HttpClient,
    private injector: Injector,
    public http: _HttpClient,
    private location: PlatformLocation,
    private msg: NzMessageService,
    private storageService: StorageService,
    private crudService: CrudService,
    private router: Router,
  ) {
    iconSrv.addIcon(...ICONS_AUTO, ...ICONS);
  }

  private viaHttp(resolve: any, reject: any) {
    zip(this.httpClient.get('assets/tmp/app-data.json'))
      .pipe(
        catchError(([appData]) => {
          resolve(null);
          return [appData];
        }),
      )
      .subscribe(
        ([appData]) => {
          // Application data
          const res: any = appData;
          // Application information: including site name, description, year
          this.settingService.setApp(res.app);
          // User information: including name, avatar, email address
          this.settingService.setUser(res.user);
          // ACL: Set the permissions to full, https://ng-alain.com/acl/getting-started
          this.aclService.setFull(true);
          // Menu data, https://ng-alain.com/theme/menu
          this.menuService.add(res.menu);
          // Can be set page suffix title, https://ng-alain.com/theme/title
          this.titleService.suffix = res.app.name;
        },
        () => {},
        () => {
          resolve(null);
        },
      );
  }

  private viaMock(resolve: any, reject: any) {
    // const tokenData = this.tokenService.get();
    // if (!tokenData.token) {
    //   this.injector.get(Router).navigateByUrl('/passport/login');
    //   resolve({});
    //   return;
    // }
    // mock
    const app: any = {
      name: `DAGL`,
      description: `Ng-zorro admin panel front-end framework`,
    };
    const user: any = {
      name: 'Admin',
      avatar: './assets/tmp/img/xx.jpg',
      email: ' ',
      token: '123456789',
    };
    // Application information: including site name, description, year
    this.settingService.setApp(app);
    // User information: including name, avatar, email address
    this.settingService.setUser(user);
    // ACL: Set the permissions to full, https://ng-alain.com/acl/getting-started
    this.aclService.setFull(true);
    // Menu data, https://ng-alain.com/theme/menu
    this.menuService.add([
      {
        text: 'Main',
        group: true,
        children: [
          {
            text: 'Dashboard',
            link: '/dashboard',
            icon: { type: 'icon', value: 'appstore' },
          },
          {
            text: 'Quick Menu',
            icon: { type: 'icon', value: 'rocket' },
            shortcutRoot: true,
          },
        ],
      },
    ]);
    // Can be set page suffix title, https://ng-alain.com/theme/title
    this.titleService.suffix = app.name;

    resolve({});
  }

  // load(): Promise<any> {
  //   // only works with promises
  //   // https://github.com/angular/angular/issues/15088
  //   return new Promise((resolve, reject) => {
  //     // http
  //     // this.viaHttp(resolve, reject);
  //     // mock：请勿在生产环境中这么使用，viaMock 单纯只是为了模拟一些数据使脚手架一开始能正常运行1
  //     this.viaMock(resolve, reject);
  //   });
  // }

  load(): Promise<any> {
    const url = this.location.href;
    if (url.includes('/passport') || !this.location.hash) {
      // 首页或登录页面
      return new Promise<any>((resolve, reject) => {
        resolve({});
        return [];
      });
    } else {
      return this.load_profile();
    }

    // return this.load_profile();
  }

  async load_profile(): Promise<any> {
    await new Promise((resolve, reject) => {
      this.http
        .get(environment.baseUrl_zxtj + 'api/auth/profile', null)
        .pipe(
          // 接收其他拦截器后产生的异常消息
          catchError((res) => {
            resolve(null);
            return [];
          }),
        )
        .subscribe(
          (res2: any) => {
            // console.log("res2", res2);
            this.aclService.setAbility([]);
            // 用户设置
            //无岗人员处理
            // if(res2 && res2.posts && res2.posts.length ===0) {
            //   res2.posts.push({id:0});
            // }
            this.settingService.setUser(res2);
            // ACL设置
            this.aclService.setFull(false);
            // 默认一次只能一个角色
            const curRoles = res2.roles.filter((f) => f.sysCode === 'dagl');
            if (curRoles.length === 0) {
              this.aclService.setRole([]);
              //   this.msg.warning("无权限,请尝试重新登录或联系管理员")
              // return;
            }

            if (res2.roles && res2.roles.length > 0) {
              // const roles = [];
              // res2.roles.forEach(f=>{
              //   roles.push(f.roleCode);
              // })
              //  this.aclService.setRole(roles);

              const roles = [];
              curRoles.forEach((it) => {
                roles.push(it.roleCode);
              });

              // console.log("curRoles", curRoles)

              // this.aclService.setRole([curRoles[0].roleCode]);
              this.aclService.setRole(roles);
              // 防止页面刷新，角色恢复默认
              if (localStorage.getItem('curRole')) {
                // const findRole = curRoles.find(it=>it.roleCode === localStorage.getItem('curRole'))
                // if (findRole) {
                //   this.aclService.setRole([findRole.roleCode]);
                // }
              } else {
                localStorage.setItem('curRole', roles[0]);
              }
              this.storageService.curRole = localStorage.getItem('curRole');
            }
          },
          () => {},
          () => {
            resolve(null);
          },
        );
    });
    // console.log(this.settingService.user.userId)
    await new Promise((resolve, reject) => {
      this.crudService
        .get(environment.baseUrl_zxtj + 'api', 'user', this.settingService.user.userId)
        .subscribe((res_menu: any) => {
          // resolve(res.menus);
          // 将菜单项增加到acl控制中
          let menuCodes = [];
          if (res_menu) {
            for (const item of res_menu.menus) {
              menuCodes.push(item.menuCode);
            }
          }

          // 当前角色放入acl控制
          if (localStorage.getItem('curRole')) {
            menuCodes.push(localStorage.getItem('curRole'));
          }

          // this.aclService.setAbility([]);
          this.aclService.attachAbility(menuCodes);
          // console.log("menuCodes", menuCodes);
          // console.log(this.aclService.data);
          resolve(res_menu);
        });
    });
  }
}

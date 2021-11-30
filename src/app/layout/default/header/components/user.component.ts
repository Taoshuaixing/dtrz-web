import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StartupService } from '@core';
import { ACLService } from '@delon/acl';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { SettingsService } from '@delon/theme';
import { environment } from '@env/environment';
import { CookieService } from 'ngx-cookie-service';
import { CrudService } from 'src/app/routes/crud.service';
import { StorageService } from 'src/app/routes/storage.service';

@Component({
  selector: 'header-user',
  template: `
    <div *ngIf="profile">
      <a
        *ngIf="this.settings.user.username === 'admin'; else usersTemp"
        [routerLink]="['/settings']"
        style="color: white;margin-right:10px;"
      >
        <i nz-icon nzType="setting"></i>
      </a>

      <ng-template #usersTemp>
        <ng-container *aclIf="['dagl_admin']">
          <a [acl]="{ ability: ['settings'] }" [routerLink]="['/settings']" style="color: white;margin-right:10px;">
            <i nz-icon nzType="setting"></i>
          </a>
        </ng-container>
      </ng-template>

      <nz-select
        style="width:130px; margin-right:20px;"
        *ngIf="this.roles.length > 1"
        [(ngModel)]="curRole"
        (ngModelChange)="changeRole()"
      >
        <nz-option *ngFor="let r of roles" [nzValue]="r.roleCode" [nzLabel]="r.roleName"></nz-option>
      </nz-select>

      <!--      <nz-avatar [nzSrc]="settings.user.avatar" nzSize="small" class="mr-sm"></nz-avatar>-->
      <span style="margin-right: 10px;color: white">
        {{ showName }}
      </span>

      <button nz-button nzType="default" title="退出" (click)="logout()">
        <i nz-icon nzType="logout"></i>
      </button>
    </div>

    <!--    <nz-dropdown-menu #userMenu="nzDropdownMenu">-->
    <!--      <div nz-menu class="width-sm">-->
    <!--        <div nz-menu-item routerLink="/pro/account/center">-->
    <!--          <i nz-icon nzType="user" class="mr-sm"></i>-->
    <!--          个人中心-->
    <!--        </div>-->
    <!--        <div nz-menu-item routerLink="/pro/account/settings">-->
    <!--          <i nz-icon nzType="setting" class="mr-sm"></i>-->
    <!--          个人设置-->
    <!--        </div>-->
    <!--        <div nz-menu-item routerLink="/exception/trigger">-->
    <!--          <i nz-icon nzType="close-circle" class="mr-sm"></i>-->
    <!--          触发错误-->
    <!--        </div>-->
    <!--        <li nz-menu-divider></li>-->
    <!--        <div nz-menu-item (click)="logout()">-->
    <!--          <i nz-icon nzType="logout" class="mr-sm"></i>-->
    <!--          退出登录-->
    <!--        </div>-->
    <!--      </div>-->
    <!--    </nz-dropdown-menu>-->
  `,
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderUserComponent implements OnInit {
  constructor(
    public settings: SettingsService,
    private cookieService: CookieService,
    private router: Router,
    public aclService: ACLService,
    private crudService: CrudService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private storageService: StorageService,
    private startupSrv: StartupService,
  ) {}

  profile = null;
  showName = '';
  roles = [];
  curRole: any;

  ngOnInit(): void {
    // const profile=this.cookieService.get('profile');
    // if(profile){
    //   this.profile = JSON.parse(this.cookieService.get('profile'));
    //   console.log('loginuser');
    //   console.log(this.profile);
    // }
    this.profile = this.settings.user;
    this.showName = this.settings.user.realname ? this.settings.user.realname : this.settings.user.username;
    this.crudService
      .get(environment.baseUrl_zxtj + 'api', 'user', this.settings.user.userId)
      .subscribe((userObj: any) => {
        this.roles = userObj.roles.filter((f) => f.sysCode === 'dagl');
        // this.curRole =this.roles[0].roleCode;
        // this.curRole = this.aclService.data.roles[0];
        this.curRole = this.storageService.curRole;

        // console.log("user")
        // // 防止页面刷新，角色恢复默认
        // if (localStorage.getItem('curRole')) {
        //   const findRole = this.roles.find(it=>it.roleCode === localStorage.getItem('curRole'))
        //   if (findRole) {
        //     this.curRole = findRole.roleCode
        //     this.aclService.setRole([this.curRole]);
        //   }
        // }
      });
    this.curRole = this.storageService.curRole;
  }

  changeRole() {
    localStorage.setItem('curRole', this.curRole);
    this.storageService.curRole = this.curRole;
    this.startupSrv.load_profile();
    // console.log(this.router.url);
    this.storageService.curUrl = this.router.url;
    this.router.navigate(['/dashboard'], {});
  }

  logout() {
    localStorage.removeItem('curRole');
    this.cookieService.delete('profile');
    this.cookieService.delete('access_token');
    this.tokenService.clear();
    this.router.navigateByUrl(this.tokenService.login_url);
  }
}

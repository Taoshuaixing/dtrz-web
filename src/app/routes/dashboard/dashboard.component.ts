import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { SettingsService } from '@delon/theme';
import { Router } from '@angular/router';
import { ACLService } from '@delon/acl';
import { NzMessageService } from 'ng-zorro-antd/message';
import { StorageService } from '../storage.service';
import { environment } from '@env/environment';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  OPT_SHARE_QUERY = -1;
  OPT_SHARE_NONE = 0;
  OPT_SHARE_OTHER = 1;
  OPT_SHARE_ME = 2;

  linkControl = [
    {
      menu: 'yangben-selection-unselected',
      role: 'dagl_editor',
      url: '/yangben/yangben-selection',
      // queryParams: { selectFlag: 'unselected' },
    },
    {
      menu: 'yangben-data-1',
      role: 'dagl_admin',
      url: '/yangben/yangben-data',
      // queryParams: { shareFlag: this.OPT_SHARE_QUERY },
    },
    {
      menu: 'yangben-data0',
      role: 'dagl_post',
      url: '/yangben/yangben-data',
      // queryParams: { shareFlag: this.OPT_SHARE_NONE },
    },
    { menu: 'person', role: null, url: '/person/list', queryParams: {} },
    { menu: 'website', role: null, url: '/website/list', queryParams: {} },
    { menu: 'heimingdan', role: null, url: '/heimingdan/list', queryParams: {} },
    { menu: 'yuqing-calendar', role: null, url: 'yuqing-calendar/yuqing-calendar-view', queryParams: {} },
    { menu: 'keyword', role: null, url: 'keyword/keyword-list', queryParams: {} },
    { menu: 'zhanghao', role: null, url: 'zhanghao/zhanghao-data', queryParams: {} },
    { menu: 'journal', role: null, url: 'journal/journal-report', queryParams: {} },
  ];

  constructor(
    public aclService: ACLService,
    private router: Router,
    public settingService: SettingsService,
    public msgSrv: NzMessageService,
    private storageService: StorageService,
  ) {
    // 分析统计需求不清，暂时注释
    // this.router.navigateByUrl('/yangben/yangben-analysis');
    if (this.aclService.data.roles && this.aclService.data.roles.length === 0) {
      this.router.navigateByUrl('/passport');
      this.msgSrv.warning(`无权限,请尝试重新登录或联系管理员`);
      return;
    }

    // console.log("data", this.aclService.data);
    this.storageService.curUrl;

    const selectedNavi = { url: '', queryParams: {} };

    if (environment.currentSys === 'zb') {
      // 专班默认日志模块
      const it = this.linkControl.find((f) => f.menu === 'journal');
      if (this.checkAcl(it.role, it.menu)) {
        selectedNavi.url = it.url;
        selectedNavi.queryParams = it.queryParams;
      }
    }
    // 默认一个选中
    if (selectedNavi.url.length === 0) {
      for (const it of this.linkControl) {
        if (this.checkAcl(it.role, it.menu)) {
          // this.router.navigate([it.url], { queryParams: it.queryParams });
          selectedNavi.url = it.url;
          selectedNavi.queryParams = it.queryParams;
          break;
        }
      }
    }

    // 找到上次停留的那个
    if (this.storageService.curUrl.length > 0) {
      const curUrls = /(?<=\/)[^\/]+/.exec(this.storageService.curUrl);
      let curUrl = '';
      if (curUrls.length > 0) {
        curUrl = curUrls[0];
      }
      if (curUrl.length > 0) {
        for (const it of this.linkControl) {
          if (this.checkAcl(it.role, it.menu) && it.url.indexOf(curUrl) >= 0) {
            selectedNavi.url = it.url;
            selectedNavi.queryParams = it.queryParams;
            break;
          }
        }
      }
    }

    if (selectedNavi.url.length > 0) {
      this.router.navigate([selectedNavi.url], { queryParams: selectedNavi.queryParams });
      return;
    }

    this.msgSrv.warning(`无菜单设置项,请尝试重新登录或联系管理员`);
  }

  checkAcl(role: string, menu: string) {
    if (!this.aclService.data || !this.aclService.data.abilities) {
      return false;
    }
    const curRole = localStorage.getItem('curRole');
    if (curRole === role || !role) {
      if (this.aclService.data.abilities.indexOf(menu) >= 0) {
        return true;
      }
    }
    return false;
  }

  ngOnInit() {}
}

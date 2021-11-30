import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { SettingsService } from '@delon/theme';
import { environment } from '@env/environment';
import { StorageService } from 'src/app/routes/storage.service';

@Component({
  selector: 'layout-header',
  templateUrl: './header.component.html',
  styles: [
    `
      .logo h2 {
        color: white;
        margin-top: 8px;
      }
      .menu-list {
        margin-left: 50px;
      }
      .menu-list a {
        color: white;
        /* margin-top: 5px; */
        /* font-size: 16px; */
      }

      .selected {
        background-color: #40a9ff;
      }
      .alain-default__header-logo {
        margin-left: 5px;
      }
      :host .ant-menu.ant-menu-dark,
      .ant-menu-dark .ant-menu-sub,
      .ant-menu.ant-menu-dark .ant-menu-sub {
        color: rgba(255, 255, 255, 0.65);
        background: #1890ff;
      }

      :host .ant-menu.ant-menu-dark .ant-menu-item-selected,
      .ant-menu-submenu-popup.ant-menu-dark .ant-menu-item-selected {
        background-color: #40a9ff;
      }
    `,
  ],
})
export class HeaderComponent implements OnInit {
  constructor(public settings: SettingsService, private router: Router, public storageService: StorageService) {}
  currentSys = environment.currentSys;
  systemName = '';
  selectedItem = '';

  ngOnInit() {
    // console.log(this.currentSys)
    // console.log(this.router.url);
    this.systemName = environment.systemName;
  }

  checkSelected($event) {
    // this.selectedItem = name;
    // debugger;
    this.storageService.curUrl = $event.listOfRouterLinkWithHref.first.href;
  }
}

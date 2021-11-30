import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { environment } from '@env/environment';
import { CrudService } from '../../../crud.service';
import { SettingsService } from '@delon/theme';

@Component({
  selector: 'app-position-and-staffing',
  templateUrl: './position-and-staffing.component.html',
  styleUrls: ['./position-and-staffing.component.css'],
})
export class PositionAndStaffingComponent implements OnInit, AfterViewInit {
  addFlg = false;
  newType = '';
  types: any = null;
  posts = [];

  constructor(
    private crudService: CrudService,
    private router: Router,
    public msg: NzMessageService,
    private modalService: NzModalService,
    public settingService: SettingsService,
    private activedrouted: ActivatedRoute,
  ) {}

  ngOnInit() {
    //
    this.posts = [];
    this.posts.push({ postName: '无岗位人员', id: 0 });
    this.crudService.searchAll(environment.baseUrl_zxtj + 'api', 'post').subscribe((res: any[]) => {
      for (const item of res) {
        this.posts.push(item);
      }
    });

    this.activedrouted.queryParams.subscribe((params) => {
      if (!params.postId) {
        this.router.navigate(['/settings/position-and-staffing/position-one'], {
          queryParams: { postId: 0 },
        });
      }
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (!this.posts || this.posts.length === 0) {
        return;
      }
      const firstItem = document.querySelector(`#item_${this.posts[0].id}`);
      if (firstItem) {
        firstItem.classList.add('ant-menu-item-selected');
      }
    }, 100);
  }

  addPosition() {
    if (!this.newType) {
      this.msg.create('warning', '请输入岗位名称！');
      return;
    }
    this.crudService
      .add(environment.baseUrl_zxtj + 'api', 'post', {
        postName: this.newType,
        createUser: this.settingService.user.userId,
      })
      .subscribe((res) => {
        // console.log(res);
        this.ngOnInit();
        this.addFlg = false;
      });
  }

  getPost(val: any) {
    this.router.navigate(['/settings/position-and-staffing/position-one'], {
      queryParams: { postId: val },
    });
  }

  delete(id: any): void {
    if (id) {
      // 删除确认信息
      this.modalService.confirm({
        nzTitle: '删除岗位信息',
        nzContent: '<b style="color: red;">确定删除此岗位吗？</b>',
        nzOkType: 'danger',
        nzOnOk: () => {
          this.crudService.del(environment.baseUrl_zxtj + 'api', 'post', id).subscribe((res) => {
            this.msg.create('success', '删除成功');
            this.ngOnInit();
          });
        },
        nzOnCancel: () => console.log('Cancel'),
      });
    }
  }

  // 获取modal中的事件
  getEmitter() {
    // modal中确定后，刷新页面
    this.ngOnInit();
  }
}

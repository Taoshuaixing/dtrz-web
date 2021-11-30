import {ChangeDetectorRef, Component, EventEmitter, OnInit, Output} from '@angular/core';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzModalService} from 'ng-zorro-antd/modal';
import {environment} from '@env/environment';
import {HttpClient} from '@angular/common/http';
import {DatePipe} from '@angular/common';
import {Router} from '@angular/router';
import {CrudService} from 'src/app/routes/crud.service';
import {ACLService} from '@delon/acl';

@Component({
  selector: 'app-list-website',
  templateUrl: './list-website.component.html',
  styleUrls: ['./list-website.component.less'],
})
export class ListWebsiteComponent implements OnInit {
  isVisible = false;
  isOkLoading = false;
  q: any = {
    status: 'all',
  };
  checkOptions = []; // 归属类别数组
  treeDatas = []; // 左侧树数据
  loading = false;
  data: any[] = [];
  search = {
    total: 0,
    offset: 0,
    limit: 15, // 默认显示16条
    keyword: '',
    type: '',
    page: 1,
  };
  searchParams: any = {};
  baseUrl = null;
  imgsrc = environment.baseUrl + 'api/website/down/';

  @Output() selected = new EventEmitter<string>();
  types: any = null;
  selectTypeName = '';
  initactived = '';
  allChecked = false;
  adminFlag = 0;

  constructor(
    private http: HttpClient,
    public msg: NzMessageService,
    private cdr: ChangeDetectorRef,
    private crudService: CrudService,
    private datePipe: DatePipe,
    private router: Router,
    private modalService: NzModalService,
    private aclService: ACLService,
  ) {
  }

  initSearch() {
    this.search.total = 0;
    this.search.offset = 0;
    this.search.page = 1;
  }

  ngOnInit() {
    const userRoles = this.aclService.data.roles;
    if (userRoles) {
      this.adminFlag = userRoles.indexOf('dagl_admin') >= 0 ? 1 : 0;
    }

    this.initSearch();
    this.getData('', '');
  }

  /**
   * 处理左侧树数据
   */
  selfCirculation(treeData, checkOptions) {
    for (const item of treeData) {
      if (item.children !== undefined) {
        item.title = item.name;
        item.key = item.id;
        checkOptions.push({label: item.name, value: item.id});
        this.selfCirculation(item.children, checkOptions);
      } else {
        item.title = item.name;
        item.key = item.id;
        item.isLeaf = true;
        checkOptions.push({label: item.name, value: item.id});
      }
    }
  }

  /**
   * 删除左侧树数据
   */
  confirm(id) {
    this.crudService.delete(environment.baseUrl + 'api/website/category/custom/' + id).subscribe((res) => {
      this.msg.create('success', '删除成功');
      this.search.type = '';
      this.getData('', '');
      // this.typeData();
    });
  }

  /**
   *
   * 修改左侧树数据
   */
  alter(data) {
    this.crudService
      .patch(environment.baseUrl + 'api/website/category/' + data.id, {name: data.name})
      .subscribe((res) => {
        this.msg.create('success', '修改成功');
        this.getData('', '');
        // this.typeData();
      });
  }

  onSelect(type: any) {
    this.selectTypeName = type.name;
    this.selected.emit(this.selectTypeName);
  }

  selectedNode(e: any, type: string) {
    this.initSearch();
    this.getData(e, type);
  }

  async checkeParent() {
    const resA: [] = await new Promise((resolve, reject) => {
      this.crudService
        .search(environment.baseUrl + 'api', 'website/category', {filter: [`parent.id||$isnull`]})
        .subscribe((res: []) => {
          resolve(res);
        });
    });

    if (resA && resA.length === 0) {
      await new Promise((resolve, reject) => {
        this.crudService
          .add(environment.baseUrl + 'api', 'website/category', {
            id: 1,
            parent: null,
            name: '管理类别',
          })
          .subscribe((res1) => {
            resolve(res1);
          });
      });
    }
  }

  async addType(callbackResult: any) {
    if (this.treeDatas.length <= 1) {
      await this.checkeParent();
    }

    this.crudService
      .add(environment.baseUrl + 'api', 'website/category', {
        parent: callbackResult.parent,
        name: callbackResult.name,
      })
      .subscribe((res) => {
        callbackResult.subObj.addFlg = false;
        callbackResult.subObj.newType = '';

        this.getData('', '');
      });
  }

  getData(e: any, type: string) {
    this.loading = true;
    this.allChecked = false;
    this.searchParams = {};

    if ('type' === type) {
      this.search.type = e;
    }
    if (this.search.keyword) {
      this.searchParams.keyword = this.search.keyword;
    }
    if (this.search.type) {
      this.searchParams.c = this.search.type;
    }
    if (this.search.limit) {
      this.searchParams.limit = this.search.limit;
    }
    if (this.search.offset) {
      this.searchParams.offset = this.search.offset;
    }

    this.crudService.search(environment.baseUrl + 'api', 'website/searchWithCategoryCount', this.searchParams)
      .subscribe((res: any) => {
        this.loading = false;
        this.data = res.data;
        this.data = this.data.map((item) => {
          return {
            ...item,
            checked: false,
          };
        });
        this.data.push(null);

        this.search.total = res.total;
        this.search.limit = res.limit;
        this.search.offset = res.offset;
        // 左侧树
        this.treeDatas = [];
        this.treeDatas.push({title: '全部', key: 0, isLeaf: true});
        for (const item of res.categoryCount) {
          this.treeDatas.push({
            title: item.name,
            name: item.name,
            id: item.id,
            cnt: item.cnt,
            key: item.id,
            isLeaf: true,
          });
        }
      });
  }

  addUser() {
  }

  selectAll(): void {
    this.data = this.data.map((item) => {
      if (item) {
        return {
          ...item,
          checked: this.allChecked,
        };
      }
      return item;
    });
  }

  showModal(): void {
    this.isVisible = true;
  }

  handleOk(): void {
    this.isOkLoading = true;
    setTimeout(() => {
      this.isVisible = false;
      this.isOkLoading = false;
    }, 500);
  }

  handleCancel(): void {
    this.isVisible = false;
  }

  onPageIndexChange(e: any) {
    this.search.offset = (e - 1) * this.search.limit;
    this.getData(this.search.keyword, this.search.type);
  }

  onAddUser(e: any) {
    this.search.offset = 0;
    this.getData(this.search.keyword, this.search.type);
  }

  async deleteUser() {
    this.loading = true;
    const ids = [];
    for (const item of this.data) {
      if (item && item.checked) {
        ids.push(item.id);
      }
    }
    if (ids.length === 0) {
      this.loading = false;
      this.msg.create('info', '请选择删除网站');
      return;
    } else {
      this.modalService.confirm({
        nzTitle: '删除数据',
        nzContent: '<b style="color: red;">确定删除这些数据吗？</b>',
        nzOkType: 'danger',
        nzOnOk: async () => {
          const count = await this.deleteUserForList(ids);
          setTimeout(() => {
            if (count !== 0 && count === ids.length) {
              this.loading = false;
              this.msg.success('删除成功');
              this.getData(this.search.keyword, this.search.type);
            }
          }, 500);
        },
        nzOnCancel: () => {
          this.loading = false;
          console.log('Cancel');
        },
      });
    }
  }

  async deleteUserForList(params: any): Promise<number> {
    let count = 0;
    if (params) {
      const res = await new Promise((resolve, reject) => {
        for (const id of params) {
          this.crudService.del(environment.baseUrl + 'api', 'website', id).subscribe((res_articles) => {
          });
          count++;
          resolve(count);
        }
      });
    }
    return count;
  }

  imgClick(item: any) {
    this.router.navigate(['/website/readonly-detail/' + item.id]);
  }

  getEmitter(event: any) {
    this.getData('', '');
    window.open('/#/website/detail/' + event.websiteId);
  }

  downLoad(type: string) {
    this.loading = true;

    const ids = [];
    for (const item of this.data) {
      if (item && item.checked) {
        ids.push(item.id);
      }
    }

    if (ids.length === 0) {
      this.msg.create('info', '请选择重点网站');
      this.loading = false;
      return;
    } else {
      if (type === 'doc') {
        this.download('api/website/document/downloadToDoc', ids.join(','), type);
      } else if (type === 'pdf') {
        this.download('api/website/document/downloadToPdf', ids.join(','), type);
      }
    }
  }

  download(subUrl: string, params: any, type: string) {
    let msgId = '';
    if (type === 'doc') {
      msgId = this.msg.loading('文档生成中，请您耐心等待！', {nzDuration: 0}).messageId;
    } else if (type === 'pdf') {
      msgId = this.msg.loading('PDF生成中，请您耐心等待！', {nzDuration: 0}).messageId;
    }

    this.http
      .get(environment.baseUrl + subUrl + '/' + params, {
        responseType: 'blob',
        // headers: new HttpHeaders().append('Content-Type', 'application/json'),
      })
      .subscribe(
        (resp) => {
          // resp: 文件流
          this.downloadFile(resp);
          this.loading = false;
          this.msg.remove(msgId);
        },
        (error1) => {
          this.loading = false;
          this.msg.remove(msgId);
        },
      );
  }

  downloadFile(data) {
    const contentType = 'application/octet-stream';

    const blob = new Blob([data], {type: contentType});
    const url = window.URL.createObjectURL(blob);

    // 以动态创建a标签进行下载
    const a = document.createElement('a');
    const fileName = this.datePipe.transform(new Date(), 'yyyyMMdd');
    a.href = url;
    a.download = fileName + '.zip';
    a.click();
    window.URL.revokeObjectURL(url);
  }
}

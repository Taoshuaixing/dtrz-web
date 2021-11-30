import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import * as ClassicEditorBuild from 'src/assets/ckeditor.js';
import {environment} from '@env/environment';
import {ActivatedRoute, Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzModalService} from 'ng-zorro-antd/modal';
import {DatePipe} from '@angular/common';
import {CrudService} from 'src/app/routes/crud.service';

@Component({
  selector: 'app-edit-website',
  templateUrl: './edit-website.component.html',
  styleUrls: ['./edit-website.component.less'],
})
export class EditWebsiteComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    public msgSrv: NzMessageService,
    private crudService: CrudService,
    private datePipe: DatePipe,
    private modalService: NzModalService,
  ) {
  }

  website: any = {};
  public Editor = ClassicEditorBuild;

  public isDisabled = false;
  isVisible = false;
  isOkLoading = false;
  loading = false;

  fileId: number;
  types: any = null;
  selectTypeName = '';
  data: any[] = [];
  newData = {
    title: '',
    value: '',
  };

  userKeyValues = [
    {label: 'UID', isEdit: false, val: '', type: 'string', maxLen: 5},
    {label: 'Tid', isEdit: false, val: '', type: 'string', maxLen: 6},
    {label: '地区', isEdit: false, val: '', type: 'string'},
    {label: '排名', isEdit: false, val: '', type: 'string'},
    {label: '网址', isEdit: false, val: '', type: 'string'},
    {label: '在封/未封', isEdit: false, val: '', type: 'radio', items: ['在封', '未封']},
    {label: '立场', isEdit: false, val: '', type: 'string'},
    {label: '常有重点人发文', isEdit: false, val: '', type: 'radio', items: ['是', '否']},
  ];

  @Output() selected = new EventEmitter<string>();

  public componentEvents: string[] = [];
  config = {
    // language: 'zh-cn',
    placeholder: '网站概况',
    ckfinder: {
      // Upload the images to the server using the CKFinder QuickUpload command.
      uploadUrl: environment.baseUrl + 'api/website/uploadFileBase64',
    },
  };
  config_body = {
    // language: 'zh-cn',
    placeholder: '封堵历史',
    ckfinder: {
      // Upload the images to the server using the CKFinder QuickUpload command.
      uploadUrl: environment.baseUrl + 'api/website/uploadFileBase64',
    },
  };
  baseUrl = environment.baseUrl;
  subUrl = 'api/website/upload-file/';
  imgsrc = environment.baseUrl + 'api/website/down/';
  websiteageId = 0;
  uploadFlg = false;
  allChecked = false; // 类别多选框
  indeterminate = true; // 类别多选框
  checkOptionsOne = []; // 类别多选框数组

  offsetTop = 10;

  ngOnInit() {
    if (this.route.snapshot.paramMap.has('id')) {
      this.websiteageId = Number(this.route.snapshot.paramMap.get('id'));
      // if (this.websiteageId) {
      this.initData();
      // }
    }
    this.typeData();
  }

  /**
   * 更新类别
   */
  updateCategory() {
    const categories = [];
    this.checkOptionsOne.map((jtem) => {
      if (jtem.checked) {
        categories.push({id: jtem.id});
      }
    });

    if (this.websiteageId !== 0) {
      this.crudService.patch(this.baseUrl + 'api/website/' + this.website.id, {categories}).subscribe((res) => {
      });
    }
  }

  typeData() {
    this.crudService.searchAll(environment.baseUrl + 'api', 'website/category').subscribe((types: any) => {
      this.types = types.children;
    });
  }

  onSelect(type: any) {
    this.selectTypeName = type.name;
    this.selected.emit(this.selectTypeName);
  }

  initData() {
    // 查询分类数据
    this.crudService.get(environment.baseUrl + 'api', 'website', 'category').subscribe((res) => {
      this.checkOptionsOne = res[0].children;
      this.checkOptionsOne.map((item) => {
        item.label = item.name;
        item.checked = false;
      });
    });

    if (this.websiteageId > 0) {
      this.crudService.get(environment.baseUrl + 'api', 'website', this.websiteageId)
        .subscribe((website: any) => {
          if (!website) {
            this.msgSrv.create('error', '该条数据已删除！');
            return;
          }
          this.website.id = this.websiteageId;
          this.website.title = website.title;
          this.website.type = website.type;
          this.website.brief = website.brief;
          this.website.contentHtml = website.contentHtml;
          this.website.content = website.content;
          this.website.avatar = website.avatar;
          const baseInfoStr = website.baseInfo;
          if (baseInfoStr) {
            const baseInfo = JSON.parse(baseInfoStr);
            baseInfo.map((it) => {
              const info = this.userKeyValues.find((f) => f.label === it.label);
              if (info) {
                info.val = it.val;
              } else {
                this.userKeyValues.push(it);
              }
            });
          }

          this.crudService.get(environment.baseUrl + 'api', 'website', this.website.id).subscribe((res1: any) => {
            if (res1.categories !== undefined && res1.categories.length !== 0) {
              res1.categories.map((item) => {
                this.checkOptionsOne.map((jtem) => {
                  if (jtem.id === item.id) {
                    jtem.checked = true;
                  }
                });
              });
            }
          });
        });
    }
  }

  async save() {
    this.loading = true;
    let baseInfo: string;
    if (this.userKeyValues) {
      this.userKeyValues = this.userKeyValues.filter((it) => it.label !== '');
      baseInfo = JSON.stringify(this.userKeyValues);
    }
    let content = '';
    let contentHtml = '';
    if (this.website.contentHtml && this.website.contentHtml.length > 0) {
      let retMenu: any;
      retMenu = this.doMenu(this.website.contentHtml);
      contentHtml = this.website.contentHtml;
      content = JSON.stringify(retMenu.menus);
    }

    const categories = [];
    this.checkOptionsOne.map((jtem) => {
      if (jtem.checked) {
        categories.push({id: jtem.id});
      }
    });

    if (!this.website.title) {
      this.msgSrv.error('请输入网站名称!');
      return;
    }

    let res: any;

    const updParams = {
      title: this.website.title,
      baseInfo,
      contentHtml,
      content,
      categories,
      brief: this.website.brief,
      avatar: {id: null},
    };

    if (this.website.avatar && this.website.avatar.id) {
      updParams.avatar = {id: this.website.avatar.id};
    }

    if (!this.websiteageId) {
      // 新增
      res = await new Promise((resolve, reject) => {
        this.crudService.add(this.baseUrl + 'api', 'website', updParams).subscribe((res_articles) => {
          resolve(res_articles);
        });
      });
    } else {
      res = await new Promise((resolve, reject) => {
        this.crudService
          .update(this.baseUrl + 'api', 'website', this.websiteageId, updParams)
          .subscribe((res_articles) => {
            resolve(res_articles);
          });
      });
    }

    this.website.id = res.id;
    this.websiteageId = res.id;
    this.loading = false;
    this.msgSrv.success('保存成功');
    this.ngOnInit();
  }

  onUploaderChange(upInfo: any) {
    if (upInfo.fileList === 0) {
      return;
    }
    if (upInfo.file.size > 2 * 1024 * 1024) {
      this.msgSrv.create('warning', '文件超过2M，请重新选择');
      upInfo.fileList.pop();
      return;
    }
    if (upInfo.type === 'success') {
      this.uploadFlg = false;
      this.fileId = upInfo.file.response.id;
      this.website.avatar = {id: upInfo.file.response.id};
    } else if (upInfo.type === 'removed') {
      this.website.avatar = null;
    }
  }

  deleteUser() {
    if (this.websiteageId !== 0) {
      this.modalService.confirm({
        nzTitle: '删除数据',
        nzContent: '<b style="color: red;">确定删除此数据吗？</b>',
        nzOkType: 'danger',
        nzOnOk: () => {
          this.crudService.del(this.baseUrl + 'api', 'website', this.websiteageId).subscribe((res) => {
            this.loading = false;
            this.msgSrv.success('删除成功');
            this.closeWin();
          });
        },
        nzOnCancel: () => {
          this.loading = false;
          console.log('Cancel');
        },
      });
    }
  }

  doMenu(contentHtml: string) {
    // let s = '<h2>0001</h2> 123d<h3>3001</h3>d<h3>3002</h3> <h2>0101</h2> asdad <h2>0201</h2>asd sss <h3>0002</h3>-4567-89';
    if (!contentHtml || contentHtml.length < 0) {
      return;
    }
    let s = contentHtml;
    // const r = /<h2>(.*?)<\/h2>|<h3>(.*?)<\/h3>/;
    const r = /<h2(.*?)<\/h2>|<h3(.*?)<\/h3>/g;
    const matchAll = s.match(r);
    const menus = [];
    if (matchAll) {
      // const m = r.exec(s);
      let markNo = 0;
      matchAll.forEach((value: string, index: number) => {
        let s1 = '' + value;
        markNo++;
        let type = 'h2';
        if (!s1.startsWith('<h2')) {
          type = 'h3';
        }
        s1 = s1.substring(3);
        s1 = '<' + type + ' id="mark' + markNo + '" ' + s1;
        s = s.replace(value, s1);
        let name = this.rmHtml(value);
        name = name.trim();
        if (name && name !== '&nbsp;') {
          menus.push({
            name: this.rmHtml(value),
            type,
            mark: `mark${markNo}`,
          });
        }
      });
    }

    return {menus, contentHtml: s};
  }

  rmHtml(inStr: string) {
    const aRegex = /<[^>]*>/g;
    return inStr.replace(aRegex, '');
  }

  async show() {
    await this.save();
    if (this.websiteageId !== 0) {
      // window.open('/#/website/readonly-detail/' + this.websiteageId);
      this.router.navigate(['/website/readonly-detail/' + this.websiteageId]);
    } else {
      // window.open('/#/website/readonly-detail/' + this.websiteageId);
      this.router.navigate(['/website/readonly-detail/' + this.websiteageId]);
    }
  }

  closeWin() {
    // window.close();
    this.router.navigate(['/website/list']);
  }

  delItem(item: any) {
    this.userKeyValues = this.userKeyValues.filter((it) => it.label !== item.label);
  }

  editItem(item: any) {
    item.isEdit = true;
  }

  blurItem(item: any) {
    item.isEdit = false;
  }

  addItem() {
    this.userKeyValues.push({label: '', isEdit: true, val: '', type: 'string'});
  }

  // 日期事件
  onChangeDate(result: Date, item: any): void {
    item.val = this.datePipe.transform(result, 'yyyy-MM-dd');
  }
}

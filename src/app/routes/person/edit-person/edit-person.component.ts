import {Component, EventEmitter, OnInit, Output} from '@angular/core';
// import * as ClassicEditorBuild from '@ckeditor/ckeditor5-build-balloon-block';
import {PersonageI} from '../person.module';
import {environment} from '@env/environment';
import {ActivatedRoute, Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzModalService} from 'ng-zorro-antd/modal';
import {CrudService} from '../../crud.service';
import {DatePipe} from '@angular/common';
import * as ClassicEditorBuild from 'src/assets/ckeditor.js';

@Component({
  selector: 'app-edit-person',
  templateUrl: './edit-person.component.html',
  styleUrls: ['./edit-person.component.less'],
})
export class EditPersonComponent implements OnInit {
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

  public Editor = ClassicEditorBuild;

  public isDisabled = false;
  isVisible = false;
  isOkLoading = false;
  loading = false;
  person: PersonageI = {
    id: 1,
    title: '',
    // brief:'<p>编辑简介内容</p><p>&nbsp;</p>',
    brief: '编辑简介内容',
    baseInfo: '',
    // content:'<p>编辑详细内容</p><p>&nbsp;</p>',
    contentHtml: '编辑详细内容',
  };
  fileId: number;
  types: any = null;
  selectTypeName = '';
  data: any[] = [];
  newData = {
    title: '',
    value: '',
  };
  categoryName = '管理类别';
  userKeyValues = [
    {label: '人物编号', isEdit: false, val: '', type: 'string'},
    {label: '中文名', isEdit: false, val: '', type: 'string'},
    {label: '英文名', isEdit: false, val: '', type: 'string'},
    {label: '别名', isEdit: false, val: '', type: 'string'},
    {label: '性别', isEdit: false, val: '', type: 'radio', items: ['男', '女']},
    {label: '民族', isEdit: false, val: '', type: 'string'},
    {label: '出生年月', isEdit: false, val: '', type: 'string'},
    {label: '籍贯', isEdit: false, val: '', type: 'string'},
    {label: '出生地', isEdit: false, val: '', type: 'string'},
    {label: '现居住地', isEdit: false, val: '', type: 'string'},
    {label: '职业', isEdit: false, val: '', type: 'string'},
    {label: '纳入监看时间', isEdit: false, val: null, type: 'date'},
    {label: '纳入监看原因', isEdit: false, val: '', type: 'string'},
  ];

  @Output() selected = new EventEmitter<string>();

  public componentEvents: string[] = [];
  config = {
    // language: 'zh-cn',
    placeholder: '主要经历',
    ckfinder: {
      // Upload the images to the server using the CKFinder QuickUpload command.
      uploadUrl: environment.baseUrl + 'api/article/uploadFileBase64',
    },
  };
  config_body = {
    // language: 'zh-cn',
    placeholder: '主要著作',
    ckfinder: {
      // Upload the images to the server using the CKFinder QuickUpload command.
      uploadUrl: environment.baseUrl + 'api/article/uploadFileBase64',
    },
  };
  baseUrl = environment.baseUrl;
  subUrl = 'api/article/upload-file/';
  imgsrc = environment.baseUrl + 'api/article/down/';
  personageId = 0;
  uploadFlg = false;
  allChecked = false; // 类别多选框
  indeterminate = true; // 类别多选框
  checkOptionsOne = []; // 类别多选框数组

  offsetTop = 10;

  ngOnInit() {
    if (this.route.snapshot.paramMap.has('id')) {
      this.personageId = Number(this.route.snapshot.paramMap.get('id'));
      // if (this.personageId) {
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

    if (this.personageId !== 0) {
      this.crudService
        .patch(this.baseUrl + 'api/article/' + this.person.id, {categories})
        .subscribe((res) => {
        });
    }
  }

  typeData() {
    this.crudService.search(environment.baseUrl + 'api', 'category', {
      filter: [`name||$eq||${this.categoryName}`],
    }).subscribe((types: any) => {
      this.types = types.children;
    });
  }

  onSelect(type: any) {
    this.selectTypeName = type.name;
    this.selected.emit(this.selectTypeName);
  }

  initData() {
    // 查询分类数据
    this.crudService.search(environment.baseUrl + 'api', 'category', {
      filter: [`name||$eq||${this.categoryName}`],
    }).subscribe((res) => {
      this.checkOptionsOne = res[0].children;
      this.checkOptionsOne.map((item) => {
        item.label = item.name;
        item.checked = false;
      });
    });

    if (this.personageId > 0) {
      this.crudService.get(environment.baseUrl + 'api', 'article', this.personageId)
        .subscribe((person: any) => {
          if (!person) {
            this.msgSrv.create('error', '该条数据已删除！');
            return;
          }
          this.person.id = this.personageId;
          this.person.title = person.title;
          this.person.type = person.type;
          this.person.brief = person.brief;
          this.person.contentHtml = person.contentHtml;
          this.person.content = person.content;
          this.person.avatar = person.avatar;
          const baseInfoStr = person.baseInfo;
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

          this.crudService
            .get(environment.baseUrl + 'api', 'article', this.person.id)
            .subscribe((res1: any) => {
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
    if (this.person.contentHtml && this.person.contentHtml.length > 0) {
      let retMenu: any;
      retMenu = this.doMenu(this.person.contentHtml);
      contentHtml = this.person.contentHtml;
      content = JSON.stringify(retMenu.menus);
    }

    const categories = [];
    this.checkOptionsOne.map((jtem) => {
      if (jtem.checked) {
        categories.push({id: jtem.id});
      }
    });

    if (!this.person.title) {
      this.msgSrv.error('请输入人物名称!');
      return;
    }

    let res: any;

    const updParams = {
      title: this.person.title,
      baseInfo,
      contentHtml,
      content,
      categories,
      brief: this.person.brief,
      avatar: {id: null},
    };

    if (this.person.avatar && this.person.avatar.id) {
      updParams.avatar = {id: this.person.avatar.id};
    }

    if (!this.personageId) {
      // 新增
      res = await new Promise((resolve, reject) => {
        this.crudService.add(this.baseUrl + 'api', 'article', updParams).subscribe((res_articles) => {
          resolve(res_articles);
        });
      });
    } else {
      res = await new Promise((resolve, reject) => {
        this.crudService
          .update(this.baseUrl + 'api', 'article', this.personageId, updParams)
          .subscribe((res_articles) => {
            resolve(res_articles);
          });
      });
    }

    this.person.id = res.id;
    this.personageId = res.id;
    this.loading = false;
    this.msgSrv.success('保存成功');
    this.ngOnInit();
  }

  // beforeUpload = (file: File) => {
  //   const fileName: any = file.name;
  //   return new Observable((observer: Observer<boolean>) => {
  //     // const isExcel =  file.type.indexOf('excel') >= 0 || file.type.indexOf('spreadsheetml') >= 0;
  //     const isImg = /(jpg|png)$/i.test(fileName);
  //     if (!isImg) {
  //       this.msgSrv.error('导入的文件类型错误！');
  //       observer.complete();
  //       return;
  //     }

  //     observer.next(isImg);
  //     observer.complete();
  //   });
  // };

  onUploaderChange(upInfo: any) {
    console.log('upInfo', upInfo);
    if (upInfo.fileList === 0) {
      return;
    }
    if (upInfo.file.type) {
    }
    if (upInfo.file.size > 2 * 1024 * 1024) {
      this.msgSrv.create('warning', '文件超过2M，请重新选择');
      upInfo.fileList.pop();
      return;
    }
    if (upInfo.type === 'success') {
      this.uploadFlg = false;
      this.fileId = upInfo.file.response.id;
      this.person.avatar = {id: upInfo.file.response.id};
    } else if (upInfo.type === 'removed') {
      this.person.avatar = null;
    }
  }

  deleteUser() {
    if (this.personageId !== 0) {
      this.modalService.confirm({
        nzTitle: '删除数据',
        nzContent: '<b style="color: red;">确定删除此数据吗？</b>',
        nzOkType: 'danger',
        nzOnOk: () => {
          this.crudService.del(this.baseUrl + 'api', 'article', this.personageId).subscribe((res) => {
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
    if (this.personageId !== 0) {
      // window.open('/#/person/readonly-detail/' + this.personageId);
      this.router.navigate(['/person/readonly-detail/' + this.personageId]);
    } else {
      // window.open('/#/person/readonly-detail/' + this.personageId);
      this.router.navigate(['/person/readonly-detail/' + this.personageId]);
    }
  }

  closeWin() {
    // window.close();
    this.router.navigate(['/person/list']);
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

import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {environment} from '@env/environment';
import {CrudService} from '../../crud.service';
import {NzMessageService} from 'ng-zorro-antd/message';

@Component({
  selector: 'app-edit-person-base',
  templateUrl: './edit-person-base.component.html',
  styles: [
      `
      .big {
        width: 100%;
        height: 176px;
      }

      .category label {
        width: 100%;
      }
    `,
  ],
})
export class EditPersonBaseComponent implements OnInit {
  constructor(private fb: FormBuilder, private crudService: CrudService, public msgSrv: NzMessageService) {
  }

  isVisible: boolean;
  isOkLoading: boolean;
  validateForm!: FormGroup;
  avatar: string;
  title: string;
  fileId: number;
  fileList = [];

  @Output() editorOk = new EventEmitter();
  @Input() category: any;
  @Input() nzType: string;

  baseUrl = environment.baseUrl;
  subUrl = 'api/article/upload-file/';

  ngOnInit() {
    this.validateForm = this.fb.group({
      title: [null, [Validators.required]],
      category: [null, []],
      duty: [null, []],
    });
  }

  showModal() {
    this.avatar = '';
    this.title = '';
    this.fileId = null;
    this.fileList = [];

    this.validateForm.markAsPristine();
    this.validateForm.markAsUntouched();
    // tslint:disable-next-line:forin
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].patchValue('');
    }

    this.isVisible = true;
  }

  handleCancel() {
    this.isVisible = false;
  }

  async handleOk() {
    if (!this.validateForm.valid) {
      // tslint:disable-next-line:forin
      for (const i in this.validateForm.controls) {
        this.validateForm.controls[i].markAsDirty();
        this.validateForm.controls[i].updateValueAndValidity();
      }
      return;
    }

    // 新增
    const res: any = await new Promise((resolve, reject) => {
      const addParams: any = {
        title: this.title,
        avatar: {id: this.fileId},
      };
      if (this.category && this.category !== '0') {
        addParams.categories = [{id: this.category}];
      }
      this.crudService.add(this.baseUrl + 'api', 'article', addParams).subscribe((res_articles) => {
        resolve(res_articles);
      });
    });

    const personId = res.id;
    if (!personId) {
      this.msgSrv.error('保存失败');
      return;
    }
    this.msgSrv.success('保存成功');
    // window.open('/#/person/detail/' + personId);
    this.editorOk.emit({title: this.title, personId});
    this.isVisible = false;
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
      this.fileId = upInfo.file.response.id;
    } else if (upInfo.type === 'error') {
      this.msgSrv.error('图片上传失败');
    }
  }
}

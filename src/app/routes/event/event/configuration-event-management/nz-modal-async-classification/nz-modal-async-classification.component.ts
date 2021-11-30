import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CrudService} from '../../../../crud.service';
import {ActivatedRoute} from '@angular/router';
import {FormBuilder} from '@angular/forms';
import {NzMessageService} from 'ng-zorro-antd/message';

@Component({
  selector: 'app-nz-modal-async-classification',
  templateUrl: './nz-modal-async-classification.component.html',
  styles: [],
})
export class NzModalAsyncClassificationComponent {
  constructor(
    private crudService: CrudService,
    private activedrouted: ActivatedRoute,
    private fb: FormBuilder,
    private message: NzMessageService,
  ) {}

  @Input() classifiLevel: number;
  @Input() actionClassifyName: string;
  @Input() classifiId: number;
  @Input() classifiParentId: number;
  @Input() isAdd: boolean;
  @Input() btnName: string;
  @Output() hide_emitter = new EventEmitter();

  isVisible = false;
  isOkLoading = false;

  showModal(): void {
    this.isVisible = true;
    if (this.isAdd) {
      this.actionClassifyName = '';
      this.classifiId = 0;
    }
  }

  handleOk(): void {
    if (!this.actionClassifyName) {
      this.message.create('warning', `请输入分类名称`);
      return;
    }
    // 传递结果给父页面
    this.hide_emitter.emit({
      actionClassifyName: this.actionClassifyName,
      classifiId: this.classifiId,
      classifiParentId: this.classifiParentId,
    });
    this.isVisible = false;
  }

  handleCancel(): void {
    this.isVisible = false;
  }
}

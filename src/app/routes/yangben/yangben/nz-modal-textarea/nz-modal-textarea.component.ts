import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CrudService} from "../../../crud.service";
import {ActivatedRoute} from "@angular/router";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {NzMessageService} from "ng-zorro-antd/message";

@Component({
  selector: 'app-nz-modal-textarea',
  templateUrl: './nz-modal-textarea.component.html',
  styles: []
})
export class NzModalTextareaComponent implements OnInit {

  constructor(
    private crudService: CrudService,
    private activedrouted: ActivatedRoute,
    private fb: FormBuilder,
    private message: NzMessageService,
  ) {
  }

  @Input() btnName: any;
  @Input() btnSize: any;
  @Input() inputName: string;
  @Input() parentId: any;
  @Input() isAdd: boolean;
  @Output() editorOk = new EventEmitter();
  @Input() onBeforeSave: (inputName: string, parentId: any) => Promise<boolean>;
  validateForm!: FormGroup;
  isVisible = false;
  isOkLoading = false;


  ngOnInit() {
    this.validateForm = this.fb.group({
      inputName: [null, [Validators.required]],
    });
  }

  showModal() {
    this.isVisible = true;
    if (this.isAdd) {
      this.inputName = '';
    }
  }

  handleCancel() {
    this.isVisible = false;
  }

  async handleOk() {
    if (!this.validateForm.valid) {
      for (const i in this.validateForm.controls) {
        this.validateForm.controls[i].markAsDirty();
        this.validateForm.controls[i].updateValueAndValidity();
      }
      return;
    }

    let nameArr = this.inputName.trim().split('\n');
    nameArr = nameArr.filter(f => f != "").map(m => {
      return m.trim();
    });

    if (nameArr.length === 0) {
      this.message.create('warning', '名称为空，请重新输入!');
      return;
    }

    const arr = nameArr.find(f => f.length >= 50);
    if (arr) {
      this.message.create('warning', '名称【' + arr + '】长度超过50字符!');
      return;
    }

    // 传递结果给父页面
    this.editorOk.emit({
      nameList: nameArr,
      parentId: this.parentId,
    });
    this.isVisible = false;
  }


}

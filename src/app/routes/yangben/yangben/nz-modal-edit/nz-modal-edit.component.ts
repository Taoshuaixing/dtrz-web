import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute} from "@angular/router";
import {CrudService} from "../../../crud.service";

@Component({
  selector: 'app-nz-modal-edit',
  templateUrl: './nz-modal-edit.component.html',
  styles: []
})
export class NzModalEditComponent implements OnInit {

  constructor(
    private crudService: CrudService,
    private activedrouted: ActivatedRoute,
    private fb: FormBuilder,
    private message: NzMessageService,
  ) {}

  @Input() btnName: any;
  @Input() showIcon: any;
  @Input() btnSize:any;
  @Input() inputId: number;
  @Input() inputName: string;
  @Input() parentId: any;
  @Input() isAdd: boolean;
  @Output() editorOk = new EventEmitter();
  @Input() onBeforeSave: (inputName: string, inputId: number,parentId: any) => Promise<boolean>;
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
      this.inputId = 0;
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

    if (await this.onBeforeSave(this.inputName, this.inputId,this.parentId)) {
      this.message.create('warning', '输入的名称已存在');
      return;
    }
    // 传递结果给父页面
    this.editorOk.emit({
      inputName: this.inputName,
      inputId:this.inputId,
      parentId:this.parentId,
    });
    this.isVisible = false;
  }
}

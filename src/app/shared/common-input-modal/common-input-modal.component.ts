import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CrudService } from 'src/app/routes/crud.service';

@Component({
  selector: 'app-common-input-modal',
  templateUrl: './common-input-modal.component.html',
  styles: [],
})
export class CommonInputModalComponent implements OnInit {
  constructor(private fb: FormBuilder, public msg: NzMessageService, public crudService: CrudService) { }

  isVisible: boolean;
  isOkLoading: boolean;
  @Input() inputName: string;
  @Input() btnName: string;
  @Input() selectedId: number;
  @Input() onBeforeSave: (inputName: string, selectedId: number) => Promise<boolean>;
  @Output() editorOk = new EventEmitter();
  validateForm!: FormGroup;

  ngOnInit() {
    this.validateForm = this.fb.group({
      inputName: [null, [Validators.required]],
    });
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

    if (await this.onBeforeSave(this.inputName, this.selectedId)) {
      this.msg.create('warning', '输入的名称已存在');
      return;
    }

    this.editorOk.emit(this.inputName);
    this.isVisible = false;
  }

  showModal() {
    this.validateForm.clearValidators();
    this.isVisible = true;
  }
}

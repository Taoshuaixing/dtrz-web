import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CrudService } from '../../../../crud.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { environment } from '@env/environment';
import { SettingsService } from '@delon/theme';

@Component({
  selector: 'app-edit-yangben',
  templateUrl: './edit-yangben.component.html',
  styleUrls: ['./edit-yangben.component.less'],
})
export class EditYangbenComponent implements OnInit {
  constructor(
    private crudService: CrudService,
    private activedrouted: ActivatedRoute,
    private router: Router,
    public msgSrv: NzMessageService,
    private fb: FormBuilder,
    public settingService: SettingsService,
  ) {}

  breadcrumbs = [{ name: '首页' }, { name: '自定义字段编辑 ' }];

  title = '';
  validateForm!: FormGroup;
  fieldName = '';
  fieldTypeValue?: number;
  loading = false;
  fieldType?: number;
  compareFlag = false;
  attachNameFlag = false;
  listOfFieldType = [
    { label: '文本', value: 1 },
    { label: '多行文本', value: 2 },
    { label: '日期', value: 3 },
    { label: '数值', value: 4 },
    { label: '单选下拉列表', value: 5 },
    { label: '复选下拉列表', value: 6 },
  ];
  listOfFieldTypeValues: Array<{ label: string; value: number }> = [];
  showFlag = false;
  tempId = null;
  isDisabled = false;
  isFocus = false;

  async ngOnInit() {
    this.loading = true;
    // 验证初始化
    this.validateForm = this.fb.group({
      fieldName: [null, [Validators.required]],
      fieldType: [null, [Validators.required]],
      fieldTypeValue: [null, []],
      compareFlag: [null, []],
      attachNameFlag: [null, []],
    });

    this.activedrouted.queryParams.subscribe((params) => {
      this.tempId = params.tempId;
      // if (this.tempId) {
      //   this.isDisabled = true;
      // }
    });

    this.listOfFieldTypeValues = await new Promise((resolve, reject) => {
      this.crudService
        .search(environment.baseUrl + 'api', 'yangben-option-config', {
          filter: 'parent.id||$isnull',
          join: 'parent',
        })
        .subscribe((res: any[]) => {
          // console.log(res);
          const vals = [];
          res.forEach((it) => {
            vals.push({ label: it.name, value: it.id });
          });
          resolve(vals);
        });
    });

    // 获取当前记录
    if (this.tempId) {
      const res: any = await new Promise((resolve, reject) => {
        this.crudService
          .get(environment.baseUrl + 'api', 'yangben-field-define', this.tempId)
          .subscribe((res1: any) => {
            resolve(res1);
          });
      });
      this.fieldName = res.fieldName;
      this.fieldType = res.fieldType;
      if (this.fieldType === 5 || this.fieldType === 6) {
        this.showFlag = true;
        if (res.yangbenOptionConfig) {
          this.fieldTypeValue = res.yangbenOptionConfig.id;
          this.isDisabled = true;
        }
      }
      this.compareFlag = res.compareFlag === 1 ? true : false;
      this.attachNameFlag = res.attachNameFlag === 1 ? true : false;
    }
    this.loading = false;
  }

  async submit() {
    if (!this.validateForm.valid) {
      // tslint:disable-next-line:forin
      for (const i in this.validateForm.controls) {
        this.validateForm.controls[i].markAsDirty();
        this.validateForm.controls[i].updateValueAndValidity();
      }
      return;
    }

    if (this.fieldName.length > 30) {
      this.msgSrv.warning('字段名称最多30个字符，请重新输入！');
      return;
    }

    if (!this.isDisabled) {
      const checkName = await this.validateFieldName(this.fieldName);
      if (checkName) {
        this.msgSrv.warning('字段名称已存在，请重新输入！');
        return;
      }
    }

    if ((this.fieldType === 5 || this.fieldType === 6) && !this.fieldTypeValue) {
      this.msgSrv.warning('请选择字段值！');
      return;
    }

    if (!this.isDisabled) {
      const checkFieldTypeValue = await this.validateFieldTypeValue(this.fieldTypeValue);
      if (checkFieldTypeValue) {
        this.msgSrv.warning('字段值已被使用，请重新选择！');
        return;
      }
    }

    this.loading = true;
    // 开始保存
    if (this.tempId) {
      // 修改

      if (!(this.fieldType === 5 || this.fieldType === 6)) {
        this.fieldTypeValue = null;
      }

      this.crudService.get(environment.baseUrl + 'api', 'yangben-field-define', this.tempId).subscribe((res: any) => {
        this.crudService
          .update(environment.baseUrl + 'api', 'yangben-field-define', this.tempId, {
            updateUser: this.settingService.user.userId,
            id: this.tempId,
            fieldName: this.fieldName,
            fieldType: this.fieldType,
            compareFlag: this.compareFlag,
            attachNameFlag: this.attachNameFlag,
            yangbenOptionConfig: { id: this.fieldTypeValue },
          })
          .subscribe((res1) => {
            this.loading = false;
            this.back();
          });
      });
    } else {
      // 新增
      this.crudService
        .add(environment.baseUrl + 'api', 'yangben-field-define', {
          createUser: this.settingService.user.userId,
          id: 0,
          fieldName: this.fieldName,
          fieldType: this.fieldType,
          compareFlag: this.compareFlag,
          attachNameFlag: this.attachNameFlag,
          yangbenOptionConfig: { id: this.fieldTypeValue },
        })
        .subscribe((res) => {
          this.loading = false;
          this.back();
        });
    }
  }

  back() {
    this.router.navigate(['/yangben/yangben-field-define']);
  }

  focus() {
    this.isFocus = true;
  }
  change() {
    if (this.loading) {
      return;
    }

    if (this.fieldType === null) {
      this.msgSrv.warning('请选择字段类型');
      return;
    }

    if (this.fieldType === 5 || this.fieldType === 6) {
      this.showFlag = true;
    } else {
      this.showFlag = false;
    }

    // 默认值设置
    if (this.isFocus) {
      if (this.fieldType === 2 || (this.fieldType === 1 && this.fieldName.indexOf('标题') >= 0)) {
        this.compareFlag = true;
      } else {
        this.compareFlag = false;
      }
    }
  }

  async validateFieldName(fieldName: string): Promise<boolean> {
    const filter = [`fieldName||$eq||${this.fieldName}`];
    if (this.tempId) {
      filter.push(`id||$ne||${this.tempId}`);
    }
    // 查询字段名称是否存在
    const res = await new Promise((resolve, reject) => {
      this.crudService
        .search(environment.baseUrl + 'api', 'yangben-field-define', {
          filter: filter,
        })
        .subscribe((res: any[]) => {
          resolve(res.length > 0);
        });
    });
    if (res) {
      return true;
    } else {
      return false;
    }
  }

  async validateFieldTypeValue(fieldTypeValue: number) {
    // 查询下拉复选值是否被使用
    const res = await new Promise((resolve, reject) => {
      this.crudService
        .search(environment.baseUrl + 'api', 'yangben-field-define', {
          filter: [`yangbenOptionConfig.id||$eq||${fieldTypeValue}`],
          join: [`yangbenOptionConfig`],
        })
        .subscribe((res: any[]) => {
          resolve(res.length > 0);
        });
    });
    if (res) {
      return true;
    } else {
      return false;
    }
  }
}

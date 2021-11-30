import { Component, OnInit } from '@angular/core';
import { CrudService } from '../../../../crud.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { YangbenService } from '../../../../yangben/yangben.service';
import { environment } from '@env/environment';
import { SettingsService } from '@delon/theme';
import { JournalService } from '../../../journal.service';

@Component({
  selector: 'app-journal-template-detail',
  templateUrl: './journal-template-detail.component.html',
  styleUrls: ['./journal-template-detail.component.css'],
})
export class JournalTemplateDetailComponent implements OnInit {
  constructor(
    private crudService: CrudService,
    private router: Router,
    private fb: FormBuilder,
    private activedrouted: ActivatedRoute,
    public settingService: SettingsService,
    private yangbenService: YangbenService,
    public msg: NzMessageService,
    public journalService: JournalService,
  ) {}

  breadcrumbs = [{ name: '模板配置' }, { name: '详情页' }];
  tempId = null;
  validateForm!: FormGroup;
  templateName = '';
  templateSummary = '';
  loading = false;
  duty: any;
  contentTypeList = [
    { id: 1, name: '文本' },
    { id: 2, name: '富文本' },
    { id: 3, name: '事件' },
    { id: 5, name: '未来事件' },
    { id: 6, name: '样本' },
  ];
  expandEventClassifyKeys = [];
  eventClassifyNodes = [];
  eventTemplateList = [];
  eventTagList = [];
  listOfControl = [];
  eventFieldList: any;
  templateSummaryObj = { richTextSummary: '' };
  sortType: any;
  quotationFlag = 1;
  yangbenCntFlag = 0;

  async ngOnInit() {
    this.duty = '0';
    this.sortType = '0';
    // 验证初始化
    this.validateForm = this.fb.group({
      templateName: [null, [Validators.required]],
      // templateSummary: [null, []],
    });

    this.activedrouted.queryParams.subscribe((params) => {
      this.tempId = params.tempId;
    });

    await this.getEventClassifyList();
    this.eventTemplateList = await this.journalService.getEventTemplateList();
    this.eventTagList = await this.yangbenService.getSignList();
    this.eventFieldList = await this.yangbenService.getAllEventField();

    if (this.tempId) {
      this.listOfControl = [];
      const res: any = await new Promise((resolve, reject) => {
        this.crudService
          .get(environment.baseUrl + 'api', 'journal-config-template', this.tempId)
          .subscribe((res1: any) => {
            resolve(res1);
          });
      });

      this.templateName = res.templateName;
      this.templateSummary = res.templateSummary;
      this.duty = res.duty;
      this.sortType = res.sortType + '';
      this.quotationFlag = res.quotationFlag;
      this.yangbenCntFlag = res.yangbenCntFlag;

      if (res.configTemplateDetails.length > 0) {
        res.configTemplateDetails.sort((a, b) => {
          return a.sortId - b.sortId;
        });

        res.configTemplateDetails
          .filter((f) => f.parent === null)
          .map((m) => {
            const detail: any = this.getTemplateDetail(m);

            const children = [];
            if (m.children && m.children.length > 0) {
              m.children.map((it) => {
                const detail2 = this.getTemplateDetail(it);
                children.push(detail2);
              });
            }

            let isInclude2Level = false;
            if (children.length > 0) {
              isInclude2Level = true;
            }

            detail.isInclude2Level = isInclude2Level;
            detail.children = children;

            this.listOfControl.push(detail);
          });
      }
    } else {
      this.addField(0, false);
    }
  }

  getTemplateDetail(it: any) {
    const checkOptions = [];
    checkOptions.push({ label: '包含样本', value: 0, checked: it.withYangben === 1 });
    checkOptions.push({ label: '包含日期', value: 1, checked: it.withEventDate === 1 });
    checkOptions.push({ label: '是否合并', value: 2, checked: it.mergeFlag === 1 });

    let checkBoxDisabled = false;
    if (it.contentType === 1 || it.contentType === 2 || it.contentType === 6) {
      checkBoxDisabled = true;
    }

    const item: any = {};
    if (it.contentType === 3 || it.contentType === 5) {
      item.showFlag = true;
      item.eventClassifyId = it.eventClassifyId;
      item.eventTemplateId = it.eventTemplateId;

      if (it.eventTagId) {
        const eventTags = [];
        eventTags.push(it.eventTagFieldId);
        eventTags.push(it.eventTagId);
        item.eventTags = eventTags;
      }
    }

    return {
      templateDetailId: it.id,
      contentTitle: it.contentTitle,
      contentType: it.contentType,
      checkOptions: checkOptions,
      checkBoxDisabled: checkBoxDisabled,
      item: item,
    };
  }

  async getEventClassifyList() {
    // 获取所有事件分类，用于下拉
    const treeData: any = await this.yangbenService.searchEventClassify();
    if (treeData) {
      this.eventClassifyNodes = treeData.eventClassifyNodes;
      this.expandEventClassifyKeys = treeData.expandEventClassifyKeys;
    }
  }

  async submit() {
    this.loading = true;

    if (this.templateName === '' || this.templateName === null) {
      this.msg.warning('模板名称为空');
      return;
    }

    if (await this.checkName()) {
      this.msg.warning('模板名称已经存在');
      return;
    }

    const validateRes = this.validateContent();
    if (validateRes && validateRes.isok === false) {
      this.msg.warning(validateRes.msg);
      return;
    }

    const configTemplateDetails = this.listOfControl.map((m) => {
      const level1 = {
        id: 0,
        contentTitle: m.contentTitle,
        contentType: m.contentType,
        eventClassifyId: m.item.eventClassifyId,
        eventTemplateId: m.item.eventTemplateId,
        eventTagId: null,
        eventTagParentId: null,
        eventTagFieldId: null,
        mergeFlag: 0,
        withYangben: null,
        withEventDate: null,
        children: [],
      };

      if (m.children && m.children.length > 0) {
        m.children.map((child) => {
          const level2 = {
            id: 0,
            contentTitle: child.contentTitle,
            contentType: child.contentType,
            eventClassifyId: child.item.eventClassifyId,
            eventTemplateId: child.item.eventTemplateId,
            eventTagId: null,
            eventTagParentId: null,
            eventTagFieldId: null,
            mergeFlag: 0,
            withYangben: null,
            withEventDate: null,
          };

          if (child.item.eventTags && child.item.eventTags.length > 0) {
            level2.eventTagId = child.item.eventTags[1];
            level2.eventTagFieldId = child.item.eventTags[0];
            const ff = this.eventFieldList.find((f) => f.id === level2.eventTagFieldId);
            if (ff) {
              level2.eventTagParentId = ff.yangbenOptionConfig.id;
            }
          }

          const options = child.checkOptions.filter((f) => f.checked === true);
          if (options) {
            options.map((it) => {
              if (it.value === 0) {
                level2.withYangben = 1;
              } else if (it.value === 1) {
                level2.withEventDate = 1;
              } else if (it.value === 2) {
                level2.mergeFlag = 1;
              }
            });
          }

          if (child.templateDetailId > 0) {
            level2.id = child.templateDetailId;
          }

          level1.children.push(level2);
        });
      }

      if (m.item.eventTags && m.item.eventTags.length > 0) {
        level1.eventTagId = m.item.eventTags[1];
        level1.eventTagFieldId = m.item.eventTags[0];
        const ff = this.eventFieldList.find((f) => f.id === level1.eventTagFieldId);
        if (ff) {
          level1.eventTagParentId = ff.yangbenOptionConfig.id;
        }
      }

      const options = m.checkOptions.filter((f) => f.checked === true);
      if (options) {
        options.map((it) => {
          if (it.value === 0) {
            level1.withYangben = 1;
          } else if (it.value === 1) {
            level1.withEventDate = 1;
          } else if (it.value === 2) {
            level1.mergeFlag = 1;
          }
        });
      }

      if (m.templateDetailId > 0) {
        level1.id = m.templateDetailId;
      }

      return level1;
    });

    if (this.tempId) {
      // 修改
      this.crudService
        .update2(environment.baseUrl + 'api', 'journal-config-template', this.tempId, {
          updateUser: this.settingService.user.userId,
          id: this.tempId,
          templateName: this.templateName,
          templateSummary: this.templateSummaryObj.richTextSummary,
          duty: this.duty,
          sortType: Number(this.sortType),
          quotationFlag: this.quotationFlag,
          yangbenCntFlag: this.yangbenCntFlag,
          postId: this.settingService.user.posts[0].id,
          configTemplateDetails: configTemplateDetails,
        })
        .subscribe((res1) => {
          this.loading = false;
          this.back();
        });
    } else {
      this.crudService
        .add(environment.baseUrl + 'api', 'journal-config-template', {
          createUser: this.settingService.user.userId,
          id: 0,
          templateName: this.templateName,
          templateSummary: this.templateSummaryObj.richTextSummary,
          duty: this.duty,
          sortType: Number(this.sortType),
          quotationFlag: this.quotationFlag,
          yangbenCntFlag: this.yangbenCntFlag,
          postId: this.settingService.user.posts[0].id,
          configTemplateDetails: configTemplateDetails,
        })
        .subscribe((res) => {
          this.loading = false;
          this.back();
        });
    }
  }

  async checkName(): Promise<boolean> {
    const filter = [
      `templateName||$eq||${this.templateName}`,
      `deleteFlag||$eq||0`,
      `postId||$eq||${this.settingService.user.posts[0].id}`,
    ];

    if (this.tempId) {
      filter.push(`id||$ne||${this.tempId}`);
    }

    const cnt: number = await new Promise<number>((resolve) => {
      this.crudService
        .search(environment.baseUrl + 'api', 'journal-config-template', {
          filter: filter,
        })
        .subscribe((res: any[]) => {
          resolve(res.length);
        });
    });
    return cnt > 0;
  }

  validateContent() {
    let isok = true;
    let msg = '';

    this.listOfControl.map((m) => {
      if (m.contentTitle === '') {
        isok = false;
        msg = '一级标题内容有为空的';
        return;
      }

      if (m.children && m.children.length > 0) {
        m.children.map((it) => {
          if (it.contentTitle === '') {
            isok = false;
            msg = '二级标题内容有为空的';
            return;
          }

          if (it.contentType === '') {
            isok = false;
            msg = '【' + it.contentTitle + '】 标题内容类型为空！';
            return;
          }
        });
      } else {
        if (m.contentType === '' || m.contentType === 0) {
          isok = false;
          msg = '【' + m.contentTitle + '】 标题内容类型为空！';
          return;
        }
      }
    });

    return { isok: isok, msg: msg };
  }

  back() {
    this.router.navigate(['/journal/journal-template-config']);
  }

  change(control: any, index: number) {
    if (index >= 0) {
      control.children[index].checkOptions.forEach((it) => (it.checked = false));

      if (
        control.children[index].contentType === 1 ||
        control.children[index].contentType === 2 ||
        control.children[index].contentType === 6
      ) {
        control.children[index].checkBoxDisabled = true;
        control.children[index].item.showFlag = false;
      } else if (control.children[index].contentType === 3 || control.children[index].contentType === 5) {
        control.children[index].checkBoxDisabled = false;
        control.children[index].item.showFlag = true;
      } else {
        control.children[index].checkBoxDisabled = false;
        control.children[index].item.showFlag = false;
      }
    } else {
      control.checkOptions.forEach((it) => (it.checked = false));

      if (control.contentType === 1 || control.contentType === 2 || control.contentType === 6) {
        control.checkBoxDisabled = true;
        control.item.showFlag = false;
      } else if (control.contentType === 3 || control.contentType === 5) {
        control.checkBoxDisabled = false;
        control.item.showFlag = true;
      } else {
        control.checkBoxDisabled = false;
        control.item.showFlag = false;
      }
    }
  }

  addField(i: number, isInclude2Level: boolean, e?: MouseEvent): void {
    if (e) {
      e.preventDefault();
    }

    let id = 0;
    if (this.listOfControl.length > 0) {
      id = Math.max(...this.listOfControl.map((x) => x.id)) + 1;
    }

    const control: any = this.initItem();
    control.isInclude2Level = isInclude2Level;
    control.children = [];

    if (isInclude2Level) {
      const child = this.initItem();
      control.children.push(child);
      control.contentType = 0;
    }

    this.listOfControl.splice(i + 1, 0, control);
    console.log(this.listOfControl[i + 1]);
    if (i > 0) {
      this.validateForm.addControl(this.listOfControl[i + 1].contentTitle, new FormControl(null, Validators.required));
    } else {
      this.validateForm.addControl(this.listOfControl[i].contentTitle, new FormControl(null, Validators.required));
    }
  }

  async removeField(i: any, e: MouseEvent) {
    e.preventDefault();

    if (this.tempId) {
      const templateDetailId = i.templateDetailId;
      const cnt = await this.checkRef(templateDetailId);
      if (cnt > 0) {
        this.msg.info('标题内容已被使用，不可删除！');
        return;
      }
    }

    if (this.listOfControl.length > 1) {
      const index = this.listOfControl.indexOf(i);
      this.listOfControl.splice(index, 1);
      console.log(this.listOfControl);
      this.validateForm.removeControl(i.controlInstance);
    }
  }

  async checkRef(templateDetailId: number) {
    return await new Promise<number>((resolve) => {
      this.crudService
        .search(environment.baseUrl + 'api', 'journal-data-detail', {
          filter: [`templateDetail.id||$eq||${templateDetailId}`],
          join: [`templateDetail`],
        })
        .subscribe((res: any[]) => {
          resolve(res.length);
        });
    });
  }

  callbackEmitter($event) {
    $event.setItemObject[$event.setItemAttr] = $event.content;
  }

  addField2Level(control: any, i: number, $event: MouseEvent) {
    const child = this.initItem();

    control.children.splice(i + 1, 0, child);
  }

  async removeField2Level(control: any, j: number, $event: MouseEvent) {
    const templateDetailId = control.children[j].templateDetailId;
    const cnt = await this.checkRef(templateDetailId);
    if (cnt > 0) {
      this.msg.info('标题内容已被使用，不可删除！');
      return;
    }

    control.children.splice(j, 1);
  }

  initItem() {
    return {
      id: 0,
      contentTitle: '',
      contentType: '',
      checkOptions: [
        { label: '包含样本', value: 0, checked: false },
        { label: '包含日期', value: 1, checked: false },
        { label: '是否合并', value: 2, checked: false },
      ],
      checkBoxDisabled: false,
      item: {
        showFlag: false,
        eventClassifyId: null,
        eventTemplateId: null,
        eventTags: [],
      },
    };
  }
}

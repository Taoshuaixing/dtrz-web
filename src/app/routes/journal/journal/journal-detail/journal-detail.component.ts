import { Component, OnInit, ViewChild } from '@angular/core';
import { environment } from '@env/environment';
import { CrudService } from '../../../crud.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { NzModalJournalEventComponent } from '../nz-modal-journal-event/nz-modal-journal-event.component';
import { dateAdd, getDuty, getDutyDate } from '@shared/utils/date-util';
import { ExcelDownloadService } from '../../../excelDownload.service';
import { Observable, Observer } from 'rxjs';
import { SettingsService } from '@delon/theme';
import { deepCompare } from '@shared/utils/compare-util';
import { NzModalService } from 'ng-zorro-antd/modal';
import { YangbenService } from '../../../yangben/yangben.service';
import { JournalOptionSettingsComponent } from './journal-option-settings/journal-option-settings.component';

@Component({
  selector: 'app-journal-detail',
  templateUrl: './journal-detail.component.html',
  styleUrls: ['./journal-detail.component.css'],
})
export class JournalDetailComponent implements OnInit {
  constructor(
    private crudService: CrudService,
    private fb: FormBuilder,
    private router: Router,
    private activedrouted: ActivatedRoute,
    private datePipe: DatePipe,
    public msg: NzMessageService,
    public settingService: SettingsService,
    private excelService: ExcelDownloadService,
    private modalService: NzModalService,
    private yangbenService: YangbenService,
  ) {}

  @ViewChild('editEventDrawer', { static: true })
  nzModalJournalEventComponent: NzModalJournalEventComponent;

  @ViewChild('optionSettings', { static: true })
  journalOptionSettingsComponent: JournalOptionSettingsComponent;

  validateForm!: FormGroup;
  tabs: any;
  journalId: any;
  fromBy: any;
  loading = false;
  curDate: any;
  postList = [];
  eventList = [];
  tab: any = {};
  templateId = 0;
  templateName: any;
  wordContent: any;
  summary = '';
  summaryObj = { richTextSummary: '' };

  actionUrl = environment.baseUrl + 'api/journal-data/upload';
  showUploadList = false;
  uploadLoading = false;
  userId: any;

  oldJournal: any = {};
  step: any;

  postId = 0;
  yangbenfieldList = [];
  eventFieldList = [];
  eventFieldId: any;

  async ngOnInit() {
    this.loading = true;

    this.eventFieldId = await this.yangbenService.getEventFieldId();
    this.postId = this.settingService.user.posts[0].id;
    this.userId = this.settingService.user.userId;

    await this.searchEventFieldList();
    await this.searchYangbenFieldList();

    // 验证初始化
    this.validateForm = this.fb.group({
      journalName: [null, [Validators.required]],
    });

    this.activedrouted.queryParams.subscribe((params) => {
      this.templateId = params.templateId;
      this.fromBy = params.fromBy;
      this.journalId = params.journalId;
      this.step = null;
    });

    this.curDate = getDutyDate(new Date());
    await this.getPostList();

    if (this.journalId) {
      const res = await this.searchJournalData();
      this.templateId = this.tab.templateId;
      this.templateName = this.tab.templateName;
      this.tab = res;
      // console.log('res_tab', res);
      this.summary = this.tab.summary;
      this.summaryObj.richTextSummary = this.summary;
      this.oldJournal = JSON.parse(JSON.stringify(res));
    } else {
      this.tabs = await this.getTemplateList();
      this.tab = this.tabs[0];
      this.templateId = this.tab.templateId;
      this.templateName = this.tab.templateName;
      this.summary = this.tab.templateSummary;
      this.summaryObj.richTextSummary = this.summary;
    }
    this.loading = false;
  }

  async searchJournalData() {
    const res: any = await new Promise((resolve, reject) => {
      this.crudService.get(environment.baseUrl + 'api', 'journal-data', this.journalId).subscribe((res: any) => {
        resolve(res);
      });
    });
    // console.log('res', res);
    const defaultList: any[] = await this.getDefaultItem('', '');

    const configTemplateDetails: any = await new Promise((resolve, reject) => {
      this.crudService
        .get(environment.baseUrl + 'api', 'journal-config-template', res.template.id)
        .subscribe((res_1: any) => {
          const details = res_1.configTemplateDetails.filter((f) => f.parent === null);
          details.sort((a: any, b: any) => {
            return a.sortId - b.sortId;
          });
          resolve(details);
        });
    });

    configTemplateDetails.map(async (m) => {
      if (m.children && m.children.length === 0) {
        const data = res.journalDataDetails.filter((f) => f.templateDetail.id === m.id && f.parent === null);
        if (data) {
          m = this.matchData(m, data, defaultList);
        }
      } else {
        m.children.map((child) => {
          const data = res.journalDataDetails.filter((f) => f.templateDetail.id === child.id && f.parent === null);
          if (data) {
            child = this.matchData(child, data, defaultList);
          }
        });
      }
    });

    const postName = this.postList.find((f) => f.id === res.template.postId).postName;
    this.curDate = getDutyDate(new Date(this.datePipe.transform(res.createdTime, 'yyyy-MM-dd HH:mm:ss')));

    return {
      reportStatus: res.reportStatus,
      journalName: res.journalName,
      duty: res.duty,
      postId: res.template.postId,
      postName: postName,
      templateName: res.template.templateName,
      wordContent: res.wordContent,
      summary: res.summary,
      configTemplateDetails: configTemplateDetails,
      templateId: res.template.id,
    };
  }

  matchData(m: any, data: any, defaultList: any) {
    if (m.contentType === 1) {
      if (data.length > 0) {
        m.textareaValue = data[0].content;
      } else {
        m.textareaValue = '';
      }
    } else if (m.contentType === 2) {
      if (data.length > 0) {
        m.richTextValue = data[0].content;
      } else {
        m.richTextValue = '';
      }
    } else {
      const listOfControl = [];
      if (data.length > 0) {
        data.map((item) => {
          const yangben = [];
          if (item.children && item.children.length > 0) {
            item.children.map((it) => {
              yangben.push({ content: it.content, yangbenId: it.yangbenId });
            });
          } else {
            if (m.withYangben === 1) {
              yangben.push({ content: '', yangbenId: 0 });
              m.expandForm = false;
            }
          }

          let prefix = '';
          let suffix = '';

          if (item.prefix) {
            prefix = item.prefix;
          } else {
            prefix = this.getDefultItemVal(defaultList, 'prefix', m.contentTitle);
          }
          if (item.suffix) {
            suffix = item.suffix;
          } else {
            suffix = this.getDefultItemVal(defaultList, 'suffix', m.contentTitle);
          }

          listOfControl.push({
            prefix: prefix,
            content: item.content,
            suffix: suffix,
            yangben: yangben,
            eventId: item.eventId,
          });
        });
      } else {
        listOfControl.push({
          prefix: this.getDefultItemVal(defaultList, 'prefix', m.contentTitle),
          content: '',
          suffix: this.getDefultItemVal(defaultList, 'suffix', m.contentTitle),
          yangben: [],
          eventId: 0,
        });

        if (m.withYangben === 1) {
          listOfControl[0].yangben = [
            {
              content: '',
              yangbenId: 0,
            },
          ];
        }
      }
      m.listOfControl = listOfControl;
    }

    return m;
  }

  async getPostList() {
    this.postList = await new Promise((resolve, reject) => {
      this.crudService.searchAll(environment.baseUrl_zxtj + 'api', 'post').subscribe((res: any[]) => {
        resolve(res);
      });
    });
  }

  async getTemplateList() {
    const filter = [`status||$eq||1`];
    if (this.templateId > 0) {
      filter.push(`id||$eq||${this.templateId}`);
    }

    const defaultList: any = await this.getDefaultItem('', '');
    return new Promise((resolve, reject) => {
      this.crudService
        .search(environment.baseUrl + 'api', 'journal-config-template', {
          filter: filter,
          sort: ['id,ASC'],
        })
        .subscribe((res: any[]) => {
          if (res) {
            res = res.map((m) => {
              const postName = this.postList.find((f) => f.id === m.postId).postName;
              const journalDate = getDutyDate(new Date());
              m.duty = getDuty(journalDate);
              let duty = '白班';
              if (m.duty === 'n') {
                duty = '夜班';
              }
              const journalName = this.datePipe.transform(journalDate, 'yyyy/MM/dd') + postName + duty + '日志';

              m.configTemplateDetails = m.configTemplateDetails.filter((f) => f.parent === null);

              m.configTemplateDetails.sort((a: any, b: any) => {
                return a.sortId - b.sortId;
              });

              m.configTemplateDetails = m.configTemplateDetails.map((it) => {
                const item: any = this.initItem(it, defaultList);

                if (it.children && it.children.length > 0) {
                  const list = [];
                  it.children.map((child) => {
                    const obj = this.initItem(child, defaultList);
                    list.push(obj);
                  });

                  item.children = list;
                }

                return item;
              });

              return { ...m, postName: postName, journalName: journalName, templateId: m.id };
            });
            resolve(res);
          }
        });
    });
  }

  initItem(data: any, defaultList: any) {
    const item = {
      ...data,
      reportStatus: 0,
      richTextValue: '',
      listOfControl: [
        {
          id: 0,
          prefix: this.getDefultItemVal(defaultList, 'prefix', data.contentTitle),
          content: '',
          suffix: this.getDefultItemVal(defaultList, 'suffix', data.contentTitle),
          events: [],
          yangben: [],
          eventId: 0,
        },
      ],
      children: [],
    };

    if (data.withYangben === 1) {
      item.listOfControl[0].yangben = [
        {
          content: '',
          yangbenId: 0,
        },
      ];
    }

    return item;
  }

  back(fromBy: any) {
    this.router.navigate(['/journal/' + fromBy]);
  }

  async submitForm(flag: number, fromBy: any, tab: any) {
    this.loading = true;
    if (this.summaryObj.richTextSummary) {
      tab.summary = this.summaryObj.richTextSummary;
    }
    let journalData: any = this.getJournalData(tab);

    if (flag === 1) {
      //暂存
      journalData.reportStatus = 1;
    }

    if (flag === 2) {
      //下一步 验证事件、样本是否需要插入数据
      const res = await this.checkData(journalData, tab);
      if (!res.isOK) {
        this.loading = false;
        this.msg.warning(res.msg);
        return;
      } else {
        journalData = res.journalData;
      }
    }

    let journal;
    if (this.journalId) {
      // 修改
      journal = await new Promise((resolve, reject) => {
        this.crudService
          .update(environment.baseUrl + 'api', 'journal-data', this.journalId, journalData)
          .subscribe((res1) => {
            resolve(res1);
          });
      });
    } else {
      journal = await new Promise((resolve, reject) => {
        this.crudService.add(environment.baseUrl + 'api', 'journal-data', journalData).subscribe((res) => {
          resolve(res);
        });
      });
    }

    if (flag === 1) {
      //暂存
      this.loading = false;
      this.router.navigateByUrl('/journal/journal-drafts');
    } else if (flag === 2) {
      //下一步

      if (this.oldJournal.wordContent) {
        const compareResult = deepCompare(tab, this.oldJournal);
        if (!compareResult) {
          this.modalService.confirm({
            nzTitle: `排版内容`,
            nzContent: `<b style="color: red;">是否覆盖上次排版内容？</b>`,
            nzOkType: 'danger',
            nzCancelText: '否',
            nzOkText: '是',
            nzOnOk: async () => {
              const wordContent = await this.getWordContent(this.journalId);

              this.crudService
                .update2(environment.baseUrl + 'api', 'journal-data', this.journalId, {
                  wordContent: wordContent,
                })
                .subscribe((res1) => {
                  this.loading = false;
                  this.router.navigate(['/journal/journal-view'], {
                    queryParams: {
                      fromBy: this.fromBy,
                      journalId: journal.id,
                    },
                  });
                });
            },
            nzOnCancel: () => {
              this.loading = false;
              this.router.navigate(['/journal/journal-view'], {
                queryParams: {
                  fromBy: this.fromBy,
                  journalId: journal.id,
                },
              });
            },
          });
        } else {
          this.loading = false;
          this.router.navigate(['/journal/journal-view'], {
            queryParams: {
              fromBy: this.fromBy,
              journalId: journal.id,
            },
          });
        }
      } else {
        this.loading = false;
        this.router.navigate(['/journal/journal-view'], {
          queryParams: {
            fromBy: this.fromBy,
            journalId: journal.id,
          },
        });
      }
    }
  }

  async getWordContent(journalId: number) {
    const res: any = await new Promise((resolve, reject) => {
      this.crudService
        // .search(environment.baseUrl + 'api', 'journal-data/getWordContent', {
        //   filter: [`id||$eq||${this.journalId}`],
        // })
        .get(environment.baseUrl + 'api', 'journal-data/getWordContent', this.journalId)
        .subscribe((res1: any) => {
          resolve(res1.html);
        });
    });
    return res;
  }

  getJournalData(tab: any) {
    let journalDataDetails = [];

    if (tab.configTemplateDetails) {
      tab.configTemplateDetails.map((m) => {
        if (m.children && m.children.length === 0) {
          journalDataDetails = this.buildJournalDataDetail(journalDataDetails, m);
        } else {
          m.children.map((child) => {
            journalDataDetails = this.buildJournalDataDetail(journalDataDetails, child);
          });
        }
      });
    }

    return {
      journalName: tab.journalName,
      summary: tab.summary,
      reportStatus: tab.reportStatus,
      step: 1,
      journalDataDetails: journalDataDetails,
      template: { id: tab.templateId },
      postId: tab.postId,
      createUser: this.userId,
      duty: tab.duty,
    };
  }

  buildJournalDataDetail(journalDataDetails: any, m: any) {
    if (m.contentType === 1) {
      if (m.textareaValue) {
        journalDataDetails.push({
          templateDetail: { id: m.id, contentType: m.contentType },
          content: m.textareaValue,
        });
      }
    } else if (m.contentType === 2) {
      if (m.richTextValue) {
        journalDataDetails.push({
          templateDetail: { id: m.id, contentType: m.contentType },
          content: m.richTextValue,
        });
      }
    } else {
      const events = m.listOfControl.filter((f) => f.content.trim() != '');
      if (events && events.length > 0) {
        events.map((it) => {
          const yangben = [];

          const ybs = it.yangben.filter((ff) => ff.content.trim() != '');
          if (ybs && ybs.length > 0) {
            ybs.map((item) => {
              yangben.push({
                templateDetail: { id: m.id },
                contentType: 0,
                content: item.content,
                yangbenId: item.yangbenId,
              });
            });
          }

          journalDataDetails.push({
            templateDetail: { id: m.id, contentType: m.contentType },
            prefix: it.prefix,
            content: it.content,
            suffix: it.suffix,
            children: yangben,
            eventId: it.eventId,
          });
        });
      } else {
        // journalDataDetails.push({
        //   templateDetail: {id: m.id, contentType: m.contentType},
        // });
      }
    }

    return journalDataDetails;
  }

  callbackEmitter($event) {
    $event.setItemObject[$event.setItemAttr] = $event.content;
  }

  async reset() {
    const template = await this.getTemplateList();
    this.tab = template[0];
  }

  async callPage(parent: any) {
    // await parent.ngOnInit();
    //  子窗口回调，翻页功能
  }

  async addField(detail: any, i: number, e?: MouseEvent) {
    if (e) {
      e.preventDefault();
    }

    let id = 0;
    if (detail.listOfControl && detail.listOfControl.length > 0) {
      id = Math.max(...detail.listOfControl.map((x) => x.id)) + 1;
    }

    const defaultList: any = await this.getDefaultItem('', '');

    const control = {
      id,
      prefix: this.getDefultItemVal(defaultList, 'prefix', detail.contentTitle),
      content: '',
      suffix: this.getDefultItemVal(defaultList, 'suffix', detail.contentTitle),
      yangben: [],
      eventId: 0,
    };
    if (detail.withYangben === 1) {
      control.yangben = [
        {
          content: '',
          yangbenId: 0,
        },
      ];
    }

    detail.listOfControl.splice(i + 1, 0, control);
  }

  removeField(detail: any, i: any, e: MouseEvent): void {
    if (detail.listOfControl.length > 0) {
      const index = detail.listOfControl.indexOf(i);
      detail.listOfControl.splice(index, 1);
    }

    if (detail.listOfControl.length === 0) {
      const control = {
        id: 0,
        prefix: '',
        content: '',
        suffix: '',
        yangben: [],
        eventId: 0,
      };
      if (detail.withYangben === 1) {
        control.yangben = [
          {
            content: '',
            yangbenId: 0,
          },
        ];
      }
      detail.listOfControl.push(control);
    }
    console.log(detail.listOfControl);
  }

  addFieldYangben(detail: any, control: any, i: number): void {
    const yangben = {
      content: '',
      yangbenId: 0,
    };

    control.yangben.splice(i + 1, 0, yangben);
    control.expandForm = true;
  }

  removeYangben(detail: any, control: any, j: number) {
    control.yangben.splice(j, 1);
    if (control.yangben.length === 0) {
      control.yangben.push({ id: 0, prefix: '', content: '', yangbenId: 0 });
    }
  }

  getEditorEmitter(callbackResult: any) {
    if (callbackResult.selectEvent && callbackResult.selectEvent.length > 0) {
      const prefix = callbackResult.detail.listOfControl[callbackResult.index].prefix;
      const suffix = callbackResult.detail.listOfControl[callbackResult.index].suffix;

      const events = [];
      callbackResult.selectEvent.map((m) => {
        let eventContent = '';
        if (callbackResult.detail.withEventDate === 1 && m.eventDate) {
          eventContent = this.datePipe.transform(m.eventDate, 'yyyy年MM月dd') + ' ，' + m.name;
        } else {
          eventContent = m.name;
        }

        let control = { prefix: prefix, content: eventContent, suffix: suffix, yangben: [], eventId: m.id };
        const yangben = [];

        if (m.yangbenNodes && m.yangbenNodes.length > 0) {
          m.yangbenNodes.map((it) => {
            yangben.push({ content: it.title, yangbenId: it.key });
          });
        } else {
          if (callbackResult.detail.withYangben === 1) {
            yangben.push({ id: 0, prefix: '', content: '', yangbenId: 0 });
          }
        }
        control.yangben = yangben;

        const eventCheck = callbackResult.detail.listOfControl.find((f) => Number(f.eventId) === control.eventId);
        if (eventCheck) {
          for (let i = 0; i < callbackResult.detail.listOfControl.length; i++) {
            if (Number(callbackResult.detail.listOfControl[i].eventId) === control.eventId) {
              callbackResult.detail.listOfControl[i] = {
                id: 0,
                prefix: '',
                content: '',
                suffix: '',
                yangben: [],
                eventId: -1,
              };
            }
          }
        }
        events.push(control);
      });

      callbackResult.detail.listOfControl.splice(callbackResult.index, 1, ...events);

      callbackResult.detail.listOfControl = callbackResult.detail.listOfControl.filter((f) => f.eventId >= 0);
    }
  }

  radioChange(templateId: number) {
    this.tab = this.tabs.find((f) => f.id === templateId);
  }

  showModal(detail: any, index: number) {
    this.nzModalJournalEventComponent.showModal(detail, index);
  }

  showModalOption(type: any, control: any, contentTitle: any, btnName: any) {
    this.journalOptionSettingsComponent.showModal(type, control, contentTitle, btnName);
  }

  downloadTemplate(templateId: number) {
    this.excelService.download('journal', 'api/journal-data/downloadTemplate/' + templateId, {}, true);
  }

  beforeUpload = (file: File) => {
    const fileName: any = file.name;
    return new Observable((observer: Observer<boolean>) => {
      const isExcel = /(xls|xlsx)$/i.test(fileName);
      if (!isExcel) {
        this.msg.error('只能导入Excel类型的文件！');
        observer.complete();
        return;
      }

      observer.next(isExcel);
      observer.complete();
    });
  };

  async uploadChange($event: any) {
    if (!$event) {
      return;
    }

    this.showUploadList = true;
    this.uploadLoading = true;

    if ($event.type === 'success') {
      this.showUploadList = false;
      this.uploadLoading = false;
      $event.fileList.pop();

      if ($event.file.response.status === 'success') {
        this.journalId = $event.file.response.journalId;
        this.tab = await this.searchJournalData();
        this.templateId = this.tab.templateId;
        this.templateName = this.tab.templateName;
        this.step = 0;
      } else if ($event.file.response.status === 'fault') {
        this.msg.error($event.file.response.msg);
      }
    } else if ($event.type === 'error') {
      this.msg.create('error', '上传失败！');
      this.showUploadList = false;
      this.uploadLoading = false;
      $event.fileList.pop();
    }

    if ($event.type === 'success' || $event.type === 'error') {
    }
  }

  deleteImportData() {
    this.modalService.confirm({
      nzTitle: `删除模板`,
      nzContent: `<b style="color: red;">确定删除当前导入数据吗？</b>`,
      nzOkType: 'danger',
      nzOnOk: () => {
        this.crudService.del(environment.baseUrl + 'api', 'journal-data', this.journalId).subscribe((res) => {
          this.msg.create('success', `删除成功`);
          this.journalId = null;
          this.step = null;
          this.ngOnInit();
        });
      },
      nzOnCancel: () => console.log('Cancel'),
    });
  }

  setOption($event) {
    if ($event) {
      $event.control[$event.itemType] = $event.itemContent;
    }
  }

  async checkData(journalData: any, tab: any) {
    let isOK = true;
    let msg = '';
    //将页面的多层改为一层
    const newConfigTemplateDetails_noLevel = [];
    tab.configTemplateDetails.forEach((it) => {
      newConfigTemplateDetails_noLevel.push(it);
      if (it.children) {
        it.children.forEach((sub: any) => {
          sub.parent = { id: it.id };
          newConfigTemplateDetails_noLevel.push(sub);
        });
      }
    });

    const saveYangbenList = [];
    let yangbenIdx = 0;
    for (let m of journalData.journalDataDetails) {
      const configTemplateDetail = newConfigTemplateDetails_noLevel.find((f) => f.id === m.templateDetail.id);

      if (m.eventId === 0 || m.eventId === '0' || m.eventId === null) {
        if (m.templateDetail.contentType === 6 && !m.yangbenId) {
          //保存样本
          m = await this.saveYangben(m, null, null);
        } else {
          //验证事件名称是否超长 >500
          if (m.content.length > 500) {
            isOK = false;
            msg = `事件【${m.content.substring(0, 100)}...】长度超过500，请重新录入！`;
            break;
          }

          //验证事件名称是否存在
          const eventSearch: any = await new Promise((resolve, reject) => {
            this.crudService
              .search(environment.baseUrl + 'api', 'yangben-event-rec', {
                filter: [`name||$eq||${m.content}`],
              })
              .subscribe((res: any[]) => {
                resolve(res);
              });
          });

          if (eventSearch && eventSearch.length > 0) {
            m.eventId = eventSearch[0].id;
          } else {
            //保存事件
            this.eventFieldList = await Promise.all(
              this.eventFieldList.map(async (item) => {
                return (async () => {

                  item.fieldId = item.id;
                  if (item.fixName === 'startDate') {
                    item.valDate = new Date();
                  } else if (
                    item.yangbenOptionConfig &&
                    item.yangbenOptionConfig.id === configTemplateDetail.eventTagParentId
                  ) {
                    item.targetTableData = await this.yangbenService.getTableData(item.yangbenOptionConfig.id);

                    const selectedList = item.targetTableData.filter((f) => f.id === configTemplateDetail.eventTagId);
                    if (selectedList.length > 0) {
                      item.val = selectedList[0].name;
                    }
                    if (item.fieldType === 5) {
                      // 单选
                      item.valId = configTemplateDetail.eventTagId;
                    } else if (m.fieldType === 6) {
                      // 多选
                      item.valIdMulti = [configTemplateDetail.eventTagId];
                    }
                  }

                  return { ...item };
                })();
              }),
            );

            // 新增事件
            m.eventId = await new Promise((resolve, reject) => {
              this.crudService
                .add(environment.baseUrl + 'api', 'yangben-event', {
                  rec: {
                    createUser: this.settingService.user.userId,
                    currentStatus: 1,
                    name: m.content,
                    classifyEventId: configTemplateDetail.eventClassifyId,
                    eventTemplateId:
                      configTemplateDetail.eventTemplateId === null ? 0 : configTemplateDetail.eventTemplateId,
                  },
                  data: this.eventFieldList,
                })
                .subscribe((res: any) => {
                  resolve(res.eventId);
                });
            });
          }
        }
      }


      //验证样本是否需要新增
      if (m.children && m.children.length > 0) {
        for (let it of m.children) {
          if (!it.content) continue;
          if (it.content.trim() === '') {
            continue;
          }

          if (it.yangbenId === 0 || it.yangbenId === '0' || it.yangbenId === null) {
            ++yangbenIdx;
            saveYangbenList.push({
              idx: yangbenIdx,
              yangbenObj: it,
              eventFieldId: this.eventFieldId,
              eventId: Number(m.eventId),
            });
            it.idx = yangbenIdx;
          }
        }
      }
    }

    //保存样本
    for (const yangben of saveYangbenList) {
      yangben.yangbenObj = await this.saveYangben(yangben.yangbenObj, yangben.eventFieldId, yangben.eventId);
    }

    //journalData.children刷新
    for (let m of journalData.journalDataDetails) {
      if (m.children && m.children.length > 0) {
        for (let it of m.children) {
          if (it.idx) {
            it = saveYangbenList.find((f) => f.idx === it.idx);
          }
        }
      }
    }
    return { isOK: isOK, journalData: journalData, msg: msg };
  }

  async saveYangben(it: any, eventFieldId: any, eventId: any) {
    //新增样本
    const curYangbenfieldList = await Promise.all(
      this.yangbenfieldList.map(async (item) => {
        const newItem = {...item,fieldId: item.id };
        if (newItem.fixName === 'content') {
          newItem.valMulti = it.content;
        } else if (newItem.fieldId === eventFieldId) {
          newItem.targetTableData = await this.yangbenService.getTableData(item.yangbenOptionConfig.id);

          const selectedList = newItem.targetTableData.filter((f) => f.id === eventId);
          if (selectedList.length > 0) {
            newItem.val = selectedList[0].name;
            newItem.valId = eventId;
          }
        }
        return newItem;
      })
    );


    const checkFieldListRes: any = await this.validateFieldList(curYangbenfieldList);
    if (checkFieldListRes && checkFieldListRes.length > 0) {
      it.yangbenId = checkFieldListRes[0].id;
    } else {
      // 新增
      it.yangbenId = await new Promise((resolve, reject) => {
        this.crudService
          .add(environment.baseUrl + 'api', 'yangben-data', {
            rec: {
              createUser: this.settingService.user.userId,
              postId: this.settingService.user.posts[0].id,
              html: '',
            },
            data: curYangbenfieldList,
          })
          .subscribe((res_yangben: any) => {
            resolve(res_yangben.yangbenId);
          });
      });
    }

    return it;
  }

  async validateFieldList(fieldList: any[]) {
    const md5Str = await new Promise((resolve, reject) => {
      this.crudService
        .add(environment.baseUrl + 'api', 'yangben-data/getFieldListMd5', {
          data: fieldList,
        })
        .subscribe(async (res: any) => {
          resolve(res.md5);
        });
    });
    console.log('md5=' + md5Str);
    if (md5Str) {
      const filter = [`md5||$eq||${md5Str}`];
      // 查询字段名称是否存在
      const res = await new Promise((resolve, reject) => {
        this.crudService
          .search(environment.baseUrl + 'api', 'yangben-data-rec', {
            filter,
          })
          .subscribe((res: any[]) => {
            resolve(res);
          });
      });

      return res;
    }
    return null;
  }

  async searchYangbenFieldList() {
    const yangbenfieldList_all: any = await new Promise((resolve, reject) => {
      this.crudService
        .search(environment.baseUrl + 'api', 'yangben-field-define', {
          filter: [`deleteFlag||$eq||0`],
          sort: ['sortId,ASC', 'id,ASC'],
        })
        .subscribe((res: any[]) => {
          resolve(res);
        });
    });

    // const yangbenfiledList_post: any = (
    //   await this.yangbenService.getShowItem_post(this.settingService.user.posts[0].id)
    // ).fieldList;

    // 补充
    // this.yangbenfieldList = yangbenfiledList_post.map((m) => {
    //   const ff = yangbenfieldList_all.find((f) => f.id === m.fieldId);
    //   if (ff) {
    //     return { ...ff };
    //   }
    //   return m;
    // });

    this.yangbenfieldList = yangbenfieldList_all.filter(f=>f.fixName==='content' || f.id === this.eventFieldId);

    console.log("this.yangbenfieldList",this.yangbenfieldList)
    // this.yangbenfieldList = await Promise.all(
    //   this.yangbenfieldList.map(async (m) => {
        // return (async () => {
        //   if (m.yangbenOptionConfig) {
        //     const data = await this.yangbenService.getTableData(m.yangbenOptionConfig.id);
        //     return { ...m, fieldId: m.id, targetTableData: data };
        //   } else {
        //     return { ...m, fieldId: m.id };
        // }
        // })();
      // })
    // );
  }

  async searchEventFieldList() {
    this.eventFieldList = await new Promise((resolve, reject) => {
      this.crudService
        .search(environment.baseUrl + 'api', 'yangben-event-field-define', {
          filter: [`deleteFlag||$eq||0`],
          sort: ['sortId,ASC', 'id,ASC'],
        })
        .subscribe((res: any[]) => {
          resolve(res);
        });
    });

    // this.eventFieldList = await Promise.all(
    //   this.eventFieldList.map(async (m) => {
    //     return (async () => {
    //       if (m.yangbenOptionConfig) {
    //         const data = await this.yangbenService.getTableData(m.yangbenOptionConfig.id);
    //         return { ...m, fieldId: m.id, targetTableData: data };
    //       } else {
    //         return { ...m, fieldId: m.id };
    //       }
    //     })();
    //   }),
    // );
  }

  async getDefaultItem(itemType: string, contentTitle: string) {
    const searchFilter = [];
    if (itemType) {
      searchFilter.push(`itemType||$eq||${itemType}`);
    }
    if (contentTitle) {
      searchFilter.push(`contentTitle||$eq||${contentTitle}`);
    }

    searchFilter.push(`postId||$eq||${this.postId}`);
    searchFilter.push(`defaultFlag||$eq||1`);

    const defaultList: any = await new Promise((resolve) => {
      this.crudService
        .search(environment.baseUrl + 'api', 'journal-data-prompt', {
          filter: searchFilter,
        })
        .subscribe((res: any) => {
          resolve(res);
        });
    });
    // if (defaultList && defaultList.length > 0) {
    //   return defaultList[0].itemContent;
    // }
    // return '';
    return defaultList;
  }

  getDefultItemVal(defaultList: any, itemType: string, contentTitle: string) {
    const ff = defaultList.find((f) => f.itemType === itemType && f.contentTitle === contentTitle);
    if (ff) {
      return ff.itemContent;
    }
    return '';
  }
}

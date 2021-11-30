import { Component, OnInit } from '@angular/core';
import { CrudService } from '../../../crud.service';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { environment } from '@env/environment';
import { deepCompare, formatForCompare } from '@shared/utils/compare-util';
import { NzModalService } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-journal-view',
  templateUrl: './journal-view.component.html',
  styleUrls: ['./journal-view.component.css'],
})
export class JournalViewComponent implements OnInit {
  constructor(
    private crudService: CrudService,
    private fb: FormBuilder,
    private router: Router,
    private activedrouted: ActivatedRoute,
    private modalService: NzModalService,
    public msg: NzMessageService,
  ) {}

  loading = false;
  journal: any = { wordContent: '' };
  journalId: number;
  fromBy: any;
  oldJournal: any = { wordContent: '' };

  async ngOnInit() {
    this.activedrouted.queryParams.subscribe(async (params) => {
      this.fromBy = params.fromBy;
      this.journalId = params.journalId;

      const res: any = await new Promise((resolve, reject) => {
        this.crudService.get(environment.baseUrl + 'api', 'journal-data', this.journalId).subscribe((res: any) => {
          resolve(res);
        });
      });

      if (res.wordContent === null || res.wordContent === '') {
        res.wordContent = await new Promise((resolve, reject) => {
          // this.crudService.search(environment.baseUrl + 'api', 'journal-data/getWordContent', {
          //   filter: [`id||$eq||${this.journalId}`],
          // })
          this.crudService
            .get(environment.baseUrl + 'api', 'journal-data/getWordContent', this.journalId)
            .subscribe((res1: any) => {
              resolve(res1.html);
            });
        });
      }

      this.journal.wordContent = res.wordContent;
      this.oldJournal.wordContent = res.wordContent;
    });
  }

  callbackEmitter($event) {
    // console.log($event);
    $event.setItemObject[$event.setItemAttr] = $event.content;
  }

  submit(fromBy: any, flag: number) {
    if (flag === 1) {
      //暂存
      this.journal.reportStatus = 1;
      this.journal.step = 2;
    } else {
      this.journal.reportStatus = 0;
      this.journal.step = 3;
    }

    this.crudService.get(environment.baseUrl + 'api', 'journal-data', this.journalId).subscribe((res: any) => {
      this.crudService
        .update2(environment.baseUrl + 'api', 'journal-data', this.journalId, {
          wordContent: this.journal.wordContent,
          step: this.journal.step,
          reportStatus: this.journal.reportStatus,
        })
        .subscribe((res1) => {
          // this.msg.success('操作成功');

          if (flag === 1) {
            //暂存
            this.router.navigate(['/journal/journal-drafts']);
          } else if (flag === 2) {
            //提交确认
            this.router.navigate(['/journal/journal-finish'], {
              queryParams: {
                fromBy: this.fromBy,
                journalId: this.journalId,
              },
            });
          }
        });
    });
  }

  preStep() {
    //判断数据库字段wordContent和当前页面内容比较
    const compareResult = deepCompare(
      formatForCompare(this.journal.wordContent),
      formatForCompare(this.oldJournal.wordContent),
    );
    if (!compareResult) {
      console.log(formatForCompare(this.journal.wordContent));
      console.log(formatForCompare(this.oldJournal.wordContent));

      this.modalService.confirm({
        nzTitle: `排版内容`,
        nzContent: `<b style="color: red;">是否保存当前排版内容？</b>`,
        nzOkType: 'danger',
        nzCancelText: '否',
        nzOkText: '是',
        nzOnOk: () => {
          this.crudService
            .update2(environment.baseUrl + 'api', 'journal-data', this.journalId, {
              wordContent: this.journal.wordContent,
            })
            .subscribe((res1) => {
              this.msg.success('操作成功');

              this.router.navigate(['/journal/journal-detail'], {
                queryParams: {
                  fromBy: this.fromBy,
                  journalId: this.journalId,
                },
              });
            });
        },
        nzOnCancel: () => {
          this.router.navigate(['/journal/journal-detail'], {
            queryParams: {
              fromBy: this.fromBy,
              journalId: this.journalId,
            },
          });
        },
      });
    } else {
      this.router.navigate(['/journal/journal-detail'], {
        queryParams: {
          fromBy: this.fromBy,
          journalId: this.journalId,
        },
      });
    }
  }

  back(fromBy: any) {
    this.router.navigate(['/journal/' + fromBy]);
  }
}

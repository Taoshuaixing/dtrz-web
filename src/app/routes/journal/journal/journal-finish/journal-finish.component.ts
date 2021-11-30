import { Component, OnInit } from '@angular/core';
import { CrudService } from '../../../crud.service';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { environment } from '@env/environment';
import { DatePipe } from '@angular/common';
import { FileDownloadService } from 'src/app/routes/fileDownload.service';
import { JournalService } from '../../journal.service';

@Component({
  selector: 'app-journal-finish',
  templateUrl: './journal-finish.component.html',
  styleUrls: ['./journal-finish.component.css'],
})
export class JournalFinishComponent implements OnInit {
  constructor(
    private crudService: CrudService,
    private fb: FormBuilder,
    private router: Router,
    private datePipe: DatePipe,
    private activedrouted: ActivatedRoute,
    public msg: NzMessageService,
    public journalService: JournalService,
  ) {}

  loading = false;
  journal: any = { wordContent: '' };
  journalId: number;
  fromBy: any;
  adminFlag: number;
  shareFlag: number;

  ngOnInit() {
    this.activedrouted.queryParams.subscribe(async (params) => {
      this.fromBy = params.fromBy;
      this.journalId = params.journalId;

      if (params.hasOwnProperty('adminFlag')) {
        this.adminFlag = Number(params.adminFlag);
      }

      if (params.hasOwnProperty('shareFlag')) {
        this.shareFlag = Number(params.shareFlag);
      }

      await new Promise((resolve, reject) => {
        this.crudService.get(environment.baseUrl + 'api', 'journal-data', this.journalId).subscribe((res: any) => {
          this.journal.wordContent = res.wordContent;
          resolve(null);
        });
      });
    });
  }

  download() {
    this.journalService.download(this.journalId);
  }

  preStep() {
    this.router.navigate(['/journal/journal-view'], {
      queryParams: {
        fromBy: this.fromBy,
        journalId: this.journalId,
      },
    });
  }

  back(fromBy: any) {
    if (fromBy === 'journal-submitted') {
      this.router.navigate(['/journal/journal-submitted'], {
        queryParams: {
          adminFlag: this.adminFlag,
        },
      });
    } else if (fromBy === 'journal-share') {
      this.router.navigate(['/journal/journal-share'], {
        queryParams: {
          shareFlag: this.shareFlag,
        },
      });
    } else {
      this.router.navigate(['/journal/' + fromBy]);
    }
  }
}

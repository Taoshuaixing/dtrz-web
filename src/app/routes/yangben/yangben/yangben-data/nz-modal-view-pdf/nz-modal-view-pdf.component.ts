import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {map} from "rxjs/operators";
import { environment } from '@env/environment';

@Component({
  selector: 'app-nz-modal-view-pdf',
  templateUrl: './nz-modal-view-pdf.component.html',
  styleUrls: ['./nz-modal-view-pdf.component.css'],
})
export class NzModalViewPdfComponent implements OnInit {

  constructor(private http: HttpClient) { }

  @ViewChild('pdfViewerOnDemand') pdfViewerOnDemand;
  @ViewChild('pdfViewerAutoLoad') pdfViewerAutoLoad;

  @Input() onPage: (parent: any) => Promise<void>;
  @Input() parent: any;
  isVisible: any;
  isOkLoading: any;
  title: any;
  height: any;



  ngOnInit(): void {
  }

  showModal(item:any) {
    this.isVisible = true;
    this.height = document.body.scrollHeight - 400;
    this.title = item.originalName;
    let url = environment.baseUrl +`api/yangben-attachment/download/${item.attachmentId}`;
    this.downloadFile(url).subscribe(
      (res) => {
        this.pdfViewerAutoLoad.pdfSrc = res;
        this.pdfViewerAutoLoad.refresh();
      }
    );
  }

  downloadFile(url: string): any {
    return this.http.get(url, { responseType: 'blob' })
      .pipe(
        map((result: any) => {
          return result;
        })
      );
  }

  handleCancel() {
    this.isVisible = false;
  }

}

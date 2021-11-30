import { Component, Input, OnInit } from '@angular/core';
import { environment } from '@env/environment';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CrudService } from 'src/app/routes/crud.service';
import { ExcelDownloadService } from 'src/app/routes/excelDownload.service';

@Component({
  selector: 'app-yangben-event-modal-export',
  templateUrl: './yangben-event-modal-export.component.html',
  styles: [],
})
export class YangbenEventModalExportComponent implements OnInit {
  isVisible = false;
  isOkLoading = false;
  fieldList = [];
  selectedItem = [];
  loading = false;
  @Input() fieldListForSearch: any;
  @Input() eventName: any;
  @Input() eventClassifyId?: number;
  @Input() eventTemplateId: any;
  @Input() selectedId: any;

  constructor(
    private crudService: CrudService,
    private excelService: ExcelDownloadService,
    public msg: NzMessageService,
  ) {}

  ngOnInit() {}

  async showModal() {
    if (this.selectedId.length === 0) {
      this.msg.error('请选择要导出的数据！');
      return;
    }
    this.isOkLoading = false;
    this.fieldList = [];

    const allFieldList: any = await new Promise((resolve, reject) => {
      this.crudService
        .search(environment.baseUrl + 'api', 'yangben-event-field-define', { sort: [`id,ASC`] })
        .subscribe((res: any[]) => {
          resolve(res);
        });
    });

    if (this.eventTemplateId > 0) {
      this.crudService
        .get(environment.baseUrl + 'api', 'yangben-event-template-place', this.eventTemplateId)
        .subscribe((res: any) => {
          this.fieldList = res.yangbenEventTemplatePlaceFields;
          this.fieldList = this.fieldList.map((m) => {
            allFieldList.map((it) => {
              if (m.fieldId === it.id) {
                m.id = m.fieldId;
                m.fieldName = it.fieldName;
                m.fieldType = it.fieldType;
              }
            });
            return { ...m, checked: m.exportFlag === 1 ? true : false };
          });
        });
    } else {
      this.crudService
        .search(environment.baseUrl + 'api', 'yangben-event-field-define', { sort: [`id,ASC`] })
        .subscribe((res: any[]) => {
          this.fieldList = res;
          this.fieldList = this.fieldList.map((m) => {
            return { ...m, checked: m.exportFlag === 1 ? true : false };
          });
        });
    }

    this.isVisible = true;
  }
  handleCancel(): void {
    this.isVisible = false;
  }

  async handleOk() {
    this.isVisible = false;
  }

  async export() {
    if (this.fieldList.length > 0) {
      this.selectedItem = [];
      this.fieldList.map((m) => {
        if (m.checked) {
          this.selectedItem.push(m.id);
        }
      });
      if (this.selectedItem.length === 0) {
        this.msg.error('请选择要导出的项！');
        return;
      }

      const searchFilter = [];
      this.isOkLoading = true;
      for (const item of this.fieldListForSearch) {
        if (!item.val && !item.start) continue;

        if (item.fieldType === 1 || item.fieldType === 2) {
          searchFilter.push({ fieldId: item.id, val: item.val, exp: 'like' });
        } else if (item.fieldType === 3) {
          if (item.val && item.val.length > 1) {
            searchFilter.push({ fieldId: item.id, start: item.val[0], end: item.val[1] });
          }
        } else if (item.fieldType === 4) {
          searchFilter.push({ fieldId: item.id, start: item.start, end: item.end });
        } else {
          searchFilter.push({ fieldId: item.id, val: item.val });
        }
      }

      searchFilter.push({ fieldName: 'id', exp: 'in', val: this.selectedId.join(',') });

      const searchFilterRec = [];
      if (this.eventName) {
        searchFilterRec.push({ fieldName: 'name', val: this.eventName, exp: 'like' });
      }
      if (this.eventClassifyId) {
        searchFilterRec.push({ fieldName: 'classifyEventId', val: this.eventClassifyId });
      }

      if (this.eventTemplateId) {
        searchFilterRec.push({ fieldName: 'eventTemplateId', val: this.eventTemplateId });
      }

      await this.excelService.download(
        'yangben',
        'api/yangben-event/export',
        {
          s: JSON.stringify(searchFilter),
          rec: JSON.stringify(searchFilterRec),
          ids: this.selectedItem.join(','),
          eventTemplateId: this.eventTemplateId,
        },
        true,
      );
    }

    this.isOkLoading = false;
    this.isVisible = false;
  }
}

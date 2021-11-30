import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message'; 

@Component({
  selector: 'app-sort-modal',
  templateUrl: './sort-modal.component.html',
  styles: [],
})
export class SortModalComponent implements OnInit {
  constructor(
    public msg: NzMessageService,
  ) {}
  @Input() sortItems: any[];
  @Input() sortFieldName: string;
  @Input() btnType: string;
  @Output() emitter = new EventEmitter();
  isVisible = false;
  isOkLoading = false;
  curSortItems: any[] = [];

  showModal(): void {
    console.log(this.sortItems);

    this.curSortItems = this.sortItems.map(m => {
      return { id: m.id, name: m[this.sortFieldName] };
    });
    this.isVisible = true;
  }

  handleOk(): void {
    if(!this.curSortItems || this.curSortItems.length ===0) {
      this.msg.create('warning', '无排序项！');
      return;
    }
    // 传递结果给父页面
    this.emitter.emit({
      sortItems: this.curSortItems,
    });
    this.isVisible = false;
  }

  handleCancel(): void {
    this.isVisible = false;
  }

  ngOnInit() {}
}

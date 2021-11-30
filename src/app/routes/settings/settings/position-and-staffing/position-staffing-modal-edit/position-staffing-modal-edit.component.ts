import { CrudService } from '../../../../crud.service';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { environment } from '@env/environment';
import { SettingsService } from '@delon/theme';

@Component({
  selector: 'app-position-staffing-modal-edit',
  templateUrl: './position-staffing-modal-edit.component.html',
  styles: [],
})
export class PositionStaffingModalEditComponent implements OnInit {
  constructor(private crudService: CrudService, public settingService: SettingsService) { }
  @Input() postName: string;
  @Input() post: any;
  @Output() hide_emitter = new EventEmitter();
  isVisible = false;
  isOkLoading = false;
  newPostName: string;

  ngOnInit() { }

  showModal(): void {
    this.isVisible = true;
    this.newPostName = this.postName;
  }

  handleOk(): void {
    this.isOkLoading = true;

    this.crudService
      .update2(environment.baseUrl_zxtj + 'api', 'post', this.post.id, {
        updateUser: this.settingService.user.userId,
        id: this.post.id,
        postName: this.newPostName,
      })
      .subscribe(res => { });

    setTimeout(() => {
      this.isVisible = false;
      this.isOkLoading = false;
      // 传递事件刷新父页
      this.hide_emitter.emit();
    }, 500);
  }

  handleCancel(): void {
    this.isVisible = false;
  }
}

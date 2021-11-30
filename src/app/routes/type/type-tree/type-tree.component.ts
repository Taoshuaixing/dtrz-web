import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CrudService} from '../../crud.service';
import {NzFormatEmitEvent, NzTreeNode} from 'ng-zorro-antd/tree';

@Component({
  selector: 'app-type-tree',
  templateUrl: './type-tree.component.html',
  styles: [
      `
      :host ::ng-deep .ant-tree {
        overflow: hidden;
        margin: 0 -24px;
        padding: 0;
      }

      :host ::ng-deep .ant-tree li {
        padding: 4px 0 0 0;
      }

      .custom-node {
        cursor: pointer;
        line-height: 34px;
        margin-left: 4px;
        display: inline-block;
        /*margin: 0 -1000px;*/
        /*padding: 0 300px 0 1000px;*/
        width: 300px;
      }

      .custom-node-all {
        cursor: pointer;
        line-height: 34px;
        margin-left: 4px;
        display: inline-block;
        /*margin: 0 -1000px;*/
        /*padding: 0 300px 0 1000px;*/
        width: 300px;
      }

      .active {
        background: #e6f7ff;
        color: #1890ff;
      }

      .file-name,
      .folder-name {
        margin-left: 4px;
      }

      .file-desc,
      .folder-desc {
        padding: 0 8px;
        display: inline-block;
        background: #87ceff;
        color: #ffffff;
        position: relative;
        left: 12px;
      }

      .cnt {
        font-weight: bold;
        color: red;
      }
    `,
  ],
})
export class TypeTreeComponent implements OnInit {
  @Output() selected = new EventEmitter<string>();
  @Output() deleteId = new EventEmitter<string>();
  @Output() alter = new EventEmitter<string>();
  @Output() addType = new EventEmitter();
  @Input()
  nodes = [];

  addFlg = false;
  newType = '';
  types: any = null;
  @Input()
  activedNode: any = NzTreeNode;
  isVisible = false;
  modification: any = {};

  constructor(private crudService: CrudService) {
  }

  ngOnInit() {
    // this.initData();
  }

  activeNode(data: NzFormatEmitEvent): void {
    if (this.activedNode.origin !== undefined) {
      if (data.node.origin.id === this.activedNode.origin.id) {
        this.selected.emit('');
        this.activedNode = {};
      } else {
        this.selected.emit(data.node.origin.id);
        this.activedNode = data.node;
      }
    } else {
      this.selected.emit(data.node.origin.id);
      this.activedNode = data.node;
    }
  }

  addTypeBtn() {
    this.addType.emit({
      parent: 1,
      name: this.newType,
      subObj: this,
    });
  }

  /**
   * 删除
   */
  confirm(node) {
    this.deleteId.emit(node.origin.id);
  }

  /**
   * 修改
   */
  showModal(node): void {
    this.isVisible = true;
    this.modification = node.origin;
  }

  handleOk(): void {
    this.isVisible = false;
    this.alter.emit(this.modification);
  }

  handleCancel(): void {
    console.log('Button cancel clicked!');
    this.isVisible = false;
  }
}

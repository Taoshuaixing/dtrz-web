import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {CrudService} from '../../crud.service';
import {environment} from '@env/environment';

@Component({
  selector: 'app-type-menu',
  templateUrl: './type-menu.component.html',
  styles: []
})
export class TypeMenuComponent implements OnInit {

  @Output() selected = new EventEmitter<string>();
  types: any = null;
  selectTypeName = '';
  addFlg = false;
  newType = '';

  constructor(private crudService: CrudService) {
  }

  ngOnInit() {
    this.initData();
  }

  initData() {
    this.crudService.searchAll(environment.baseUrl + 'api', '/category?s={%22name%22:%20%22%E7%AE%A1%E7%90%86%E7%B1%BB%E5%88%AB%22}').subscribe((types: any) => {
      console.error(types);
      this.types = types.children;
    });
  }

  onSelect(type: any) {
    this.selectTypeName = type.name;
    this.selected.emit(this.selectTypeName);
  }

  addType() {
    this.crudService.add(environment.baseUrl + 'api', 'category', {name: this.newType}).subscribe(res => {
      this.initData();
      this.addFlg = false;
      this.newType = '';
    });
  }


}

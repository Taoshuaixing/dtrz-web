import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TypeRoutingModule } from './type-routing.module';
import { TypeMenuComponent } from './type-menu/type-menu.component';
import { CrudService } from '../crud.service';
import {SharedModule} from '@shared';
import {TypeTreeComponent} from './type-tree/type-tree.component';


@NgModule({
  declarations: [TypeMenuComponent, TypeTreeComponent],
  exports: [TypeMenuComponent, TypeTreeComponent],
  imports: [
    CommonModule,
    SharedModule,
    TypeRoutingModule
  ],
  providers: [CrudService]
})
export class TypeModule { }

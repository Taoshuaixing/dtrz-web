import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  storeObj = {};
  curRole = '';
  curUrl = '';

  get(key: string): any {
    return this.storeObj[key];
  }
  set(key: string, val: any) {
    this.storeObj[key] = val;
  }
}

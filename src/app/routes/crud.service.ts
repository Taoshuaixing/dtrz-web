import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class CrudService {
  constructor(private http: HttpClient, private cookieService: CookieService) {}

  // getOptions() {
  //   const headers = new HttpHeaders().set('ticket', this.cookieService.get('ticket'));
  //   return { headers };
  // }

  getOptions() {
    const headers = this.getOpthion();
    return { headers };
  }

  getOpthion() {
    // 此处ticket无效，使用alain拦截的方式处理
    const headers = new HttpHeaders().set('ticket', this.cookieService.get('ticket'));
    return headers;
  }

  /**
   * 查询
   *
   * */
  searchAll(baseUrl: string, subUrl: string) {
    return this.http.get('' + baseUrl + '/' + subUrl, this.getOptions());
  }

  /**
   * 检索加条件
   * @param baseUrl API
   * @param subUrl 子路径
   * @param params 参数
   */
  search(baseUrl: string, subUrl: string, params: any) {
    const headers = this.getOpthion();
    return this.http.get('' + baseUrl + '/' + subUrl, { headers, params });
  }

  /**
   * 获取单个元素
   *
   * */
  get(baseUrl: string, subUrl: string, id: any) {
    return this.http.get('' + baseUrl + '/' + subUrl + '/' + id, this.getOptions());
  }

  /**
   * 添加
   *
   * */
  add(baseUrl: string, subUrl: string, params: any) {
    return this.http.post('' + baseUrl + '/' + subUrl, params, this.getOptions());
  }

  /**
   * 修改 put
   * @param baseUrl API
   * @param subUrl 子路径
   * @param id ID
   * @param params 参数
   */
  update2(baseUrl: string, subUrl: string, id: any, params: any) {
    return this.http.put('' + baseUrl + '/' + subUrl + '/' + id, params, this.getOptions());
  }

  /**
   * 修改 patch
   *
   * */
  update(baseUrl: string, subUrl: string, id: any, params: any) {
    return this.http.patch('' + baseUrl + '/' + subUrl + '/' + id, params, this.getOptions());
  }
  /**
   * 修改
   */
  patch(baseUrl, data: any) {
    return this.http.patch(baseUrl, data, this.getOptions());
  }

  put(baseUrl, subUrl: string, data: any) {
    return this.http.put(baseUrl + '/' + subUrl, data, this.getOptions());
  }
  /**
   * 删除
   *
   * */
  del(baseUrl: string, subUrl: string, id: any) {
    return this.http.delete('' + baseUrl + '/' + subUrl + '/' + id, this.getOptions());
  }
  /**
   * 删除
   */
  delete(baseUrl) {
    return this.http.delete(baseUrl, this.getOptions());
  }
}

import {HttpClient} from '@angular/common/http';
import { Injectable } from '@angular/core';
import {CookieService} from 'ngx-cookie-service';
import {environment} from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient, private cookieService: CookieService) {

  }

  getHeaders() {
    const token = this.cookieService.get('access_token');
    return {headers: {Authorization: `Bearer ${token}`}};
  }

  login(url: string, params: any) {
    return this.http.post(url, params);
  }

  checkUser(token: string) {
    return this.http.get(environment.baseUrl + 'api/auth/input-user', {headers: {Authorization: `Bearer ${token}`}});
  }

  profile() {
    return this.http.get(environment.baseUrl + 'api/auth/profile', this.getHeaders());
  }


  logout() {
    this.cookieService.delete('access_token');
  }

  check(): boolean {
    // const token = this.cookieService.get('access_token');
    // const profile = this.cookieService.get('profile')
    // if (token && profile) {
    //   return true;
    // } else {
    //   return false;
    // }
    return true;
  }
}

import { Component, Inject, OnInit, Optional } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { CookieService } from 'ngx-cookie-service';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { ReuseTabService } from '@delon/abc/reuse-tab';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { StartupService } from '@core';

@Component({
  selector: 'app-mid-login',
  templateUrl: './mid-login.component.html',
  styles: []
})
export class MidLoginComponent implements OnInit {

  ticket = '';
  constructor(private router: Router,
    private route: ActivatedRoute,
    private cookieService: CookieService,
    private http: HttpClient,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private startupSrv: StartupService,
    @Optional()
    @Inject(ReuseTabService)
    private reuseTabService: ReuseTabService,
    private authService: AuthService) {

  }

  ngOnInit() {
    this.ticket = this.route.snapshot.paramMap.get('ticket');
    this.check();
    // console.log(this.ticket);
  }

  check() {
    // const ticket = this.ticket;
    // this.authService.checkUser(this.ticket).subscribe((res:any) => {
    //   console.log(res);
    //   this.cookieService.set('access_token', res.access_token);
    //   // console.log(res);
    //   this.authService.profile().subscribe(res1 => {
    //     this.cookieService.set('profile', JSON.stringify(res1));
    //     const link = ['/'];
    //     this.router.navigate(link);
    //   });
    // }, error => {
    //   console.error(error);
    // });

    console.log({ headers: { Authorization: `Bearer ${this.ticket}` } });
    this.http
      .get(environment.baseUrl_zxtj + 'api/auth/input-user?_allow_anonymous=true', {
        headers: { Authorization: `Bearer ${this.ticket}` },
      })
      .subscribe(
        (res: any) => {
          console.log(res);
          localStorage.removeItem('curRole');
          // 清空路由复用信息
          this.reuseTabService.clear();
          // 设置用户Token信息
          this.tokenService.set({ token: res.access_token });

          // 重新获取 StartupService 内容
          this.startupSrv.load_profile().then(() => {
            let url = this.tokenService.referrer!.url || '/';
            if (url.includes('/passport')) {
              url = '/';
            }
            this.router.navigateByUrl('/dashboard');
          });
        },
        error => {
          console.log(error);
        },
      );

  }

}

import { SettingsService, _HttpClient } from '@delon/theme';
import { Component, OnDestroy, Inject, Optional, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { SocialService, SocialOpenType, ITokenService, DA_SERVICE_TOKEN } from '@delon/auth';
import { environment } from '@env/environment';
import { StartupService } from '@core';
import { CrudService } from '../../crud.service';
import { ACLService } from '@delon/acl';
import { catchError } from 'rxjs/operators';
import { ReuseTabService } from '@delon/abc/reuse-tab';

@Component({
  selector: 'passport-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less'],
  providers: [SocialService],
})
export class UserLoginComponent implements OnInit, OnDestroy {
  constructor(
    fb: FormBuilder,
    modalSrv: NzModalService,
    private router: Router,
    private settingsService: SettingsService,
    private socialService: SocialService,
    @Optional()
    @Inject(ReuseTabService)
    private reuseTabService: ReuseTabService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private aclService: ACLService,
    private startupSrv: StartupService,
    public http: _HttpClient,
    public msg: NzMessageService,
    private crudService: CrudService,
  ) {
    this.form = fb.group({
      userName: [null, [Validators.required, Validators.minLength(2)]],
      password: [null, Validators.required],
      mobile: [null, [Validators.required, Validators.pattern(/^1\d{10}$/)]],
      captcha: [null, [Validators.required]],
      remember: [true],
    });
    modalSrv.closeAll();
  }

  // #region fields

  get userName() {
    return this.form.controls.userName;
  }
  get password() {
    return this.form.controls.password;
  }
  get mobile() {
    return this.form.controls.mobile;
  }
  get captcha() {
    return this.form.controls.captcha;
  }
  form: FormGroup;
  error = '';
  type = 0;

  // #region get captcha

  count = 0;
  interval$: any;
  systemName = '';
  loginUrl = environment.loginUrl;
  // #endregion
  ngOnInit() {
    this.systemName = environment.systemName;
    if (environment.loginUrl) {
      window.location.href = environment.loginUrl;
    }
  }
  switch(ret: any) {
    this.type = ret.index;
  }

  getCaptcha() {
    if (this.mobile.invalid) {
      this.mobile.markAsDirty({ onlySelf: true });
      this.mobile.updateValueAndValidity({ onlySelf: true });
      return;
    }
    this.count = 59;
    this.interval$ = setInterval(() => {
      this.count -= 1;
      if (this.count <= 0) {
        clearInterval(this.interval$);
      }
    }, 1000);
  }

  // #endregion

  submit() {
    this.error = '';
    if (this.type === 0) {
      this.userName.markAsDirty();
      this.userName.updateValueAndValidity();
      this.password.markAsDirty();
      this.password.updateValueAndValidity();
      if (this.userName.invalid || this.password.invalid) {
        return;
      }
    } else {
      this.mobile.markAsDirty();
      this.mobile.updateValueAndValidity();
      this.captcha.markAsDirty();
      this.captcha.updateValueAndValidity();
      if (this.mobile.invalid || this.captcha.invalid) {
        return;
      }
    }

    // ????????????????????????HTTP?????????????????? [??????](https://ng-alain.com/auth/getting-started) ?????? Token
    // ??????????????????????????????????????????????????????????????????URL?????????`/login?_allow_anonymous=true` ????????????????????? Token ??????
    // this.http
    //   .post('/login/account?_allow_anonymous=true', {
    //     type: this.type,
    //     userName: this.userName.value,
    //     password: this.password.value,
    //   })
    //   .subscribe((res: any) => {
    //     if (res.msg !== 'ok') {
    //       this.error = res.msg;
    //       return;
    //     }
    //     // ????????????????????????
    //     this.reuseTabService.clear();
    //     // ????????????Token??????
    //     this.tokenService.set(res.user);
    //     // ???????????? StartupService ???????????????????????????????????????????????????????????????????????????????????????
    //     this.startupSrv.load().then(() => {
    //       let url = this.tokenService.referrer!.url || '/';
    //       if (url.includes('/passport')) {
    //         url = '/';
    //       }
    //       this.router.navigateByUrl(url);
    //     });
    // //   });
    const r = new Promise((resolve, reject) => {
      this.http
        .post(environment.baseUrl_zxtj + 'api/auth/login', {
          username: this.userName.value,
          password: this.password.value,
        })
        // .pipe(
        //   // ?????????????????????????????????????????????
        //   catchError(res => {
        //     // console.warn(`StartupService.load: Network request failed`, res);
        //     console.log('Network request failed');
        //     resolve(null);
        //     return [];
        //   }),
        // )
        .subscribe(
          (res1: any) => {
            if (res1.access_token) {
              localStorage.removeItem('curRole');
              // ????????????????????????
              this.reuseTabService.clear();
              // ????????????Token??????
              this.tokenService.set({ token: res1.access_token });

              // ???????????? StartupService ???????????????????????????????????????????????????????????????????????????????????????
              this.startupSrv.load_profile().then(() => {
                let url = this.tokenService.referrer!.url || '/';
                if (url.includes('/passport')) {
                  url = '/';
                }
                this.router.navigateByUrl('/dashboard');
              });
            } else {
              this.error = '?????????????????????????????????????????????';
            }
          },
          (err) => {
            this.error = '?????????????????????????????????????????????';
            // this.msg.create('error', this.error);
          },
        );
    });
  }

  // #region social

  // open(type: string, openType: SocialOpenType = 'href') {
  //   let url = ``;
  //   let callback = ``;
  //   // tslint:disable-next-line: prefer-conditional-expression
  //   if (environment.production) {
  //     callback = 'https://ng-alain.github.io/ng-alain/#/callback/' + type;
  //   } else {
  //     callback = 'http://localhost:4200/#/callback/' + type;
  //   }
  //   switch (type) {
  //     case 'auth0':
  //       url = `//cipchk.auth0.com/login?client=8gcNydIDzGBYxzqV0Vm1CX_RXH-wsWo5&redirect_uri=${decodeURIComponent(
  //         callback,
  //       )}`;
  //       break;
  //     case 'github':
  //       url = `//github.com/login/oauth/authorize?client_id=9d6baae4b04a23fcafa2&response_type=code&redirect_uri=${decodeURIComponent(
  //         callback,
  //       )}`;
  //       break;
  //     case 'weibo':
  //       url = `https://api.weibo.com/oauth2/authorize?client_id=1239507802&response_type=code&redirect_uri=${decodeURIComponent(
  //         callback,
  //       )}`;
  //       break;
  //   }
  //   if (openType === 'window') {
  //     this.socialService
  //       .login(url, '/', {
  //         type: 'window',
  //       })
  //       .subscribe(res => {
  //         if (res) {
  //           this.settingsService.setUser(res);
  //           this.router.navigateByUrl('/');
  //         }
  //       });
  //   } else {
  //     this.socialService.login(url, '/', {
  //       type: 'href',
  //     });
  //   }
  // }

  // #endregion

  ngOnDestroy(): void {
    if (this.interval$) {
      clearInterval(this.interval$);
    }
  }
}

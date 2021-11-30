// tslint:disable: no-duplicate-imports
import { APP_INITIALIZER, LOCALE_ID, NgModule } from '@angular/core';
// #region Http Interceptors
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// #region default language
// Reference: https://ng-alain.com/docs/i18n
import { default as ngLang } from '@angular/common/locales/zh';
import { NZ_I18N, zh_CN as zorroLang } from 'ng-zorro-antd/i18n';
import { ALAIN_I18N_TOKEN, DELON_LOCALE, zh_CN as delonLang } from '@delon/theme';
// register angular
import { DatePipe, registerLocaleData } from '@angular/common';
// #endregion
// #region i18n services
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { I18NService } from '@core/i18n/i18n.service';
// #region JSON Schema form (using @delon/form)
import { JsonSchemaModule } from '@shared/json-schema/json-schema.module';
import { JWTInterceptor } from '@delon/auth';
import { DefaultInterceptor } from '@core/net/default.interceptor';
// #region Startup Service
import { StartupService } from '@core/startup/startup.service';
import { GlobalConfigModule } from './global-config.module';
import { CoreModule } from './core/core.module';
import { AppComponent } from './app.component';
import { RoutesModule } from './routes/routes.module';
import { LayoutModule } from './layout/layout.module';
// import {UEditorModule} from "ngx-ueditor";
import { CookieService } from 'ngx-cookie-service';
import { SharedModule } from '@shared/shared.module';
import { PdfJsViewerModule } from 'ng2-pdfjs-viewer';
import { NgxTinymceModule } from 'ngx-tinymce';

const LANG = {
  abbr: 'zh',
  ng: ngLang,
  zorro: zorroLang,
  delon: delonLang,
};
registerLocaleData(LANG.ng, LANG.abbr);
const LANG_PROVIDES = [
  { provide: LOCALE_ID, useValue: LANG.abbr },
  { provide: NZ_I18N, useValue: LANG.zorro },
  { provide: DELON_LOCALE, useValue: LANG.delon },
];

export function I18nHttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, `assets/tmp/i18n/`, '.json');
}

const I18NSERVICE_MODULES = [
  TranslateModule.forRoot({
    loader: {
      provide: TranslateLoader,
      useFactory: I18nHttpLoaderFactory,
      deps: [HttpClient],
    },
  }),
];

const I18NSERVICE_PROVIDES = [{ provide: ALAIN_I18N_TOKEN, useClass: I18NService, multi: false }];
// #region
const FORM_MODULES = [JsonSchemaModule];
// #endregion
const INTERCEPTOR_PROVIDES = [
  // { provide: HTTP_INTERCEPTORS, useClass: SimpleInterceptor, multi: true},
  { provide: HTTP_INTERCEPTORS, useClass: DefaultInterceptor, multi: true },
];
// #endregion

// #region global third module
const GLOBAL_THIRD_MODULES = [
  // UEditorModule.forRoot({
  //   // **注：** 建议使用本地路径；以下为了减少 ng-alain 脚手架的包体大小引用了CDN，可能会有部分功能受影响
  //   js: [`//apps.bdimg.com/libs/ueditor/1.4.3.1/ueditor.config.js`, `//apps.bdimg.com/libs/ueditor/1.4.3.1/ueditor.all.min.js`],
  //   options: {
  //     UEDITOR_HOME_URL: `//apps.bdimg.com/libs/ueditor/1.4.3.1/`,
  //   },
  // })
  // UEditorModule.forRoot({
  //   js: [
  //     `./assets/ueditor/ueditor.all.min.js`,
  //     `./assets/ueditor/ueditor.config.js`,
  //   ],
  //   // 默认前端配置项
  //   options: {
  //     UEDITOR_HOME_URL: './assets/ueditor/'
  //   }
  // })
];
// #endregion
export function StartupServiceFactory(startupService: StartupService) {
  return () => startupService.load();
}
const APPINIT_PROVIDES = [
  StartupService,
  {
    provide: APP_INITIALIZER,
    useFactory: StartupServiceFactory,
    deps: [StartupService],
    multi: true,
  },
];
// #endregion

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    GlobalConfigModule.forRoot(),
    CoreModule,
    SharedModule,
    LayoutModule,
    RoutesModule,
    PdfJsViewerModule,
    ...I18NSERVICE_MODULES,
    ...FORM_MODULES,
    ...GLOBAL_THIRD_MODULES,
    NgxTinymceModule.forRoot({
      baseURL: './assets/tinymce/',
    }),
  ],
  providers: [
    CookieService,
    ...LANG_PROVIDES,
    ...INTERCEPTOR_PROVIDES,
    ...I18NSERVICE_PROVIDES,
    ...APPINIT_PROVIDES,
    { provide: HTTP_INTERCEPTORS, useClass: JWTInterceptor, multi: true },
    DatePipe,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}

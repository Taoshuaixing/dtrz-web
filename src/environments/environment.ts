// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  SERVER_URL: `./`,
  production: false,
  useHash: true,

  baseUrl: 'http://192.168.3.199:3210/',
  baseUrl_zxtj: 'http://192.168.3.199:3300/',
  subUrl: '',
  systemName: '专项知识管理系统',

  mapUrlByEventId: 'http://10.10.111.108:10191/#/staticPages/eventDetail?eventId=',
  mapUrlByKeyword: 'http://10.10.111.108:10191/#/staticPages/eventList?keyword=',
  // 当前系统 zb ，jsj，dt等
  currentSys: 'dt',

  loginUrl: '',
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.

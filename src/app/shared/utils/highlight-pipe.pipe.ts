import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'highlightPipe',
})
export class HighlightPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}
  // Angular 会调用它的 transform 方法，并把要绑定的值作为第一个参数传入，其它参数会依次从第二个参数的位置开始传入。
  transform(val: string, keyword: string): any {
    if (!keyword) {
      return val;
    }
    if (Array.isArray(keyword)) {
      return val;
    }
    const keys = ['\\', '$', '(', ')', '*', '+', '.', '[', ']', '?', '^', '{', '}', '|'];
    const oldKeyword = keyword;
    for (const key of keys) {
      if (keyword.concat(key)) {
        keyword = keyword.replace(key, `\\` + key);
      }
    }
    const Reg = new RegExp(keyword, 'gi');
    if (val) {
      // 将匹配到的关键字替换
      const res = val.replace(Reg, `<span style="background-color:#FFFF00">${oldKeyword}</span>`);
      // console.log(res);
      return this.sanitizer.bypassSecurityTrustHtml(res);
    } else {
      return val;
    }
  }
}

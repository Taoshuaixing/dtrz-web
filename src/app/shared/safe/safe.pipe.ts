import {Pipe, PipeTransform} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
/**
 * @param value
 * @returns {string}
 */
@Pipe({
    name: 'safe'
})
export class SafePipe implements PipeTransform {
    constructor(private sanitizer: DomSanitizer) {
        this.sanitizer = sanitizer;
    }

    transform(code: string): any {
        return this.sanitizer.bypassSecurityTrustHtml(code);
    }
}

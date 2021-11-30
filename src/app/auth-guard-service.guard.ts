import {Injectable} from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router} from '@angular/router';
import {Observable} from 'rxjs';
import {AuthService} from './routes/passport/auth.service';


@Injectable({
  providedIn: 'root'
})
export class AuthGuardServiceGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    // check some condition
    if (!this.authService.check()) {
      // alert('You are not allowed to view this page');
      const link = ['/passport/login'];
      this.router.navigate(link);
      // redirect to login/home page etc
      // return false to cancel the navigation
      return false;
    }
    return true;
  }
}

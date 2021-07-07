import {HttpErrorResponse, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {tap} from 'rxjs/operators';
import {AuthService} from './auth.service';
import {environment} from "../../environments/environment";

/**
 * http 请求全局拦截
 */
@Injectable()
export class AuthCookieInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    return next.handle(req).pipe(tap(() => null, error => {
        if (error instanceof HttpErrorResponse) {
          // 未授权访问，退出当前登录状态
          if (error.status === 401 &&
            req.url !== `${environment.apiUrl}${environment.loginPath}` &&
            req.url !== `${environment.apiUrl}${environment.logoutPath}`) {
            this.auth.logout();
          }
        }
      }
    ));
  }
}

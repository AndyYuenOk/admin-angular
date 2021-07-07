import {HttpErrorResponse, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {tap} from 'rxjs/operators';
import {AuthService} from './auth.service';
import {environment} from "../../environments/environment";

/**
 * http 请求全局拦截
 */
@Injectable()
export class AuthJwtInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    let authReq;
    if (req.url === `${environment.apiUrl}${environment.loginPath}`) {
      authReq = req;
    } else {
      // Get the auth token from the service.
      const authToken = this.auth.getAuthorizationToken();

      // req 不允许修改，clone 后再修改请求对象
      // Clone the request and set the new header in one step.
      authReq = req.clone({setHeaders: {Authorization: `Bearer ${authToken}`}});
    }

    return next.handle(authReq).pipe(tap(
      // Succeeds when there is a response; ignore other events
      event => {
        if (event instanceof HttpResponse) {
          this.refreshToken(event);
        }
      },
      // Operation failed; error is an HttpErrorResponse
      error => {
        // 未授权访问，退出登录状态，清理 token
        if (error instanceof HttpErrorResponse) {
          this.refreshToken(error);
          if (error.status === 401 &&
            req.url !== `${environment.apiUrl}${environment.loginPath}` &&
            req.url !== `${environment.apiUrl}${environment.logoutPath}`) {
            this.auth.logout();
          }
        }
      }
    ));
  }

  /**
   * 刷新本地 token
   *
   * @param response
   */
  refreshToken(response: HttpResponse<any> | HttpErrorResponse) {
    if (response.headers.has('Authorization')) {
      const token = response.headers.get('Authorization') ?? '';
      this.auth.refreshToken(token.slice(7));
    }
  }
}

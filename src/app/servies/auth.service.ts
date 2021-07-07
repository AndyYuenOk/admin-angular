import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Router} from '@angular/router';
import {environment} from "../../environments/environment";
import {finalize, map} from "rxjs/operators";
import {Observable} from 'rxjs/internal/Observable';
import {MatSnackBar} from "@angular/material/snack-bar";
import {of} from 'rxjs/internal/observable/of';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // store the URL so we can redirect after logging in
  redirectUrl = '/';

  constructor(private http: HttpClient,
              // @Inject('LOCAL_STORAGE') private localStorage: Storage,
              private router: Router, public snackBar: MatSnackBar) {
    // this.localStorage = localStorage;
  }

  getAuthorizationToken() {
    return localStorage.getItem('access_token');
  }

  login(body: any, error: any) {
    this.http.post(`${environment.apiUrl}${environment.loginPath}`, body).subscribe(user => {
      localStorage.setItem('user', JSON.stringify(user));
      // this.getUser().subscribe();
      this.router.navigate([this.redirectUrl]);
    }, error);
  }

  logout(): void {
    this.http.post(`${environment.apiUrl}${environment.logoutPath}`, null).pipe(finalize(() => {
      localStorage.clear();
      this.router.navigate([environment.loginPath]);
    })).subscribe();
  }

  isLoggedIn() {
    return !!localStorage.getItem('user');
  }

  refreshToken(authorization: string) {
    localStorage.setItem('access_token', authorization);
  }

  user(): Observable<object> {
    const user = localStorage.getItem('user');
    if (user) {
      return of(JSON.parse(user));
    } else {
      return this.getUser();
    }
  }

  getUser(): Observable<object> {
    return this.http.get(`${environment.apiUrl}/auth/user`).pipe(map(user => {
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    }));
  }
}

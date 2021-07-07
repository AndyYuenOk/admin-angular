import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from "rxjs/internal/Observable";
import {of} from 'rxjs/internal/observable/of';
import {environment} from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  menus = '';

  constructor(private http: HttpClient) {
  }

  getMenus(): Observable<any> {
    if (this.menus) {
      return of(this.menus);
    }
    return this.http.get(`${environment.apiUrl}/common/menus`);
  }
}

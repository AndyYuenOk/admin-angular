import {Component} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {FormBuilder} from '@angular/forms';
import {Title} from '@angular/platform-browser';
import {AuthService} from "../servies/auth.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  userForm = this.fb.group({
    username: [],
    password: []
  });
  // 正在登录
  logging = false;

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router,
              public authService: AuthService, private title: Title) {
    this.title.setTitle('用户登录');
  }

  login() {
    this.logging = true;
    this.authService.login(this.userForm.getRawValue(), (error: any) => {
      // 登录错误处理
      this.logging = false;

      // 登录失败次数限制
      if (error.status === 429) {
        if (error.error.errors) {
          this.openSnackBar(error.error.errors.username[0]);
        }
      } else if (error.error.errors) {
        // error.error.errors:具体错误信息
        // 用户名或密码错误，不显示在组件下面，弹出提示
        if (error.error.errors.username && error.error.errors.username.includes('用户名或密码错误')) {
          this.openSnackBar(error.error.errors.username);
        } else {
          for (const k of Object.keys(error.error.errors)) {
            // 设置错误信息
            this.userForm.get(k)?.setErrors({backend: error.error.errors[k][0]});
          }
        }
      } else {
        // error.error.message:总体错误信息
        this.openSnackBar(error.error.message);
      }
    });
  }

  getErrorMessage(path: string) {
    return this.userForm.get(path)?.getError('backend');
  }

  openSnackBar(message: string) {
    this.authService.snackBar.open(message, '关闭', {duration: 3000});
  }
}

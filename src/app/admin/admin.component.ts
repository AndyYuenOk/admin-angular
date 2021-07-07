import {Component, OnInit} from '@angular/core';
import {environment} from 'src/environments/environment';
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {AuthService} from "../servies/auth.service";
import {HttpClient} from "@angular/common/http";
import {NestedTreeControl} from "@angular/cdk/tree";
import {Router} from "@angular/router";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatTreeNestedDataSource} from "@angular/material/tree";
import {FormGroup} from "@angular/forms";
import {CommonService} from '../servies/common.service';
import {map} from 'rxjs/operators';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent {
  nestedTreeControl: any;
  nestedDataSource: any;
  user$: any;
  username$: any;

  constructor(private authService: AuthService,
              private http: HttpClient,
              private common: CommonService,
              private dialog: MatDialog,
              private snackBar: MatSnackBar,
              public router: Router) {
    this.nestedTreeControl = new NestedTreeControl(this.getChildren);
    this.nestedDataSource = new MatTreeNestedDataSource();
    this.common.getMenus().subscribe((value: any) => {
      this.nestedDataSource.data = this.buildFileTree(value, 0);
      const data = this.buildFileTree(value, 0);
    });
    // this.http.get(`${environment.apiUrl}/menus`).subscribe(value => {
    //   this.nestedDataSource.data = value;
    //   // console.log(value);
    // });

    // this.http.get(`${environment.apiUrl}/me`).subscribe(value => {
    // console.log(value);
    // });

    this.user$ = this.authService.user();
    this.username$ = this.user$.pipe(map((user: any) => user?.username));
  }

  buildFileTree(obj: { [key: string]: any }, level: number): any[] {
    return Object.keys(obj).reduce<any[]>((accumulator, key) => {
      const value = obj[key];
      if (value != null && typeof value.children === 'object') {
        value.children = this.buildFileTree(value.children, level + 1);
      }
      return accumulator.concat(value);
    }, []);
  }

  logout(): void {
    this.authService.logout();
  }

  hasNestedChild = (_: number, nodeData: any) => !!nodeData.children;

  resetPassword() {
    const formGroup = new FormGroup({});

    // this.dialog.open(DialogFormComponent, {
    //   width: '350px',
    //   data: {
    //     title: '重置密码',
    //     fields: [
    //       {
    //         key: 'password',
    //         type: 'input',
    //         templateOptions: {
    //           label: '新密码',
    //           type: 'password',
    //           attributes: {
    //             required: true,
    //             autocomplete: 'new-password',
    //           },
    //         },
    //       },
    //       {
    //         key: 'password_confirmation',
    //         type: 'input',
    //         templateOptions: {
    //           label: '确认密码',
    //           type: 'password',
    //           attributes: {
    //             required: true,
    //             autocomplete: 'new-password',
    //           },
    //         },
    //       },
    //     ],
    //     model: null,
    //     formGroup,
    //     submit: (body: any, dialogRef: MatDialogRef<any>) => {
    //       this.http.put(`${environment.apiUrl}/password/reset`, body).subscribe((value: any) => {
    //         dialogRef.close();
    //         this.openSnackBar('修改成功');
    //       }, (error: any) => {
    //         if (error.error.errors) {
    //           this.openSnackBar(error.error.errors[Object.keys(error.error.errors)[0]][0]);
    //         }
    //
    //         if (error.error.message !== 'The given data was invalid.') {
    //           this.openSnackBar(error.error.message);
    //         }
    //       });
    //     }
    //   }
    // });
  }

  openSnackBar(message: string) {
    this.snackBar.open(message, '关闭', {duration: 3000});
    return this;
  }

  private getChildren = (node: any) => node.children;
}

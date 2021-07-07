import {Component, Injector, OnInit} from '@angular/core';
import {Title} from "@angular/platform-browser";
import {AuthService} from "../servies/auth.service";
import {BaseComponent} from "../base/base.component";
import {environment} from "../../environments/environment";
import {pluck} from "rxjs/operators";
import {MatDialogRef} from "@angular/material/dialog";
import {FormlyFieldConfig} from '@ngx-formly/core';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent extends BaseComponent {
  isSuperAdmin: boolean = false;

  constructor(private title: Title, public injector: Injector, private authService: AuthService) {
    super(injector);
    this.title.setTitle('用户管理');
    authService.user().subscribe((value: { roles: Array<any> } | any) => {
      this.isSuperAdmin = value.roles.find((v: any) => v.authority === 'super-admin');
    });
  }

  onFetchResourcesSuccess(body: any): void {
    body.data = body.data.map((user: any) => {
      user.roleNames = user.roles.map((role: any) => role.name).join('，');
      return user;
    });
    body.columns.splice(3, 0, {key: 'roleNames', name: '角色'});
    super.onFetchResourcesSuccess(body);
  }

  /**
   * 创建用户
   */
  create() {
    this.http.get(`${environment.apiUrl}/roles`)
      .pipe(pluck('data'))
      .subscribe((roles: object[] | any) => {
        this.openDialog('新增用户', this.getFields(roles));
      });
  }

  edit(user: any) {
    const model = this._.clone(user);
    model.role_ids = model.roles.map((role: any) => role.id);
    model.sex = model.sex.index;
    this.http.get(`${environment.apiUrl}/roles`)
      .pipe(pluck('data'))
      .subscribe((roles: object[] | any) => {
        this.openDialog('编辑用户', this.getFields(roles, model), model);
      });
  }

  onUpdateSuccess(dialogRef: MatDialogRef<any>, returnedData: any, sourceData: any, formData: any): void {
    returnedData.roleNames = returnedData.roles.map((role: any) => role.name).join('，');
    super.onUpdateSuccess(dialogRef, returnedData, sourceData, formData);
  }

  getFields(roles: any[], model?: object): FormlyFieldConfig[] {
    const fields: FormlyFieldConfig[] = [
      {
        key: 'username',
        type: 'input',
        templateOptions: {
          label: '用户名',
          required: true,
        },
      },
      {
        key: 'password',
        type: 'input',
        templateOptions: {
          label: '密码',
          type: 'password',
          attributes: {
            autocomplete: 'new-password',
          },
        },
      },
      {
        key: 'sex',
        type: 'radio',
        defaultValue: 1,
        templateOptions: {
          label: '性别',
          required: true,
          options: [
            {value: 1, label: '男'},
            {value: 0, label: '女'},
          ],
        },
      },
      {
        key: 'role_ids',
        type: 'select',
        defaultValue: [],
        templateOptions: {
          label: '角色',
          multiple: true,
          options: roles.map(role => ({label: role.name, value: role.id})),
        },
      }
    ];

    if (!model) {
      if (fields.find((field: any) => field.key === 'password')?.templateOptions) {
        // @ts-ignore
        fields.find((field: any) => field.key === 'password').templateOptions.required = true;
      }
    }

    return fields;
  }
}

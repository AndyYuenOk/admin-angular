import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LoginComponent} from "./login/login.component";
import {AdminComponent} from "./admin/admin.component";
import {DashboardComponent} from "./dashboard/dashboard.component";
import {UsersComponent} from "./users/users.component";
import {RolesComponent} from "./roles/roles.component";
import {MenusComponent} from "./menus/menus.component";

const routes: Routes = [
  {path: 'login', component: LoginComponent},
  {
    path: '',
    component: AdminComponent,
    // canActivate: [AuthGuard],
    children: [
      {
        path: '',
        // canActivateChild: [AuthGuard],
        children: [
          {path: 'dashboard', component: DashboardComponent},
          {path: 'users', component: UsersComponent},
          {path: 'menus', component: MenusComponent},
          {path: 'roles', component: RolesComponent},
          {
            path: '',
            redirectTo: 'dashboard',
            pathMatch: 'full'
          }
        ]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule {
}

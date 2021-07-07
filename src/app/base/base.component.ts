import {AfterViewInit, ElementRef, Injectable, Injector, OnDestroy, ViewChild} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {FormBuilder, FormGroup} from "@angular/forms";
import {MatPaginator} from "@angular/material/paginator";
import {MatTable} from "@angular/material/table";
import {MatButton} from "@angular/material/button";
import {finalize, startWith, switchMap} from "rxjs/operators";
import {environment} from "../../environments/environment";
import {Observable} from "rxjs/internal/Observable";
import {pipeFromArray} from "rxjs/internal/util/pipe";
import {DialogFormComponent} from "../dialog-form/dialog-form.component";
import * as _ from 'lodash';

@Injectable()
export class BaseComponent implements AfterViewInit, OnDestroy {
  _ = _;
  http: HttpClient;
  snackBar: MatSnackBar;
  el: ElementRef;
  dialog: MatDialog;
  fb: FormBuilder;

  pagination: { total: number; size: number; } | undefined;
  dataSource: any;
  displayedColumns: string[] | undefined;
  columns: Array<{ key: string; name: string; }> | undefined;
  @ViewChild(MatPaginator) paginator: MatPaginator | any;
  @ViewChild(MatTable) table: MatTable<any> | undefined;
  @ViewChild('btnCreate') btnCreate: MatButton | undefined;
  @ViewChild('btnUpdate') btnUpdate: MatButton | undefined;
  @ViewChild('btnDelete') btnDelete: MatButton | undefined;
  page$: any;

  constructor(public injector: Injector) {
    this.http = this.injector.get(HttpClient);
    this.snackBar = this.injector.get(MatSnackBar);
    this.el = this.injector.get(ElementRef);
    this.dialog = this.injector.get(MatDialog);
    this.fb = this.injector.get(FormBuilder);
  }

  ngAfterViewInit() {
    this.page$ = this.paginator?.page.pipe(
      startWith({}),
      switchMap(() => this.http.get(`${this.getApiUrl()}?page=${this.paginator?.pageIndex}`))
    ).subscribe((body: any) => this.onFetchResourcesSuccess(body), (e: any) => console.log(e));
  }

  onFetchResourcesSuccess(body: any): void {
    this.dataSource = body.data;
    this.pagination = body.pagination;
    this.columns = body.columns;
    this.displayedColumns = this.columns?.map(column => column.key).concat('operate');
  }

  ngOnDestroy() {
    if (this.page$ && !this.page$.closed) {
      this.page$.unsubscribe();
    }
  }

  getApiUrl() {
    return `${environment.apiUrl}/${this.el.nativeElement.tagName.toLocaleLowerCase().replace('app-', '')}`;
  }

  openDialog(title: string, fields: any, model?: any) {
    const formGroup = new FormGroup({});

    this.dialog.open(DialogFormComponent, {
      width: '350px',
      data: {
        title, fields, model, formGroup,
        submit: (body: any, dialogRef: MatDialogRef<any>) => {
          this.beforeSubmit(body);

          if (model) {
            this.http.put(`${this.getApiUrl()}/${model.id}`, body)
              // .pipe(map(returnedData => [dialogRef, returnedData, model, body]))
              // .pipe(pipeFromArray(this.pipeUpdate()))
              .subscribe(
                returnData => this.onUpdateSuccess(dialogRef, returnData, model, body),
                error => this.onUpdateFailure(error, formGroup)
              );
          } else {
            this.http.post(this.getApiUrl(), body).subscribe(
              () => this.onCreateSuccess(dialogRef),
              error => this.onCreateFailure(error, formGroup)
            );
          }
        }
      }
    });
  }

  create() {
  }

  edit(user: any) {
  }

  beforeSubmit(body: any) {
  }

  observableOfCreate(observable: Observable<any>): Observable<any> {
    return observable;
  }

  observableOfUpdate(observable: Observable<any>): Observable<any> {
    return observable;
  }

  onCreateSuccess(dialogRef: MatDialogRef<any>): void {
    dialogRef.close();
    this.openSnackBar('新增成功').refresh();
    // this.toggleDisabled(this.btnCreate);
  }

  onCreateFailure(error: any, formGroup: FormGroup): void {
    this.handleFormError(error, formGroup);
  }

  pipeUpdate(): any[] {
    return [
      // finalize(() => this.toggleDisabled(this.btnUpdate))
    ];
  }

  onUpdateSuccess(dialogRef: MatDialogRef<any>, returnedData: any, sourceData: any, formData: any): void {
    dialogRef.close();
    this.openSnackBar('修改成功');
    const index = this.dataSource.findIndex((resource: any) => resource.id === returnedData.id);
    this.dataSource[index] = returnedData;
    this.table?.renderRows();
    // this.toggleDisabled(this.btnUpdate);
  }

  onUpdateFailure(error: any, formGroup: FormGroup): void {
    this.handleFormError(error, formGroup);
  }

  onDeleteSuccess(): void {
    this.openSnackBar('删除成功').refresh();
  }

  onDeleteFailure(error: any): void {
    this.openSnackBar(error.error.message);
  }

  handleFormError(error: any, formGroup: FormGroup): void {
    if (error.error.errors) {
      for (const key of Object.keys(error.error.errors)) {
        formGroup.get(key)?.setErrors({error: error.error.errors[key]});
      }
    } else {
      this.openSnackBar(error.error.message);
    }
  }

  toggleDisabled(matButton: any) {
    if (matButton) {
      matButton.disabled = !matButton.disabled;
    }
    return this;
  }

  delete(id: number): void {
    if (confirm('删除？')) {
      this.onBeforeDelete();
      this.http.delete(`${this.getApiUrl()}/${id}`)
        .pipe(pipeFromArray(this.pipeDelete()))
        .subscribe(...this.subscribeDelete());
    }
  }

  onBeforeDelete() {
    this.toggleDisabled(this.btnDelete);
  }

  pipeDelete(): any[] {
    return [finalize(() => this.toggleDisabled(this.btnDelete))];
  }

  subscribeDelete() {
    return [
      () => this.openSnackBar('删除成功').refresh(),
      (error: any) => this.openSnackBar(error.error.message)
    ];
  }

  refresh(): void {
    this.paginator.pageIndex = 0;
    this.paginator?.page.next();
  }

  openSnackBar(message: string) {
    this.snackBar.open(message, '关闭', {duration: 3000});
    return this;
  }
}

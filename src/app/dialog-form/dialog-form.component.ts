import {Component, Inject, OnInit} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {FormlyFieldConfig} from "@ngx-formly/core";
import * as _ from 'lodash';

@Component({
  selector: 'app-dialog-form',
  templateUrl: './dialog-form.component.html',
  styleUrls: ['./dialog-form.component.scss']
})
export class DialogFormComponent {
  title;
  form = new FormGroup({});
  model;
  fields: FormlyFieldConfig[];
  unchanged = true;

  constructor(public dialogRef: MatDialogRef<any>, @Inject(MAT_DIALOG_DATA) public data: any) {
    ({title: this.title, model: this.model, fields: this.fields, formGroup: this.form} = this.data);
  }

  ngAfterViewInit(): void {
    const rawValue = this.form.getRawValue();
    this.form.valueChanges.subscribe(value => {
      this.unchanged = _.isEqual(value, rawValue);
    });
  }

  submit() {
    // console.log(this.fields);
    this.data.submit(this.form.getRawValue(), this.dialogRef);
  }
}

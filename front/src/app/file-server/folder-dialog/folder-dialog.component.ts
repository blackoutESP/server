import { FilesService } from './../../../services/files.service';
import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';


@Component({
  selector: 'app-folder-dialog',
  templateUrl: './folder-dialog.component.html',
  styleUrls: ['./folder-dialog.component.scss']
})
export class FolderDialogComponent implements OnInit {

  token: string;
  path: string;
  dirname = new FormControl('');
  folderForm: FormGroup;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              private dialogRef: MatDialogRef<FolderDialogComponent>,
              private filesService: FilesService) {
                this.folderForm = new FormGroup({
                  dirname: this.dirname
                });
  }

  ngOnInit(): void {
    this.token = this.data.token;
    this.path = this.data.path;
  }

  onSubmit() {
    console.log(this.folderForm.value);
    const token = localStorage.getItem('token');
    const dirname = this.folderForm.value.dirname;
    const absPath = this.path + dirname;
    console.log(absPath);
    this.filesService.createFolder(token, absPath).subscribe(response => {
      console.log(response);
      if (response['ok']) {
        this.dialogRef.close(response['path']);
      }
    });
  }

}

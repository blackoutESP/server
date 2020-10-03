import config from 'src/config.json';
import { UploadsService } from '../../../services/uploads.service';
import { Component, OnInit, Input, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-uploads',
  templateUrl: './uploads.component.html',
  styleUrls: ['./uploads.component.scss']
})
export class UploadsComponent implements OnInit {

  @Input() mobile: boolean;
  @Input() themeSelected: string;
  @Input() path: string;
  @Output() fileList: Array<any>;
  files: Array<any> = [];
  file: any;
  progress = 0;
  constructor(private uploadsService: UploadsService,
              private router: Router) { }

  ngOnInit(): void {
  }

  onFileDropped(event) {
    this.prepareFile(Array.from(event));
  }

  fileBrowseHandler(files) {
    this.prepareFile(files);
  }

  prepareFile(files: Array<any>) {
    for (const file of files) {
      this.file = file;
      this.file.progress = 0;
      this.files.push(this.file);
    }
    this.files.forEach((file, index) => {
      this.uploadFile(index);
    });
  }

  uploadFile(index: number) {
    const token = localStorage.getItem('token');
    if (index === this.files.length) {
      this.files = [];
      setTimeout(() => this.file = null, 1000);
      this.uploadsService.changeMessage(this.path);
      return;
    } else {
      const request = new XMLHttpRequest();
      request.upload.addEventListener('progress', (event) => {
        console.log(Math.floor((event.loaded / event.total) * 100));
        this.files[index].progress = Math.floor((event.loaded / event.total) * 100);
        if (this.files[index].progress === 100) {
          this.uploadFile(index + 1);
        }
      });
      request.open('POST', `http://${config.http.ip}:${config.http.port}/api/upload/${this.path}`);
      request.setRequestHeader('Authorization', `Bearer ${token}`);
      const formData = new FormData();
      formData.append('files', this.files[index], this.files[index].name);
      request.send(formData);
    }
  }
}

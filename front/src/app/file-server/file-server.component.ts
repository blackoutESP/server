import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { FilesService } from './../../services/files.service';
import { DataService } from './../../services/data.service';
import { PathService } from './../../services/path.service';
import { UploadsService } from './../../services/uploads.service';
import { Component, OnInit, Output, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import saveAs from 'file-saver';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { FolderDialogComponent } from './folder-dialog/folder-dialog.component';
import { PreviewComponent } from './preview/preview.component';
import { OverlayContainer } from '@angular/cdk/overlay';

@Component({
  selector: 'app-file-server',
  templateUrl: './file-server.component.html',
  styleUrls: ['./file-server.component.scss']
})
export class FileServerComponent implements OnInit, OnDestroy {

  userAgent: string;
  mobile: boolean;
  checked = false;
  themeSelected = 'dark';
  overlay;
  @ViewChild(CdkVirtualScrollViewport) viewport: CdkVirtualScrollViewport;
  title = 'File Server';
  @Output() files: Array<File> = [];
  @Output() filename: string;
  size: number;
  extension: string;
  data: ArrayBuffer;
  @Output() absPath = '';
  isDirectory: boolean;

  constructor(private filesService: FilesService, private dataService: DataService,
              private pathService: PathService, private uploadsService: UploadsService,
              private dialog: MatDialog, private router: Router,
              private overlayContainer: OverlayContainer) {
    this.userAgent = navigator.userAgent;
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(this.userAgent)){
      this.mobile = true;
    } else {
      this.mobile = false;
    }
    this.overlay = overlayContainer.getContainerElement();
    this.dataService.currentMessage.subscribe(message => this.filename = message);
    this.uploadsService.currentMessage.subscribe(message => {
      if (message) {
        console.log('uploads service: ', message);
        this.absPath = message;
        this.files = [];
        this.listFiles(this.absPath);
      }else if (message === '') {
        this.files = [];
        this.listFiles();
      }
    });
  }

  ngOnInit(): void {
    this.onThemeSwitch('dark-theme');
    this.listFiles();
  }

  ngOnDestroy(): void {
    this.dataService.changeMessage('');
    this.pathService.changeMessage('');
  }

  sendMessage(filename: string): void {
    this.dataService.changeMessage(filename);
  }

  listFiles(path?: string): void {
    const token = localStorage.getItem('token');
    if (!path) {
      this.filesService.listFiles(token).subscribe(data => {
        this.files = [];
        data['data'].forEach(file => this.files.push(file));
      });
    } else {
      if (path !== '..') {
        this.absPath = path;
        if (!this.absPath.endsWith('/')) {
          this.absPath = this.absPath + '/';
        }
        this.pathService.changeMessage(this.absPath);
        this.filesService.listFiles(token, this.absPath).subscribe(data => {
          this.files = [];
          this.isDirectory = true;
          data['data'].forEach(file => this.files.push(file));
        });
      } else {
        const index = this.absPath.split('/').length - 2;
        this.absPath = this.absPath.split('/').splice(0, index).join('/').toString();
        if (!this.absPath.endsWith('/') && this.absPath.length > 0) {
          this.absPath = this.absPath + '/';
        }
        this.pathService.changeMessage(this.absPath);
        console.log(this.absPath);
        this.files = [];
        this.filesService.listFiles(token, this.absPath).subscribe(data => {
          console.log(data);
          if (this.absPath === ''){
            this.isDirectory = false;
          }
          data['data'].forEach(file => this.files.push(file));
        });
      }
    }
  }

  mkdir(): void {
    const token = localStorage.getItem('token');
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      token,
      path: this.absPath
    };
    dialogConfig.backdropClass = 'dialog';
    const dialogRef = this.dialog.open(FolderDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((path: string) => {
      if (path) {
        this.files = [];
        this.listFiles(path);
      }
    });
  }

  rmDir(): void {
    const token = localStorage.getItem('token');
    this.filesService.removeFile(token, this.absPath).subscribe(response => {
      console.log(response);
      const routeIndex = this.absPath.split('/').length - 2;
      this.absPath = this.absPath.split('/').splice(0, routeIndex).join('/').toString();
      this.files = [];
      this.listFiles(this.absPath);
    });
  }

  deleteFile(): void {
    const path = this.absPath + this.filename;
    const token = localStorage.getItem('token');
    this.filesService.removeFile(token, path).subscribe(response => {
      if (response['ok']) {
        this.dataService.changeMessage('');
        this.files = [];
        this.listFiles(this.absPath);
      }
    });
  }

  downloadFile(): void {
    const downloadPath = this.absPath + this.filename;
    const token = localStorage.getItem('token');
    this.filesService.downloadFile(token, downloadPath).subscribe(response => {
      if (response['ok']) {
        const file = new Blob([new Uint8Array(response['data'].data.data)], {
          type: /(?:\.([^.]+))?$/.exec(this.filename)[1]
        });
        saveAs(file, this.filename);
      }
    });
  }

  preview(): void {
    const token = localStorage.getItem('token');
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      token,
      path: this.absPath
    };
    dialogConfig.backdropClass = 'dialog';
    const dialogRef = this.dialog.open(PreviewComponent, dialogConfig);
  }

  getFileType(file): string {
    const type = file.type;
    const extension = '' + type;
    return extension.split('/')[0];
  }

  onThemeSwitch(event: any): void {
    if (!event.checked) {
      this.overlay.classList.remove('light-theme');
      this.overlay.classList.add('dark-theme');
      this.themeSelected = 'dark';
      this.checked = true;
    } else {
      this.overlay.classList.remove('dark-theme');
      this.overlay.classList.add('light-theme');
      this.themeSelected = 'light';
      this.checked = false;
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    this.ngOnDestroy();
    this.router.navigate(['']);
  }

}

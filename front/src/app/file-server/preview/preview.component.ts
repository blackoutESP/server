import config from 'src/config.json';
import { DataService } from './../../../services/data.service';
import { FilesService } from './../../../services/files.service';
import { Component, OnInit, AfterViewInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss']
})
export class PreviewComponent implements OnInit, AfterViewInit {

  @ViewChild('dialog') dialog: ElementRef;
  token: string;
  path: string;
  src = '';
  filename: string;
  extension: string;
  items = [];
  soundTracks = [];
  count = 0;
  constructor(private dataService: DataService,
              private filesService: FilesService,
              @Inject(MAT_DIALOG_DATA) public data: any) {
    this.dataService.currentMessage.subscribe(message => this.filename = message);
  }

  ngOnInit(): void {
    this.token = this.data.token;
    this.path = this.data.path;
    const regExp = /(?:\.([^.]+))?$/;
    const ext = regExp.exec(this.filename);
    this.extension = ext[1];
  }

  ngAfterViewInit(): void {
    switch (this.extension) {
      case 'mp3':
        // this.removeViewer();
        this.createPlaylist();
        break;
      case 'mp4':
      case 'mkv':
        // this.removeViewer();
        this.createPlaylist();
        break;
      case 'png':
      case 'jpg':
      case 'jpeg':
        // this.removeViewer();
        this.loadImage();
        break;
      case 'txt':
        // this.removeViewer();
        this.loadTxt();
        break;
      case 'pdf':
        this.loadPdf();
        break;
    }
  }

  removeViewer(): void {
    document.querySelector('mat-dialog-content').removeChild(document.querySelector('pdf-viewer'));
  }

  createPlaylist(): void {
    this.filesService.listFiles(this.token, this.path).subscribe(data => {
      data['data'].forEach(element => {
        if (element.type.split('/')[0] === 'video') {
          this.items.push(element.name);
        }else if (element.type.split('/')[0] === 'audio') {
          this.soundTracks.push(element.name);
        }
      });
      if (this.items.length === data['data'].length) {
        this.loadVideo(this.filename);
      }else if (this.soundTracks.length === data['data'].length) {
        this.loadAudio(this.filename);
      }
    });
  }

  loadVideo(name): void {
    if (this.count === this.items.length) {
      return;
    } else {
      const video = document.createElement('video');
      video.width = 854;
      const source = document.createElement('source');
      source.setAttribute('src', `http://${config.http.ip}:${config.http.port}/api/streaming/${this.path}${encodeURI(name)}?authorization=Bearer ${this.token}`);
      video.appendChild(source);
      document.querySelector('mat-dialog-content').appendChild(video);
      video.controls = true;
      video.autoplay = true;
      video.load();
      video.play();
      video.onended = () => {
        this.count++;
        this.dialog.nativeElement.removeChild(video);
        this.dataService.changeMessage(this.items[this.count]);
        this.loadVideo(this.items[this.count]);
      };
    }
  }

  loadImage(): void {
    const img = document.createElement('img');
    img.width = 854;
    img.src = `http://${config.http.ip}:${config.http.port}/api/image/${this.path}${encodeURI(this.filename)}?authorization=Bearer ${this.token}`;
    document.querySelector('mat-dialog-content').appendChild(img);
  }

  loadAudio(name): void {
    if (this.count === this.soundTracks.length) {
      return;
    } else {
      const audio = document.createElement('audio');
      audio
      .src = `http://${config.http.ip}:${config.http.port}/api/streaming/${this.path}${encodeURI(name)}?authorization=Bearer ${this.token}`;
      document.querySelector('mat-dialog-content').appendChild(audio);
      audio.controls = true;
      audio.autoplay = true;
      audio.onended = () => {
        this.count++;
        this.dialog.nativeElement.removeChild(audio);
        console.log(this.soundTracks[this.count]);
        this.dataService.changeMessage(this.soundTracks[this.count]);
        this.loadAudio(this.soundTracks[this.count]);
      };
    }
  }

  loadTxt(): void {
    const object = document.createElement('div');
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `http://${config.http.ip}:${config.http.port}/api/preview/${this.path}${encodeURI(this.filename)}`, true);
    xhr.setRequestHeader('Content-Type', 'text/txt; charset=UTF-8');
    xhr.setRequestHeader('Authorization', `Bearer ${this.token}`);
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4 && xhr.status === 200) {
        object.innerHTML = xhr.response;
      }
    };
    document.querySelector('mat-dialog-content').appendChild(object);
    xhr.send();
  }

  loadPdf(): void {
    this.src = `http://${config.http.ip}:${config.http.port}/api/preview/${this.path}${encodeURI(this.filename)}?authorization=Bearer ${this.token}`;
    // const pdf = document.createElement('object');
    // pdf.type = 'application/pdf';
    // pdf.width = 'auto';
    // pdf.height = 'auto';
    // pdf.style.overflow = 'auto';
    // // pdf.data = `http://${config.http.ip}:${config.http.port}/api/preview/${this.path}${this.filename}`;
    // const xhr = new XMLHttpRequest();
    // xhr.open('GET', `http://${config.http.ip}:${config.http.port}/api/preview/${this.path}${this.filename}`, true);
    // xhr.setRequestHeader('Content-Type', 'application/pdf; charset=UTF-8');
    // xhr.setRequestHeader('Authorization', `Bearer ${this.token}`);
    // xhr.onreadystatechange = () => {
    //   if (xhr.readyState === 4 && xhr.status === 200) {
    //     pdf.data = xhr.response;
    //     // document.querySelector('mat-dialog-content').appendChild(pdf);
    //   }
    // };
    // xhr.send();
  }

}

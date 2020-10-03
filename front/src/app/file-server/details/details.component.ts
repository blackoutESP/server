import { FileSizePipe } from './file-size.pipe';
import { Component, OnInit, Input } from '@angular/core';
import { FilesService } from './../../../services/files.service';
import { DataService } from './../../../services/data.service';
import { PathService } from './../../../services/path.service';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
  providers: [
    FileSizePipe
  ]
})
export class DetailsComponent implements OnInit {

  @Input() themeSelected: string;
  @Input() path: string;
  filename: string;
  size = 0;
  type: string;
  extension: string;
  created: Date;
  constructor(private filesService: FilesService, private dataService: DataService,
              private pathService: PathService, private fileSize: FileSizePipe) {
    this.dataService.currentMessage.subscribe(message => {
      if (message) {
        this.filename = message;
        this.getFileDetails();
      }
    });
    this.pathService.currentMessage.subscribe(message => {
      if (message) {
        this.path = message;
        console.log('path service:', this.path);
      }
    });
  }

  ngOnInit(): void {
  }

  getFileDetails(): void {
    const absPath = this.path + this.filename;
    const token = localStorage.getItem('token');
    this.filesService.listFileDetails(token, absPath).subscribe((data: any) => {
      console.log(data);
      this.size = data.data.size;
      this.type = data.data.type;
      const regExp = /(?:\.([^.]+))?$/;
      this.extension = regExp.exec(this.filename)[1];
      this.created = data.data.stats.birthtime;
    });
  }
}

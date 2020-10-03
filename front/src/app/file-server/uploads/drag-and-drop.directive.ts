import { Directive, HostListener, HostBinding, Output, EventEmitter } from '@angular/core';

@Directive({
  selector: '[appDragAndDrop]'
})
export class DragAndDropDirective {

  // @HostBinding('class.fileover') fileOver: boolean;
  @Output() fileDropped = new EventEmitter<any>();
  constructor() { }

  @HostListener('dragover', ['$event']) onDragOver(event) {
    event.stopPropagation();
    event.preventDefault();
    console.log('drag over');
    // this.fileOver = true;
  }

  @HostListener('dragleave', ['$event']) onDragLeave(event) {
    event.stopPropagation();
    event.preventDefault();
    console.log('drag leave');
    // this.fileOver = false;
  }

  @HostListener('drop', ['$event']) onDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    // this.fileOver = false;
    let files = event.dataTransfer.files;
    if (files.length > 0) {
      this.fileDropped.emit(files);
    }
  }
}

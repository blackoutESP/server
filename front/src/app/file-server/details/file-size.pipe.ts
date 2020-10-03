import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fileSize'
})
export class FileSizePipe implements PipeTransform {

  units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  transform(value: number): string {
    let count = 0;
    while (value >= 1024) {
      value /= 1024;
      count += 1;
    }
    return `${value.toFixed(3)} ${this.units[count]}`;
  }

}

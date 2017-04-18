import {Component, Input, EventEmitter, Output} from '@angular/core';
import {PhotoItem} from "../../models/PhotoItem";

/*
  Generated class for the ImageGalleryRow component.

  See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
  for more info on Angular 2 Components.
*/
@Component({
  selector: 'image-gallery-row',
  templateUrl: 'image-gallery-row.html'
})
export class ImageGalleryRowComponent {

  @Input() photoItems:Array<PhotoItem>;
  @Output() upload:EventEmitter<PhotoItem> = new EventEmitter<PhotoItem>();
  @Output() trash:EventEmitter<PhotoItem> = new EventEmitter<PhotoItem>();

  constructor() {
  }


  trashItem(photoItem:PhotoItem) {
    this.trash.emit(photoItem);
  }

  uploadItem(photoItem:PhotoItem) {
    this.upload.emit(photoItem);
  }

}

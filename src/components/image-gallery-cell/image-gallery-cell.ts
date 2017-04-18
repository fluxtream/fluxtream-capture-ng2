import {Component, Input, EventEmitter, Output} from '@angular/core';
import {PhotoItem} from "../../models/PhotoItem";

/*
  Generated class for the ImageGalleryCell component.

  See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
  for more info on Angular 2 Components.
*/
@Component({
  selector: 'image-gallery-cell',
  templateUrl: 'image-gallery-cell.html'
})
export class ImageGalleryCellComponent {

  @Input() photoItem: PhotoItem;
  @Output() upload: EventEmitter<PhotoItem> = new EventEmitter<PhotoItem>();
  @Output() trash: EventEmitter<PhotoItem> = new EventEmitter<PhotoItem>();

  constructor() {
  }

  trashItem() {
    this.trash.emit(this.photoItem);
  }

  uploadItem() {
    this.upload.emit(this.photoItem);
  }
}

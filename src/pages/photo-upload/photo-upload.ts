import {Component} from "@angular/core";
import {
  PhotoListService,
  PhotoUploadModuleEvents
} from "../../providers/photo-list-service";
import {PhotoItem} from "../../models/PhotoItem";
import {PhotoSynchronizationService} from "../../providers/photo-synchronization-service";
import {NativeEvent} from "../../models/NativeEvent";

/*
  Generated class for the PhotoUpload page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-photo-upload',
  templateUrl: 'photo-upload.html'
})
export class PhotoUploadPage {

  private photoRows:Array<Array<PhotoItem>>;
  private noAccess: boolean;

  constructor(private photoListService: PhotoListService,
              private photoSynchronizationService: PhotoSynchronizationService) {}

  ionViewDidLoad() {
    console.log("new, about to load photo list...", this.photoListService);
    this.photoListService.getPhotoList().then(photoList=>{
      console.log("photo list!", photoList);
      this.photoRows= [];
      let i=0;
      let currentRow:Array<PhotoItem> = [];
      for (let photo of photoList) {
        if (i%3==0) {
          currentRow = [];
          this.photoRows.push(currentRow);
        }
        currentRow.push(photo);
        i++;
      }
      console.log("photoRows", this.photoRows);
      this.photoListService.photoEvents.map((event:NativeEvent<PhotoUploadModuleEvents>)=>{
        console.log("received photo event:", event.type, event.data);
      }).subscribe();
    }).catch((error)=>{
      console.log("could not access photos", error);
      this.noAccess = true;
    });
  }

  trashItem(photoItem:PhotoItem) {
    console.log("we should trash this item", photoItem);
  }

  uploadItem(photoItem:PhotoItem) {
    this.photoSynchronizationService.uploadPhoto(photoItem.id, ()=>{
      console.log("successfully uploaded a photo");
    }, (error)=>{
      console.log("failed at uploading a photo", error);
    });
  }

}

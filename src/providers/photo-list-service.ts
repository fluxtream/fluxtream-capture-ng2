import {EventEmitter, Injectable} from "@angular/core";
import "rxjs/add/operator/map";
import {PhotoItem} from "../models/PhotoItem";
import {NativeEvent} from "../models/NativeEvent";
import {Platform} from "ionic-angular";
import {NativeService} from "./native-service";

/*
  Generated class for the PhotoList provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/

export enum PhotoUploadModuleEvents {
  PHOTOUPLOAD_STARTED,        // 0
  PHOTOUPLOAD_UPLOADED,       // 1
  PHOTOUPLOAD_CANCELED,       // 2
  PHOTOUPLOAD_FAILED,         // 3
  PHOTOLIST_CHANGED           // 4
}

@Injectable()
export class PhotoListService {

  public photoEvents: EventEmitter<NativeEvent<PhotoUploadModuleEvents>> = new EventEmitter<NativeEvent<PhotoUploadModuleEvents>>();

  // A cached list of photos for preloading the photo view
  private cachedPhotoList = [];

  // Whether the photo list has been initialized
  private initialized = false;

  // Functions to execute once the photo list has been initialized
  private functionsToExecute = [];

  // If true, the photo list will be reloaded again once the reload has finished (useful if photos are deleted in the meantime)
  private reloadAgain = false;

  // On iOS, true if the user has not allowed the app to access photos
  private photoAccessDenied = false;

  constructor(private platform:Platform,
              private nativeService: NativeService) {
    console.log('Hello PhotoList Provider');
    this.nativeService.listenToPhotoUploadModuleEvents(this.photoEvents);
  }

  public getPhotoList():Promise<Array<PhotoItem>> {
    if (!this.initialized) return this.loadPhotos();
    else
      return new Promise(resolve=>resolve(this.cachedPhotoList));
  }

  private loadPhotos():Promise<Array<PhotoItem>> {
  // Call native module to get the photo list
    return new Promise((resolve, reject)=>{
      this.nativeService.getPhotoList().then(
        // Success
        (jsonArray) => {
          console.log("called native getPhotoList with success", jsonArray);
          // Data can either be json-encoded string or an actual array
          let photoList;
          if (typeof jsonArray === 'string')
          // Json string, convert to array
            photoList = JSON.parse(jsonArray);
          else
          // Actual array
            photoList = jsonArray;
          // Determine if photo list has changed
          let somethingChanged = false;
          if (photoList.length != this.cachedPhotoList.length) {
            somethingChanged = true;
          } else {
            for (let i = 0; i < photoList.length; i++) {
              let cachedPhoto = this.cachedPhotoList[i];
              let newPhoto = photoList[i];
              if (cachedPhoto.id != newPhoto.id) {
                somethingChanged = true;
                break;
              }
            }
          }
          // Update photo list
          this.cachedPhotoList = photoList;
          this.initialized = true;
          this.photoAccessDenied = false;
          this.functionsToExecute.forEach(function(functionToExecute) {
            functionToExecute();
          });
          this.functionsToExecute = [];
          if (this.reloadAgain) {
            this.reloadAgain = false;
            this.reloadPhotos();
          }
          if (somethingChanged) {
            this.photoEvents.emit(new NativeEvent(PhotoUploadModuleEvents.PHOTOLIST_CHANGED, {}));
          }
          resolve(this.cachedPhotoList);
        }
        // Error
      ).catch(error=>{
        console.log("error getting native photos list", error);
        if (error.reason&&error.reason===NativeService.PERMISSION_WAS_NOT_GRANTED)
          this.nativeService.requestStorageReadPermission().then((granted)=>{
            if (granted) {
              console.log("granted! Loading photos again...");
              this.loadPhotos()
                .then((photoItems)=>{
                  console.log("loaded photos again: ", photoItems);
                  resolve(photoItems)
                })
                .catch((error)=>reject(error));
            } else {
              // Access denied on iOS
              this.photoAccessDenied = true;
              this.initialized = true;
              if (this.cachedPhotoList.length) {
                this.cachedPhotoList = [];
                this.photoEvents.emit(new NativeEvent(PhotoUploadModuleEvents.PHOTOLIST_CHANGED, {}));
              }
            }
          }).catch((error)=>reject(error));
      });
    });
  }

  /**
   * Re-runs the photo loading process to update the photo list
   */
  private reloadPhotos() {
    // Don't reload if loading is already in progress
    if (!this.initialized) {
      this.reloadAgain = true;
      return;
    }
    // Reset initialization status
    this.initialized = false;
    // Reload photos
    this.loadPhotos();
  }


}

import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import {UserPrefsService} from "./user-prefs-service";
import {LoginService, LoginEvents} from "./login-service";
import {NativeService} from "./native-service";

/*
  Generated class for the PhotoSynchronizationService provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class PhotoSynchronizationService {

  constructor(public http: Http,
              private loginService: LoginService,
              private nativeServices: NativeService,
              private userPrefs: UserPrefsService) {
    console.log('Hello PhotoSynchronizationService Provider');
    this.loginService.events.map((event)=>{
      console.log("received login event:", event);
      switch(event) {
        case LoginEvents.SIGNED_IN:
          this.nativeServices.setUploadParameters(this.userPrefs, this.loginService.getUserId());
          break;
        case LoginEvents.SIGNED_OUT:
          break;
      }
    }).subscribe();
  }

  /**
   * Adds the given photo to the unsynchronized list
   *
   * @param {int} The photo to add to the unsynchronized list
   * @param {string} "metadata" or "photo"
   */
  private addToUnsynchronized(photoId, type) {
    let pref = (type === "metadata" ? "photo.metadata.unsynchronized" : "photo.unuploaded");
    console.log("adding to unsynchronized...", pref);
    let unsynchronized = JSON.parse(this.userPrefs.getValueForUser(pref, "[]"));
    if (unsynchronized.indexOf(photoId) === -1) {
      unsynchronized.push(photoId);
    }
    this.userPrefs.getValueForUser(pref, JSON.stringify(unsynchronized));
  }


  public uploadPhoto(photoId, success, error) {
    this.addToUnsynchronized(photoId, "photo");
    this.nativeServices.uploadPhoto(photoId, success, error);
  }
}

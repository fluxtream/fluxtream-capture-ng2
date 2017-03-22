import {Injectable} from "@angular/core";
import "rxjs/add/operator/map";
import {UserPrefsService} from "./user-prefs-service";

/*
  Generated class for the DeviceId provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class DeviceIdService {

  constructor(private userPrefs:UserPrefsService) {
    console.log('Hello DeviceId Provider');
  }

  getDeviceId():Promise<string> {
    return new Promise((resolve)=>{
      let deviceId = this.userPrefs.getGlobal("login.deviceId");
      // Call callback directly if the device id is available
      if (deviceId) {
        resolve(deviceId);
      } else {
        deviceId = this.generateUUID();
        this.userPrefs.setGlobal("login.deviceId", deviceId);
        resolve(deviceId);
      }
    });

  }

  private generateUUID():string{
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = (d + Math.random()*16)%16 | 0;
      d = Math.floor(d/16);
      return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
  };


}

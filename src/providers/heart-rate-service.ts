import {Injectable, EventEmitter} from "@angular/core";
import "rxjs/add/operator/map";
import {NativeEvent} from "../models/NativeEvent";
import {NativeService} from "./native-service";

/*
 Generated class for the FlxH7 provider.

 See https://angular.io/docs/ts/latest/guide/dependency-injection.html
 for more info on providers and Angular 2 DI.
 */

declare var forge: any;

export enum HeartRateModuleEvents {
  HEARTRATE_DEVICE_CONNECTED,         // 0
  HEARTRATE_DEVICE_DISCONNECTED,      // 1
  HEARTRATE_DATA,                     // 2
  HEARTRATE_ERROR,                    // 3
  HEARTRATE_DISCOVERY_STARTED,        // 4
  HEARTRATE_SERVICE_FOUND,            // 5
  HEARTRATE_START_UPLOAD,             // 6
  HEARTRATE_UPLOAD_DONE,              // 7
  HEARTRATE_UPLOAD_ERROR,             // 8
  HEARTRATE_LOCK_SUCCESS              // 9
}

@Injectable()
export class HeartRateService {

  public deviceEvents: EventEmitter<NativeEvent<HeartRateModuleEvents>> =
    new EventEmitter<NativeEvent<HeartRateModuleEvents>>();

  constructor(private nativeService: NativeService) {
    console.log('Hello HeartRateService Provider');
    this.nativeService.listenToHeartRateModuleEvents(this.deviceEvents);
  }

  isBLESupported(success: (value) => any, error: (e) => any) {
    this.nativeService.isBLESupported(success, error);
  }

  enableService(accessToken: string, success, error) {
    this.nativeService.enableHeartRateService(accessToken, success, error);
  }

  disableService() {
    this.nativeService.disableHeartRateService();
  }


  stopService(success, error) {
    this.nativeService.stopHeartRateService(success, error);
  }

  lockCurrentDevice(success, error) {
    this.nativeService.lockCurrentHeartRateDevice(success, error);
  }

  unlockCurrentDevice(success, error) {
    this.nativeService.unlockCurrentHeartRateDevice(success, error);
  }

}

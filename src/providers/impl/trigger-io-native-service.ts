import {Injectable} from "@angular/core";
import "rxjs/add/operator/map";

/*
 Trigger IO implementation of the Native Services
 */

declare var forge: any;

@Injectable()
export class TriggerIONativeService {

  private preferences: any = {};

  constructor() {
    console.log('Hello Native Provider');
  }

  // GENERIC STUFF

  addEventListener(eventName: string, handler: (data) => any) {
    forge.internal.addEventListener(eventName, handler);
  }

  logError(message: string) {
    forge.logging.error(message);
  }

  // GEOLOCATION

  getCurrentPosition():Promise<Position> {
    return new Promise((resolve, reject)=>{
      forge.geolocation.getCurrentPosition({
        enableHighAccuracy: true
      }, (position)=>resolve(position), (error)=>reject(error));
    });
  }

  // PREFERENCES

  setPreference(key: string, value: string): void {
    forge.prefs.set(key, value);
  }

  getPreference(key: string): string {
    return this.preferences[key];
  }

  // PERMISSIONS

  private requestPermission(forgePermission):Promise<boolean> {
    return new Promise((resolve, reject)=>{
      forge.permissions.request(forgePermission,
        "", (granted)=>resolve(granted), (error)=>reject(error));
    });
  }

  requestStorageReadPermission():Promise<boolean> {
    return this.requestPermission(forge.permissions.storage.read);
  }

  /**
   * Cache preferences to allow synchronous access
   * @param self
   */
  initializeUserPrefs() {
    forge.prefs.keys(
      // Success
      function (keysArray) {
        keysArray.forEach(function (key) {
          if (key.indexOf("flx.") === 0) {
            forge.prefs.get(key,
              // Success
              function (value) {
                this.preferences[key] = value;
              },
              // Error
              function (content) {
                forge.logging.error("Error while fetching user prefs (" + key + "): " + JSON.stringify(content));
              }
            );
          }
        });
      },
      // Error
      function (content) {
        forge.logging.error("Error while fetching user prefs: " + JSON.stringify(content));
      }
    );
  }

}

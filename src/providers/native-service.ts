import {Injectable} from "@angular/core";
import "rxjs/add/operator/map";
import {Logger} from "../utils";

/*
  Generated class for the Forge provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/

@Injectable()
export class NativeService {

  private logger: any;

  public static readonly PERMISSION_WAS_NOT_GRANTED: string = "permission_was_not_granted";
  private storage = window.localStorage;

  constructor() {
    this.logger = Logger(true, NativeService.name);
    console.log('Hello Mock Native Service Provider');
  }

  // GENERIC STUFF

  addEventListener(eventName: string, handler: (data) => any) {
  }

  logError(message: string) {
  }

  // GEOLOCATION

  getCurrentPosition():Promise<Position> {
    return new Promise((resolve)=>{
      setTimeout(()=>{
        resolve(<Position>{
          timestamp: new Date().getTime(),
          coords: {
            latitude: 50.52,
            longitude: 4.22,
            altitude: 0,
            accuracy: 20,
            altitudeAccuracy: 0,
            heading: 0,
            speed: 0
          }
        });
      }, 1000);
    })
  }

  // PREFERENCES

  getPreference(key: string): string {
    let item = this.storage.getItem(key);
    return item;
  }

  setPreference(key: string, value: string): void {
    this.storage.setItem(key, value);
  }

  getPrefs() {
    let prefs = {};
    for (let i=0; i<this.storage.length; i++) {
      let key = this.storage.key(i);
      prefs[key] = this.storage.getItem(key);
    }
    return prefs;
  }

  /**
   * Cache preferences to allow synchronous access
   * @param self
   */
  initializeUserPrefs() {
  }

  deleteLoginInfo() {
    let keysToDelete = [];
    for (let i=0; i<this.storage.length; i++)
      if (this.storage.key(i).startsWith("flx.login"))
        keysToDelete.push(this.storage.key(i));
    this.logger.log("default native service, deleteLoginInfo", keysToDelete);
    for (let key of keysToDelete)
      this.storage.removeItem(key);
  }

  deleteValuesForUser(uid) {
    let keysToDelete = [];
    for (let i=0; i<this.storage.length; i++)
      if (this.storage.key(i).startsWith("flx.user."+uid))
        keysToDelete.push(this.storage.key(i));
    this.logger.log("default native service, deleteValuesForUser", keysToDelete);
    for (let key of keysToDelete)
      this.storage.removeItem(key);
  }
}

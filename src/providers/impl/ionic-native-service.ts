import {Injectable} from "@angular/core";
import "rxjs/add/operator/map";
import {Geolocation} from "ionic-native";
import {Logger} from "../../utils";

/*
 Ionic native implementation of the Native Services
 */
declare var cordova: any;

@Injectable()
export class IonicNativeService {

  private logger: any;
  private storage = window.localStorage;

  constructor() {
    this.logger = Logger(true, IonicNativeService.name);
    console.log('Hello Ionic Native Provider');
  }

  // GEOLOCATION

  getCurrentPosition():Promise<Position> {
    return Geolocation.getCurrentPosition();
  }

  // PREFERENCES

  getPreference(key: string): string {
    let item = this.storage.getItem(key);
    console.log("getting preference " + key + " -> " + item);
    return item;
  }

  setPreference(key: string, value: string): void {
    console.log("setting preference " + key + " -> " + value);
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
    this.logger.debug("(signing out) keysToDelete", keysToDelete);
    for (let key of keysToDelete)
      this.storage.removeItem(key);
  }

  /**
   * Cache preferences to allow synchronous access
   * @param userPrefs
   */
  initializeUserPrefs() {
  }

}

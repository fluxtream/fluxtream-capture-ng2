import {Injectable} from "@angular/core";
import "rxjs/add/operator/map";
import {Geolocation} from "ionic-native";

/*
 Ionic native implementation of the Native Services
 */
declare var cordova: any;

@Injectable()
export class IonicNativeService {

  private storage = window.localStorage;

  constructor() {
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

  /**
   * Cache preferences to allow synchronous access
   * @param userPrefs
   */
  initializeUserPrefs() {
  }

}

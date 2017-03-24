import {Injectable, EventEmitter} from "@angular/core";
import "rxjs/add/operator/map";
import {Platform} from "ionic-angular";
import {Utils, Logger} from "../utils";
import {NativeService} from "./native-service";
import {DateBrowserService} from "./date-browser-service";

/*
  Generated class for the UserPrefs provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/

declare var forge: any;

export class UserPrefs {

  public static readonly TOPICS_FILTER_KEY = "topicsFilter";
  public static readonly HISTORY_MODE: string = "history_mode";
  public static readonly TIME_UNIT: string = "timeUnit";

}

export class AppDefaults {

  public static readonly DEFAULT_TIMEUNIT: string = 'day';

}

@Injectable()
export class UserPrefsService {

  private logger: any;
  public prefChanges:EventEmitter<string>;

  private uid:string = "1";

  // The number of items to initialize
  itemCount:number;

  constructor(private native: NativeService,
              private platform: Platform) {
    console.log('Hello UserPrefs Provider');
    this.logger = Logger(true, UserPrefsService.name);
    this.prefChanges = new EventEmitter<string>();
    if (Utils.isDevice(platform)) {
      console.log("initializing user prefs...");
      this.native.initializeUserPrefs();
    }
  }

  setUserId(userId:string) {
    this.uid = userId;
  }

  dumpPrefs() {
    let prefs = this.native.getPrefs();
    console.log("dumping preferences:");
    for (let key in prefs)
      console.log(key + " -> " + prefs[key]);
  }

  getGlobal(key:string):any {
    return this.native.getPreference("flx."+key);
  }

  setGlobal(key: string, value: any) {
    let prefKey = "flx." + key;
    this.storeValue(prefKey, value);
    this.prefChanges.emit(prefKey.substring(prefKey.lastIndexOf(".")+1));
  }

  getValueForUser(key, defaultValue) {
    let prefKey = 'user.' + this.uid + "." + key;
    let value = this.getGlobal(prefKey);
    if (value) return value;
    else return defaultValue;
  }

  setValueForUser(key, value) {
    let prefKey = 'user.' + this.uid + "." + key;
    this.setGlobal(prefKey, value);
  }

  private storeValue(prefKey, value) {
    this.native.setPreference(prefKey, value);
  }

  deleteLoginInfo() {
    this.native.deleteLoginInfo();
  }

  deleteValuesForUser() {
    this.logger.log("userPrefs, deleteValuesForUser", this.uid);
    this.native.deleteValuesForUser(this.uid);
  }
}

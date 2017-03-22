import {Platform} from "ionic-angular";
import {environment} from "./env/environment";
/**
 * Created by candide on 15/02/2017.
 */

declare var cordova;

export interface HashTable<T> {
  [key: string]: T;
}

export function Logger(enabled: boolean, classname: string) {

  let logger: any = {};

  if (!environment.production&&enabled) {
    for (var m in console)
      if (typeof console[m] == 'function')
        logger[m] = console[m].bind(window.console, classname+": ");
  } else { // silence the console
    for (var m in console)
      if (typeof console[m] == 'function')
        logger[m] = function(){}
  }

  return logger;

}

export class Utils {

  public static getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static copyJSONProps(src:any, dest:any):void {
    for (let key in src) {
      if (!key.startsWith('$'))
        dest[key] = src[key];
    }
  }

  static toBase64(blob:Blob):Promise<string> {
    return new Promise(resolve=> {
      var reader = new (<any>window).FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = function () {
        let base64data = reader.result;
        resolve(base64data);
      }
    });
  }

  static getBlob(url:string):Promise<Blob> {
    return new Promise(resolve=>{
      let xhr = new XMLHttpRequest();
      xhr.open("GET", url);
      xhr.responseType = "blob";
      xhr.addEventListener('load', function() {
        resolve(xhr.response);
      });
      xhr.send();
    });
  }

  static upperCaseFirst(str:string):string {
    return str.charAt(0).toUpperCase() + str.substring(1);
  }

  static trueOrFalse():boolean {
    return Math.random() >= 0.5;
  }

  static hash(str):number {
    var hash = 0, i, chr, len;
    if (str.length === 0) return hash;
    for (i = 0, len = str.length; i < len; i++) {
      chr   = str.charCodeAt(i);
      hash  = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  };

  static isDevice(platform:Platform):boolean {
    return typeof cordova != "undefined";
  }

  static isEmpty(o:any) {
    if (o.$value&&o.$value==null)
      return true;
    return false;
  }
}

import {Injectable, EventEmitter} from "@angular/core";
import {
  Http,
  RequestOptionsArgs,
  Headers,
  ResponseContentType, Response
} from "@angular/http";
import "rxjs/add/operator/map";
import {DeviceIdService} from "./device-id";
import "rxjs/add/operator/catch";
import {Observable} from "rxjs";
import "rxjs/Rx";
import {UserPrefsService} from "./user-prefs-service";
import {Platform} from "ionic-angular";
import {environment} from "../env/environment";
import {Logger} from "../utils";

/*
  Generated class for the Login provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/

export enum LoginEvents {
  SIGNED_IN,
  SIGNED_OUT
}

@Injectable()
export class LoginService {

  private logger: any;

  private uid:string;
  public guestModel:any;

  public events:EventEmitter<LoginEvents> = new EventEmitter<LoginEvents>();

  constructor(public http: Http,
              private platform: Platform,
              private userPrefs: UserPrefsService,
              private deviceId: DeviceIdService) {
    this.logger = Logger(true, LoginService.name);
    this.logger.log('Hello Login Provider', this.userPrefs, this.deviceId);
  }

  public signIn(username:string, password:string):Promise<Observable<any>> {
    return new Promise((resolve)=>{
      this.deviceId.getDeviceId().then((deviceId)=>{
        let postUrl = environment.targetServer+"api/v1/mobile/signin";
        let obs = this.http.post(postUrl, "username="+username+"&password="+password+"&device_id="+deviceId,
          <RequestOptionsArgs>{
            headers: new Headers([{'Content-Type':'application/json'}]),
            responseType: ResponseContentType.Json
          });
        resolve(obs);
      });
    });
  }

  public getAccessToken() {
    return this.guestModel.access_token;
  }

  getUserId():string {
    return this.userPrefs.getGlobal("login.userId");
  }

  getRequestHeaders() {
    let headers = new Headers();
    headers.append('Authorization', 'Bearer ' +
      this.userPrefs.getGlobal("login.fluxtream_access_token"));
    headers.append('Content-Type', 'application/json');
    return headers;
  }

  public handleAuthSuccessResponse(guestModel:any) {
    this.logger.log("handleAuthSuccessResponse", guestModel, this.userPrefs, this.deviceId, this);
    this.guestModel = guestModel;
    this.userPrefs.setGlobal('login.username', guestModel.username);
    this.userPrefs.setGlobal('login.userId', guestModel.id + "");
    this.userPrefs.setGlobal('login.fullname', guestModel.fullname);
    this.userPrefs.setGlobal('login.firstname', guestModel.firstname);
    this.userPrefs.setGlobal('login.lastname', guestModel.lastname);
    this.userPrefs.setGlobal('login.email', guestModel.email);
    this.userPrefs.setGlobal('login.fluxtream_access_token', guestModel.access_token + "");
    this.userPrefs.setGlobal('login.isAuthenticated', true);
    if (!this.userPrefs.getGlobal('login.photoURL')) this.userPrefs.setGlobal('login.photoURL', guestModel.photoURL);
    if (guestModel.photoURL) {
      // imageCache.cacheImage(guestModel.photoURL, function(uri) {
      //   userPrefs.setGlobal('login.photoURL', uri);
      // });
    }
    // if (typeof (guestModel.username) !== "undefined") {
    //   if (typeof onSuccessFunction === 'function') onSuccessFunction();
    // } else {
    //   forge.logging.error("Error accessing " + getTargetServer() + "api/v1/guest: " + textStatus);
    //   alert("Error accessing " + getTargetServer() + "\nError code: " + textStatus);
    // }
    this.uid = guestModel.id;
    this.userPrefs.setUserId(guestModel.id);
    this.logger.log("emitting signed in event");
    this.events.emit(LoginEvents.SIGNED_IN);
  }

  signOut() {
    return Promise.resolve({});
  }

  signUp(signupObject: any):Promise<Observable<any>> {
    this.logger.log("signup's raw values", signupObject);
    return new Promise((resolve)=>{
      this.deviceId.getDeviceId().then((deviceId)=>{
        let postUrl = environment.targetServer+"api/v1/mobile/signup";
        let obs = this.http.post(postUrl, "username="+signupObject.username
          +"&password="+signupObject.password
          +"&firstname="+signupObject.firstname
          +"&lastname="+signupObject.lastname
          +"&email="+signupObject.email
          +"&device_id="+deviceId,
          <RequestOptionsArgs>{
            headers: new Headers([{'Content-Type':'application/json'}]),
            responseType: ResponseContentType.Json
          });
        resolve(obs);
      });
    });
  }
}

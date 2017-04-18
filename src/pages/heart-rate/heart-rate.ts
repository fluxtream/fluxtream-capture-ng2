import {Component} from "@angular/core";
import {
  HeartRateService,
  HeartRateModuleEvents
} from "../../providers/heart-rate-service";
import {LoginService} from "../../providers/login-service";

/*
 Generated class for the HeartRate page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
  selector: 'page-heart-rate',
  templateUrl: 'heart-rate.html',
  providers: [HeartRateService]
})
export class HeartRatePage {

  private lastSync: Date;
  private monitoringEnabled: boolean = false;
  private deviceName: string = 'Polar H7 (1)';
  private deviceConnected: boolean = false;
  private deviceLocked: boolean = false;
  private status: string = "";
  private bleSupported: boolean;

  constructor(private heartRateService: HeartRateService,
              private loginService: LoginService) {
  }

  private handleDeviceEvents() {
    this.heartRateService.deviceEvents.map((event) => {
      console.log("received heart rate device event: ", event);
      switch (event.type) {
        case HeartRateModuleEvents.HEARTRATE_DEVICE_CONNECTED:
          this.deviceName = event.data.device_name;
          this.deviceConnected = true;
          break;
        case HeartRateModuleEvents.HEARTRATE_DEVICE_DISCONNECTED:
          this.deviceName = null;
          this.deviceConnected = false;
          break;
        case HeartRateModuleEvents.HEARTRATE_DATA:
          break;
        case HeartRateModuleEvents.HEARTRATE_ERROR:
          this.status = "Device Error!";
          break;
        case HeartRateModuleEvents.HEARTRATE_DISCOVERY_STARTED:
          this.status = "Searching for heart rate monitor";
          break;
        case HeartRateModuleEvents.HEARTRATE_SERVICE_FOUND:
          break;
        case HeartRateModuleEvents.HEARTRATE_START_UPLOAD:
          this.status = "Synching...";
          break;
        case HeartRateModuleEvents.HEARTRATE_UPLOAD_DONE:
          this.lastSync = new Date();
          break;
        case HeartRateModuleEvents.HEARTRATE_UPLOAD_ERROR:
          this.status = "Sync Error!";
          break;
        case HeartRateModuleEvents.HEARTRATE_LOCK_SUCCESS:
          this.deviceLocked = true;
          break;
      }
    }).subscribe();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad HeartRatePage, ', this.heartRateService);
    this.heartRateService.isBLESupported((supported) => {
      this.bleSupported = supported;
    }, () => {
      this.bleSupported = false;
    });
  }

  lockDevice() {
    this.heartRateService.lockCurrentDevice(()=>{
      this.deviceLocked = true;
    }, ()=>{});
  }

  unlockDevice() {
    this.heartRateService.unlockCurrentDevice(()=>{
      this.deviceLocked = false;
    }, ()=>{})
  }

  disableMonitoring() {
    this.heartRateService.disableService();
    this.monitoringEnabled = false;
  }

  enableMonitoring() {
    this.heartRateService.enableService(this.loginService.getAccessToken(),
      ()=>{
        this.monitoringEnabled = true;
        this.handleDeviceEvents();
      },
      ()=>{});
  }
}

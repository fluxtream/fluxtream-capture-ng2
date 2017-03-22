import {Component} from "@angular/core";
import {
  NavParams,
  AlertController,
  ModalController,
  ToastController,
  ActionSheetController,
  NavController
} from "ionic-angular";
import {SelfReportService} from "../../providers/self-report-service";
import {TimeWidgetPage} from "../time-widget/time-widget";
import * as moment from "moment-timezone";
import {MapWidgetPage} from "../map-widget/map-widget";
import {NativeService} from "../../providers/native-service";
import {LatLngLiteral} from "angular2-google-maps/core";
import {TimezoneWidgetPage} from "../timezone-widget/timezone-widget";

/*
  Generated class for the NewObservation page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-edit-observation',
  templateUrl: 'edit-observation.html'
})
export class EditObservationPage {

  topic: any;
  value: number = 0;
  coordinates: LatLngLiteral;
  observationComment: string;
  date: string;
  time: string;
  timezone: string;
  originalObservation: any;
  latLngAccuracy: number;

  constructor(private navParams: NavParams,
              private navCtrl: NavController,
              private nativeService: NativeService,
              private selfReportService: SelfReportService,
              private alertCtrl: AlertController,
              private modalCtrl: ModalController,
              private toastCtrl: ToastController,
              private actionSheetCtrl: ActionSheetController) {
    let topicId = navParams.get("topicId");
    this.selfReportService.getTopicById(topicId).then((topic)=>{
      this.topic = topic;
      if (this.topic.rangeDefault) {
        this.value = this.topic.rangeDefault;
      }
      let observation = navParams.get("observation");
      if (observation) {
        this.originalObservation = observation;
        this.observationComment = observation.comment;
        this.date = observation.observationDate;
        this.time = observation.observationTime;
        this.timezone = observation.timezone;
        this.value = observation.value;
        if (observation.latitude&&observation.longitude)
          this.coordinates = {lat: observation.latitude, lng:observation.longitude};
        if (observation.latLngAccuracy)
          this.latLngAccuracy = observation.latLngAccuracy;
      } else {
        nativeService.getCurrentPosition().then(position=> {
          this.coordinates = {lat:position.coords.latitude, lng: position.coords.longitude};
          this.latLngAccuracy = position.coords.accuracy;
        });
      }
    }).catch((error)=>{
      console.log("Couldn't retrieve topic named " + topicId, error);
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad NewObservationPage');
  }

  setTime() {
    let timeWidget = this.modalCtrl.create(TimeWidgetPage, {
      date: this.date?this.date:moment().format("YYYY-MM-DD"),
      time: this.time?this.time:moment().format("HH:mm"),
      timezone: this.timezone?this.timezone:moment.tz.guess()
    });
    timeWidget.present();
    timeWidget.onDidDismiss(data=>{
      console.log("received data from time widget", data);
      if (data&&data.date) {
        this.date = data.date;
        this.time = data.time;
      }
    });
  }

  setTimezone() {
    let tzWidget = this.modalCtrl.create(TimezoneWidgetPage, {
      date: this.date?this.date:moment().format("YYYY-MM-DD"),
      time: this.time?this.time:moment().format("HH:mm"),
      timezone: this.timezone?this.timezone:moment.tz.guess()
    });
    tzWidget.present();
    tzWidget.onDidDismiss((zone:moment.MomentZone)=>{
      if (zone)
        this.timezone = zone.name;
    });
  }

  locate() {
    let mapWidget = this.modalCtrl.create(MapWidgetPage, {
      latLng: this.coordinates,
      topicName: this.topic.name
    });
    mapWidget.present();
    mapWidget.onDidDismiss((coords)=>{
      if (coords) {
        this.coordinates = <LatLngLiteral>{lat: coords.lat, lng:coords.lng};
      }
    })
  }

  dismiss() {
    this.navCtrl.pop();
  }

  observationTime() {
    return moment.tz(this.date + " " + this.time, this.timezone).format("ddd MMM Do, YYYY HH:mm");
  }

  observationTimezone() {
    return moment.tz(this.timezone).zoneName();
  }

  delete() {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Are you sure?',
      buttons: [
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.selfReportService.remove("observations", this.originalObservation).then(()=>{
              let toast = this.toastCtrl.create({
                message: "Observation Deleted",
                duration: 3000,
                position: 'top'
              });
              toast.present().then(()=>{
                this.dismiss();
              });
            });
          }
        },{
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });
    actionSheet.present();
  }

  save() {
    if (this.originalObservation) {
      this.update();
    } else
      this.create();
  }

  create() {
    let dateToday = moment().format("YYYY-MM-DD");
    let timeNow = moment().format("HH:mm:ss");
    this.selfReportService.create("observations", {
      topicId: this.topic._id,
      value: this.value?this.value:0,
      creationDate: dateToday,
      creationTime: timeNow,
      observationDate: this.date?this.date:dateToday,
      observationTime: this.time?this.time:timeNow,
      updateTime: moment().toISOString(),
      timezone: this.timezone?this.timezone:moment.tz.guess(),
      latitude: this.coordinates?this.coordinates.lat:null,
      longitude: this.coordinates?this.coordinates.lng:null,
      latLngAccuracy: this.latLngAccuracy,
      comment: this.observationComment
    }).then(
      ()=> {
        let toast = this.toastCtrl.create({
          message: "Observation Created",
          duration: 3000,
          position: 'top'
        });
        toast.present();
        this.dismiss()
      }
    ).catch(
      (error)=>{
        console.log("error: ", error);
        this.alertCtrl.create({
          title: "Error",
          subTitle: "Could not create Observation",
          buttons: [{
            text: "Dismiss",
            role: "cancel",
            handler: () => {
              setTimeout(()=>this.dismiss(), 500);
            }
          }]
        }).present().then(()=>{
          this.dismiss();
        });
      }
    );
  }

  private update() {
    this.selfReportService.update("observations", {
      _id: this.originalObservation._id,
      _rev: this.originalObservation._rev,
      topicId: this.topic._id,
      value: this.value?this.value:0,
      creationDate: this.originalObservation.creationDate,
      creationTime: this.originalObservation.creationTime,
      observationDate: this.date?this.date:this.originalObservation.creationDate,
      observationTime: this.time?this.time:this.originalObservation.creationTime,
      updateTime: moment().toISOString(),
      timezone: this.timezone?this.timezone:moment.tz.guess(),
      latitude: this.coordinates?this.coordinates.lat:null,
      longitude: this.coordinates?this.coordinates.lng:null,
      latLngAccuracy: this.latLngAccuracy,
      comment: this.observationComment
    }).then(
      ()=> {
        let toast = this.toastCtrl.create({
          message: "Observation Updated",
          duration: 3000,
          position: 'top'
        });
        toast.present().then(()=>{
          this.dismiss()
        });
      }
    ).catch(
      (error)=>{
        console.log("error: ", error);
        this.alertCtrl.create({
          title: "Error",
          subTitle: "Could not update Observation",
          buttons: [{
            text: "Dismiss",
            role: "cancel",
            handler: () => {
              setTimeout(()=>this.dismiss(), 500);
            }
          }]
        }).present().then(()=>{
          this.dismiss();
        });
      }
    );
  }
}

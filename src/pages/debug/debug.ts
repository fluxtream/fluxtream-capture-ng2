import {Component} from "@angular/core";
import {NavController, NavParams, ModalController} from "ionic-angular";
import {SelfReportService} from "../../providers/self-report-service";
import {TestDataService} from "../../providers/test-data-service";
import * as moment from "moment-timezone";
import {TimezoneWidgetPage} from "../timezone-widget/timezone-widget";

/*
  Generated class for the Debug page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-debug',
  templateUrl: 'debug.html'
})
export class DebugPage {

  observations: any;
  topics: any;
  totalObservations: number;

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public modalCtrl: ModalController,
              private selfReportService: SelfReportService,
              private testDataService: TestDataService) {
    setInterval(()=>{
      if (this.selfReportService.observations!=null)
        this.totalObservations = this.selfReportService.observations.length;
    }, 1000);
  }

  addObservation() {
    this.testDataService.createOneObservationToday();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad DebugPage');
  }

  pickTimezone() {
    let tzModal = this.modalCtrl.create(TimezoneWidgetPage, {
      date: "2017-03-07",
      time: "22:32",
      timezone: "Europe/Brussels"
    });
    tzModal.present();
    tzModal.onDidDismiss((zone:moment.MomentZone)=>{
      console.log("chosen time zone", zone);
    });
  }

  destroyDatabases() {
    this.selfReportService.destroy("topics");
    this.selfReportService.destroy("metadata");
    this.selfReportService.destroy("observations");
  }

  oneWeekAgo() {
    let now = moment();
    let date = now.subtract({days: 7});
    return date.format("YYYY-MM-DD") + " " + date.format("HH:mm");
  }

  oneHundredDaysAgo() {
    let now = moment();
    let date = now.subtract({days: 350});
    return date.format("YYYY-MM-DD") + " " + date.format("HH:mm");
  }

  createObservations():void {
    this.testDataService.createObservations();
  }

  createTopics():void {
    this.testDataService.createTopics();
  }

  syncTopics():void {
    this.selfReportService.sync("topics");
  }

  syncObservations():void {
    this.selfReportService.sync("observations");
  }

  getTopics() {
    this.selfReportService.getSortedTopics().then((topics)=>this.topics = topics);
  }

  getObservations() {
    this.selfReportService.getObservations().then((observations)=>this.observations = observations);
  }

}

import {Injectable} from "@angular/core";
import "rxjs/add/operator/map";
import {SelfReportService} from "./self-report-service";
import {NumericTopic} from "../models/NumericTopic";
import * as moment from "moment-timezone"

/*
  Generated class for the TestDataService provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class TestDataService {

  constructor(private selfReportService: SelfReportService) {
  }

  createTopics(): void {
    [["Anger", "angry", "#7EB28A"],
      ["Hunger", "spoon-knife", "#4a524a"],
      ["Anxiety", "cloud", "#4a9a88"],
      ["Migraine", "grin", "#B26C71"],
      ["Itching", "tongue", "#c2999d"],
      ["Dizzy", "sleepy", "#8B42B2"],
      ["Alcool", "alcool", "#425775"]
    ].forEach((topicData)=>{
      let numericTopic = new NumericTopic(topicData[0]);
      numericTopic.icon = topicData[1];
      numericTopic.color = topicData[2];
      this.selfReportService.create("topics", numericTopic);
    });
  }

  public static getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  createObservations(): void {
    let tzs = ["CET", "America/New_York", "US/Pacific"];
    let places = [[50.878899, 4.355607], [42.361145, -71.057083], [37.733795, -122.446747]];
    this.selfReportService.getSortedTopics().then((topics)=>{
      for (let i=0; i<100; i++) {
        // between 1 and 5 observations a day for 2 years
        let obsADay = TestDataService.getRandomInt(1, 5);
        let date = moment().subtract({days: i});
        let dateThen = date.format("YYYY-MM-DD");
        let placeIdx = TestDataService.getRandomInt(0, 2);
        let tz = tzs[placeIdx];
        let lat = places[placeIdx][0];
        let lng = places[placeIdx][1];
        for (let j=0; j<obsADay; j++) {
          let topic = topics[TestDataService.getRandomInt(0, topics.length-1)];
          let timeThen = this.pad(TestDataService.getRandomInt(0, 23))+":"+this.pad(TestDataService.getRandomInt(0, 59));
          this.selfReportService.create("observations", {
            topicId: topic._id,
            value: TestDataService.getRandomInt(0, 20),
            creationDate: dateThen,
            creationTime: timeThen,
            observationDate: dateThen,
            observationTime: timeThen,
            updateTime: moment().toISOString(),
            timezone: tz,
            latitude: lat,
            longitude: lng,
            latLngAccuracy: 20,
            comment: "Knowing is not enough; we must apply. Willing is not enough; we must do."
          });
        }
      }
    });
  }

  createOneObservationToday():void {
    let dateThen = moment().format("YYYY-MM-DD");
    let tz = moment.tz.guess();
    let timeThen = this.pad(TestDataService.getRandomInt(0, 23))+":"+this.pad(TestDataService.getRandomInt(0, 59));
    this.selfReportService.getSortedTopics().then((topics)=>{
      let topic = topics[TestDataService.getRandomInt(0, topics.length-1)];
      this.selfReportService.create("observations", {
        topicId: topic._id,
        value: TestDataService.getRandomInt(0, 20),
        creationDate: dateThen,
        creationTime: timeThen,
        observationDate: dateThen,
        observationTime: timeThen,
        updateTime: moment().toISOString(),
        timezone: tz,
        latitude: 1.290270,
        longitude: 103.851959,
        latLngAccuracy: 20,
        comment: "Knowing is not enough; we must apply. Willing is not enough; we must do."
      });
    });
  }

  pad(n:number): string {
    let s = n.toString(10);
    if (s.length==2) return s;
    return "0"+s;
  }
}

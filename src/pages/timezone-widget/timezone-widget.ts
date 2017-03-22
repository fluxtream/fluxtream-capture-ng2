import {Component} from "@angular/core";
import {NavController, NavParams, ViewController} from "ionic-angular";
import * as moment from "moment-timezone";
import {TzOption} from "../../models/TzOption";

/*
  Generated class for the TimezoneWidget page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-timezone-widget',
  templateUrl: 'timezone-widget.html'
})
export class TimezoneWidgetPage {

  date: string;
  time: string;
  timezone: string;

  private originalDate: string;
  private originalTime: string;
  private originalTimezone: string;

  options:Array<TzOption> = [];
  selectedOption: TzOption;

  constructor(public navCtrl: NavController,
              public viewCtrl: ViewController,
              public navParams: NavParams) {
    console.log('ionViewDidLoad TimezoneWidgetPage');

    this.date = this.originalDate = navParams.get("date");
    this.time = this.originalTime = navParams.get("time");
    this.timezone = this.originalTimezone = navParams.get("timezone");

  }

  optionChosen(option:TzOption) {
    if (option.subZones.length>0) {
      this.selectedOption = option;
    } else {
      this.dismiss(option.zone);
    }
  }

  zoneChosen(zone:moment.MomentZone) {
    this.dismiss(zone);
  }

  dismiss(zone: moment.MomentZone) {
    this.viewCtrl.dismiss(zone);
  }

  ionViewDidLoad() {

    moment.tz.load({
      zones : [],
      links : [],
      version : '2014e'
    });

    let tzNames = moment.tz.names();
    let time = moment();

    // compute the offset of the current time
    // first create list of gmt-based timezones and sort them by offset

    this.options.push(new TzOption(0, moment.tz.zone("GMT")));

    zoneNames:for (let tzName of tzNames) {
      let zone = moment.tz.zone(tzName);
      let offset = zone.offset(time.unix());
      // only including timezones names that have a human significance,
      // e.g. cities, regions that have a significant population
      if (offset != 0 && zone.name.startsWith("Etc/"))
        this.options.push(new TzOption(offset, zone));
      else if (offset % 60 != 0
        && zone.hasOwnProperty("population")
        && (zone as any).population > 100000)
      {
        for (let option of this.options)
          if (option.offset===offset) {
            continue zoneNames;
          }
        let tzOption = new TzOption(offset, null);
        tzOption.addSubZone(zone);
        this.options.push(tzOption);
      }
    }

    this.options.sort((t1: TzOption, t2: TzOption) => {
      return t1.offset - t2.offset;
    });

    for (let option of this.options) {
      let optionOffset = option.offset;
      for (let tzName of tzNames) {
        let zone = moment.tz.zone(tzName);
        let offset = zone.offset(time.unix());
        if (offset === optionOffset && zone.hasOwnProperty("population")) {
          option.addSubZone(zone);
        }
      }
    }

    for (let option of this.options) {
      let cities = "";
      for (let zone of option.subZones) {
        cities += " " + zone.name;
        if (zone.hasOwnProperty("population"))
          cities += "/"+(<any>zone).population;
      }
    }

  }

}

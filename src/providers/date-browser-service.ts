import {Injectable} from "@angular/core";
import "rxjs/add/operator/map";
import {UserPrefsService, UserPrefs, AppDefaults} from "./user-prefs-service";
import * as moment from "moment";
import {NavController} from "ionic-angular";
import {TopicsPage} from "../pages/topics/topics";

/*
  Generated class for the DateBrowserService provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class DateBrowserService {

  public static readonly TIMEUNIT_DAY = "day";
  public static readonly TIMEUNIT_WEEK = "week";
  public static readonly TIMEUNIT_MONTH = "month";

  timeUnit: string = DateBrowserService.TIMEUNIT_DAY;

  date: string;

  fromDate: moment.Moment;
  toDate: moment.Moment;

  fromDateStr: string;
  toDateStr: string;

  currentDate: string;
  currentWeekStartDate: moment.Moment;
  currentWeekEndDate: moment.Moment;
  currentMonthStartDate: moment.Moment;
  currentMonthEndDate: moment.Moment;

  constructor(private userPrefsService: UserPrefsService) {
    console.log('Hello DateBrowserService Provider');
    this.timeUnit = this.userPrefsService.getValueForUser(UserPrefs.TIME_UNIT,
      AppDefaults.DEFAULT_TIMEUNIT);
    this.initTimeBoundaries();
  }

  setTimeUnit(tu: string) {
    this.timeUnit = tu;
    this.initTimeBoundaries();
    switch(tu) {
      case DateBrowserService.TIMEUNIT_DAY:
        if (this.fromDate)
          this.date = this.fromDate.format("YYYY-MM-DD");
        break;
      case DateBrowserService.TIMEUNIT_WEEK:
        if (this.fromDate) {
          this.fromDate.weekday(0);
          this.toDate = moment(this.fromDate);
          this.toDate.add(6, "days");
        }
        break;
      case DateBrowserService.TIMEUNIT_MONTH:
        if (this.fromDate) {
          this.fromDate = moment(this.fromDate).date(1).hour(0).minute(0).second(0);
          this.toDate = moment(this.fromDate).endOf("month").hour(0).minute(0).second(0);
        }
        break;
    }
    this.timeBoundariesToStrFormat();
    this.userPrefsService.setValueForUser(UserPrefs.TIME_UNIT, tu);
  }

  currentTimeBoundaries() {
    this.currentDate = moment().format("YYYY-MM-DD");
    this.currentWeekStartDate = moment().weekday(0).hour(0).minute(0).second(0);
    this.currentWeekEndDate = moment(this.currentWeekStartDate);
    this.currentWeekEndDate.add(6, 'days');
    this.currentMonthStartDate = moment().date(1).hour(0).minute(0).second(0);
    this.currentMonthEndDate = moment(this.currentMonthStartDate).endOf("month").hour(0).minute(0).second(0);
  }

  initTimeBoundaries() {
    this.currentTimeBoundaries();
    switch (this.timeUnit) {
      case DateBrowserService.TIMEUNIT_DAY:
        if (!this.date)
          this.date = this.currentDate;
        break;
      case DateBrowserService.TIMEUNIT_WEEK:
        if (this.fromDate==null) {
          this.fromDate = this.currentWeekStartDate;
          this.toDate = this.currentWeekEndDate;
        }
        break;
      case DateBrowserService.TIMEUNIT_MONTH:
        if (this.fromDate==null) {
          this.fromDate = this.currentMonthStartDate;
          this.toDate = this.currentMonthEndDate;
        }
        break;
    }
    this.timeBoundariesToStrFormat();
  }

  reset() {
    this.date = this.fromDate = this.toDate = null;
    this.initTimeBoundaries();
  }

  next():boolean {
    this.initTimeBoundaries();
    switch (this.timeUnit) {
      case DateBrowserService.TIMEUNIT_DAY:
        let today = moment().format("YYYY-MM-DD");
        let currentDate = moment(this.date);
        if (currentDate.format("YYYY-MM-DD")===today) return false;
        else {
          currentDate.add(1, 'days');
          this.date = currentDate.format("YYYY-MM-DD");
          return !(this.date===today);
        }
      case DateBrowserService.TIMEUNIT_WEEK:
        this.fromDate.add(7, 'days');
        this.toDate.add(7, 'days');
        this.timeBoundariesToStrFormat();
        return true;
      case DateBrowserService.TIMEUNIT_MONTH:
        this.fromDate.add(1, 'months');
        this.toDate = moment(this.fromDate).endOf("month").hour(0).minute(0).second(0);
        this.timeBoundariesToStrFormat();
        return true;
    }
  }

  previous() {
    this.initTimeBoundaries();
    switch(this.timeUnit) {
      case DateBrowserService.TIMEUNIT_DAY:
        let currentDate = moment(this.date);
        currentDate.subtract(1, 'days');
        this.date = currentDate.format("YYYY-MM-DD");
        break;
      case DateBrowserService.TIMEUNIT_WEEK:
        this.fromDate.subtract(7, 'days');
        this.toDate.subtract(7, 'days');
        break;
      case DateBrowserService.TIMEUNIT_MONTH:
        this.fromDate.subtract(1, 'months');
        this.toDate = moment(this.fromDate).endOf("month").hour(0).minute(0).second(0);
        break;
    }
    this.timeBoundariesToStrFormat();
  }

  isInTimeRange(observation: any) {
    this.initTimeBoundaries();
    switch(this.timeUnit) {
      case DateBrowserService.TIMEUNIT_DAY:
        return observation.observationDate===this.date;
      case DateBrowserService.TIMEUNIT_WEEK:
      case DateBrowserService.TIMEUNIT_MONTH:
        return observation.observationDate >= this.fromDateStr
          && observation.observationDate <= this.toDateStr;
      default:
        console.log("No such time unit", this.timeUnit);
    }
  }

  private timeBoundariesToStrFormat() {
    if (this.fromDate) {
      this.fromDateStr = this.fromDate.format("YYYY-MM-DD");
      this.toDateStr = this.toDate.format("YYYY-MM-DD");
    }
  }

  log(s) {
    let message = s + ": ";
    if (this.date) message += "date=" + this.date;
    if (this.fromDate) message += " fromDate=" + this.fromDate.format("YYYY-MM-DD");
    if (this.toDate) message += " toDate=" + this.toDate.format("YYYY-MM-DD");
    console.log(message)
  }
}

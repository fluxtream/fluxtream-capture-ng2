import {Component, ViewChild} from "@angular/core";
import {NavController, MenuController, VirtualScroll} from "ionic-angular";
import {
  SelfReportService,
  PersistenceEvent, PersistenceEventType, SyncStatus
} from "../../providers/self-report-service";
import {EditObservationPage} from "../edit-observation/edit-observation";
import * as moment from "moment";
import {FluxtreamCaptureApp} from "../../app/app.component";
import {UserPrefsService, UserPrefs} from "../../providers/user-prefs-service";
import {DateBrowserService} from "../../providers/date-browser-service";
import {Logger} from "../../utils";
import {TopicsPage} from "../topics/topics";

/*
  Generated class for the History page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-history',
  templateUrl: 'history.html'
})
export class HistoryPage {

  private logger;

  timeRangeLabel: string = "Today";
  currentTimeZone: moment.MomentZone;

  @ViewChild(VirtualScroll)
  virtualScroll: VirtualScroll;

  mode: string = FluxtreamCaptureApp.HISTORY_MODE_LOG;
  filter: Array<string> = [FluxtreamCaptureApp.TOPICS_FILTER_ALL];
  observations: Array<any>;

  isCurrentTimeRange: boolean = true;
  private chartOptions: any;

  SyncStatus = SyncStatus;
  syncStatus: SyncStatus = SyncStatus.STATUS_IDLE;

  constructor(public navCtrl: NavController,
              private menuCtrl: MenuController,
              private userPrefsService: UserPrefsService,
              private selfReportService: SelfReportService,
              private dateBrowserService: DateBrowserService) {
    this.logger = Logger(true, HistoryPage.name);
    this.logger.debug("constructing history page");
    this.selfReportService.events.subscribe((event:PersistenceEvent)=>{
      if (event.type===PersistenceEventType.INITIALIZED.valueOf()) {
        this.selfReportService.getSortedTopics().then(()=>{
          this.updateObservations().then(()=>this.setTimeRangeLabel());
        });
      } else if (event.type==PersistenceEventType.SYNC_STATUS_CHANGED.valueOf()) {
        if (event.info.dbName==="observations")
          this.syncStatus = event.info.status;
      }
    });
  }

  ionViewDidLoad() {
    this.logger.debug("history page did load");
    this.filter = JSON.parse(this.userPrefsService.getValueForUser(UserPrefs.TOPICS_FILTER_KEY,
      JSON.stringify([FluxtreamCaptureApp.TOPICS_FILTER_ALL])));
    this.mode = this.userPrefsService.getValueForUser(UserPrefs.HISTORY_MODE,
      FluxtreamCaptureApp.HISTORY_MODE_LOG);
    this.userPrefsService.prefChanges.subscribe((key)=>{
      if (key===UserPrefs.TOPICS_FILTER_KEY) {
        this.logger.log("topics filter changed, hence we need to update the observations");
        // this.logger.log("topics filter changed, thus updating observations");
        this.filter = JSON.parse(this.userPrefsService.getValueForUser(UserPrefs.TOPICS_FILTER_KEY,
          JSON.stringify([FluxtreamCaptureApp.TOPICS_FILTER_ALL])));
        this.updateObservations().then(()=>{
          if (this.mode===FluxtreamCaptureApp.HISTORY_MODE_CHART) {
            this.chart();
          }
        });
      }
    });
    this.selfReportService.observationsEvents.subscribe((change)=>{
      this.logger.debug("there was an observations event", change);
      if (this.dateBrowserService.isInTimeRange(change.doc)) {
        this.logger.debug("changed observation is in time range, let's update");
        setTimeout(()=>this.updateObservations(), 500);
      }
    });
    this.updateObservations().then(()=>this.setTimeRangeLabel());
  }

  get timeUnit() {
    return this.dateBrowserService.timeUnit;
  }

  get topics() {
    return SelfReportService.sortedTopics;
  }

  setTimeUnit(tu:string) {
    if (this.timeUnit===tu)
      this.dateBrowserService.reset();
    else
      this.dateBrowserService.setTimeUnit(tu);
    this.updateObservations().then(()=>{
      this.setTimeRangeLabel();
    });
  }

  prev() {
    setTimeout(()=>{
      this.logger.log("previous");
      this.dateBrowserService.previous();
      this.updateObservations().then(()=>this.setTimeRangeLabel());
    }, 100);
  }

  next() {
    setTimeout(()=>{
      this.logger.log("next");
      this.dateBrowserService.next();
      this.updateObservations().then(()=>this.setTimeRangeLabel());
    }, 100);
  }

  goHome() {
    this.navCtrl.setRoot(TopicsPage);
  }

  getMoment(observation) {
    // return the Moment.moment of this observation and cache it
    if (observation.moment)
      return observation.moment;
    observation.moment = moment.tz(observation.observationDate + " " + observation.observationTime, observation.timezone);
    return observation.moment;
  }

  toggleTopicsFilter() {
    this.menuCtrl.toggle("topicsFilter");
  }

  getTopic(topicId) {
    for (let topic of SelfReportService.sortedTopics) {
      if (topic._id===topicId)
        return topic;
    }
    return null;
  }

  chart() {
    this.mode = FluxtreamCaptureApp.HISTORY_MODE_CHART;
    let series = [];
    let selectedTopics = [];
    if (this.filter[0]!=FluxtreamCaptureApp.TOPICS_FILTER_ALL)
      selectedTopics = this.filter;
    else
      for (let topic of this.topics)
        selectedTopics.push(topic._id);
    this.logger.log("OK, selectedTopics", selectedTopics);
    for (let topicId of selectedTopics) {
      let topic = this.getTopic(topicId);
      if (!topic) continue; // silently ignore null topics
      let seriesData: any = {};
      seriesData.name = topic.name;
      let observationData = [];
      for (let observation of this.observations) {
        if (observation.topicId==topicId)
        observationData.push([this.getMoment(observation).unix()*1000,observation.value]);
      }
      seriesData.data = observationData;
      series.push(seriesData);
      seriesData.color = topic.color;
    }
    setTimeout(()=>{
      this.chartOptions = {
        type: 'spline',
        chart: {
          animation: false
        },
        title : { text : "" },
        xAxis: {
          type: 'datetime',
          dateTimeLabelFormats: { // don't display the dummy year
            month: '%e. %b',
            year: '%b'
          },
          title: {
            text: 'Date'
          }
        },
        credits: {
          enabled: false
        },
        yAxis: {
          title: {
            text: 'Values'
          },
          min: 0
        },
        events: {
          load: function () {
            var self = this;
            setTimeout (function () {
              self.reflow ();
            }, 100)
          }
        },
        plotOptions: {
          spline: {
            marker: {
              enabled: true
            },
            animation: false
          },
          line: {
            animation: false
          }
        },
        series: series
      };
    }, 100);
    this.userPrefsService.setValueForUser(UserPrefs.HISTORY_MODE, FluxtreamCaptureApp.HISTORY_MODE_CHART);
  }

  log() {
    this.mode = FluxtreamCaptureApp.HISTORY_MODE_LOG;
    this.userPrefsService.setValueForUser(UserPrefs.HISTORY_MODE, FluxtreamCaptureApp.HISTORY_MODE_LOG);
    this.virtualScroll.writeUpdate();
  }

  updateObservations():Promise<any> {
    // cache the currentTimeZone just before list refresh
    this.currentTimeZone = moment.tz.zone(moment.tz.guess());
    return new Promise((resolve, reject)=>{
      // this.logger.log("updating observations", this.filter);
      this.selfReportService.filterObservations(this.filter).then(filteredObservations=>{
        // this.logger.log("got filteredObservations", filteredObservations);
        this.observations = filteredObservations;
        resolve();
      }).catch((error)=>{
        this.logger.log("There was error while updating the observations", error);
        reject(error)
      });
    });
  }

  weekend(observation) {
    if (observation.we)
      return;
    let day = observation.moment.format("dddd");
    observation.we = "Saturday Sunday".indexOf(day)!=-1;
  }

  deleteObservation(observation):void {
    this.selfReportService.remove("observations", observation);
  }

  observationDetail(observation) {
    this.navCtrl.push(EditObservationPage, {
      topicId: observation.topicId,
      observation: observation
    })
  }

  observationTime(observation) {
    let observationZone = moment.tz.zone(observation.timezone);
    let localZone = this.currentTimeZone;
    let timestamp = observation.moment.unix();
    let ot = observation.moment.format("h:mm A");
    if (localZone.offset(timestamp)!=observationZone.offset(timestamp))
      ot += " (" + observationZone.abbr(timestamp) + ")";
    return ot;
  }

  trackBy(index, item) {
    return item._id;
  }

  setDayHeader(record, recordIndex, records) {
    if (record.timeUnit===DateBrowserService.TIMEUNIT_DAY)
      return null;
    if (recordIndex===0)
      return moment(record.observationDate).format("dddd Do MMM");
    else {
      let thatDay = moment(record.observationDate).format("dddd MMM Do");
      let previousDay = moment(records[recordIndex-1].observationDate).format("dddd MMM Do");
      if (thatDay!=previousDay)
        return thatDay;
    }
    return null
  }

  private setTimeRangeLabel() {
    // make sure time boundaries are set
    this.dateBrowserService.initTimeBoundaries();
    switch (this.timeUnit) {
      case DateBrowserService.TIMEUNIT_DAY:
        this.timeRangeLabel = moment(this.dateBrowserService.date).calendar(null, {
          sameDay: '[Today]',
          lastDay: '[Yesterday]',
          lastWeek: 'dddd',
          sameElse: 'dddd, MMM Do YYYY'
        });
        break;
      case DateBrowserService.TIMEUNIT_WEEK:
        this.timeRangeLabel = this.dateBrowserService.fromDate.format("MMM Do")
          + " - " + this.dateBrowserService.toDate.format("MMM Do YYYY");
        break;
      case DateBrowserService.TIMEUNIT_MONTH:
        this.timeRangeLabel = this.dateBrowserService.fromDate.format("MMMM YYYY");
    }
    switch (this.timeUnit) {
      case DateBrowserService.TIMEUNIT_DAY:
        this.isCurrentTimeRange = this.dateBrowserService.date===this.dateBrowserService.currentDate;
        break;
      case DateBrowserService.TIMEUNIT_WEEK:
        this.isCurrentTimeRange =
          this.sameDate(this.dateBrowserService.fromDate, this.dateBrowserService.currentWeekStartDate)
          && this.sameDate(this.dateBrowserService.toDate, this.dateBrowserService.currentWeekEndDate);
        break;
      case DateBrowserService.TIMEUNIT_MONTH:
        this.isCurrentTimeRange =
          this.sameDate(this.dateBrowserService.fromDate, this.dateBrowserService.currentMonthStartDate)
          && this.sameDate(this.dateBrowserService.toDate, this.dateBrowserService.currentMonthEndDate);
        break;
    }
    if (this.mode==FluxtreamCaptureApp.HISTORY_MODE_CHART)
      this.chart();
  }

  private sameDate(m1:moment.Moment, m2:moment.Moment):boolean {
    return m1.format("YYYY-MM-DD")===m2.format("YYYY-MM-DD");
  }
}

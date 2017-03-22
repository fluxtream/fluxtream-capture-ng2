/**
 * Created by candide on 08/03/2017.
 */
import {DateBrowserService} from "./date-browser-service";
import {UserPrefsService} from "./user-prefs-service";
import {NativeService} from "./native-service";
import * as moment from "moment";

let dateBrowserService: DateBrowserService = null;
let userPrefsService: UserPrefsService = null;

describe('Date Browser Service', () => {

  beforeEach(() => {
    userPrefsService =
      new UserPrefsService(new NativeService(), null); // platform can be null as it is actually not used :(
    dateBrowserService = new DateBrowserService(userPrefsService);
  });

  it('day range should filter the right observations', () => {

    let observation: any, inTimeRange: boolean;
    let today = moment().format("YYYY-MM-DD");

    observation = {
      observationDate: today
    };
    inTimeRange = dateBrowserService.isInTimeRange(observation);
    expect(inTimeRange).toBeTruthy("when the app just started, an observation made today should be in range" + (dateBrowserService.date + " vs " + observation.observationDate));

    observation = {
      observationDate: "1972-03-15"
    };
    inTimeRange = dateBrowserService.isInTimeRange(observation);
    expect(inTimeRange).toBeFalsy("when the app just started, an observation made a long time ago should not be in range");

    expect(dateBrowserService.date).toBe(today, "when the app just started, and after isInTimeRange has been invoked, the date browser's date should be set to today");

    let yesterday = moment().subtract(1, "days").format("YYYY-MM-DD");
    dateBrowserService.previous();
    expect(dateBrowserService.date).toBe(yesterday, "after hitting the 'previous'/left arrow button, the date browser's date should be set back one day");

    let isNextEnabled = dateBrowserService.next();
    expect(dateBrowserService.date).toBe(today, "hitting 'next'/right button should reset the date browser's date to today");
    expect(isNextEnabled).toBeFalsy("'next' button should be disabled");

    isNextEnabled = dateBrowserService.next();
    expect(dateBrowserService.date).toBe(today, "hitting 'next'/right button again shouldn't move the date browser's date to the next day");
    expect(isNextEnabled).toBeFalsy("'next' button should still be disabled.");

  });

  it ('make sure momentjs behaves as expected', () => {
    let wednesday = moment("2017-03-08");
    let firstDayOfTheWeek = wednesday.weekday(0).hour(0).minute(0).second(0);
    console.log("firstDayOfTheWeek", firstDayOfTheWeek.format("YYYY-MM-DD"));
    let beforeNow:boolean = firstDayOfTheWeek.isBefore(wednesday);

    let fromDate = moment(wednesday.date(0).hour(0).minute(0).second(0));
    // let toDate = moment(fromDate).add(fromDate.daysInMonth(), "days");
    let toDate = moment("2017-03-08").endOf("month");

    expect(toDate.format("YYYY-MM-DD")).toBe("2017-03-31");

    let fromDate2 = moment().date(1).hour(0).minute(0).second(0);
    let toDate2 = moment(this.fromDate2).endOf("month").hour(0).minute(0).second(0);

    expect(fromDate2.format("YYYY-MM-DD")).toBe("2017-03-01");
    expect(toDate2.format("YYYY-MM-DD")).toBe("2017-03-31");

  });

  it('week browsing should behave as expected', () => {
     dateBrowserService.setTimeUnit(DateBrowserService.TIMEUNIT_WEEK);

    dateBrowserService.fromDate = moment("2017-03-05").hour(0).minute(0).second(0);
    dateBrowserService.toDate = moment("2017-03-12").hour(23).minute(59).second(59);
    dateBrowserService.previous();
    expect(dateBrowserService.fromDate.format("YYYY-MM-DD")).toBe("2017-02-26");
    expect(dateBrowserService.toDate.format("YYYY-MM-DD")).toBe("2017-03-05");

    dateBrowserService.previous();
    expect(dateBrowserService.fromDate.format("YYYY-MM-DD")).toBe("2017-02-19");
    expect(dateBrowserService.toDate.format("YYYY-MM-DD")).toBe("2017-02-26");

    dateBrowserService.previous();
    expect(dateBrowserService.fromDate.format("YYYY-MM-DD")).toBe("2017-02-12");
    expect(dateBrowserService.toDate.format("YYYY-MM-DD")).toBe("2017-02-19");

    dateBrowserService.previous();
    expect(dateBrowserService.fromDate.format("YYYY-MM-DD")).toBe("2017-02-05");
    expect(dateBrowserService.toDate.format("YYYY-MM-DD")).toBe("2017-02-12");

    dateBrowserService.previous();
    expect(dateBrowserService.fromDate.format("YYYY-MM-DD")).toBe("2017-01-29");
    expect(dateBrowserService.toDate.format("YYYY-MM-DD")).toBe("2017-02-05");

    dateBrowserService.previous();
    expect(dateBrowserService.fromDate.format("YYYY-MM-DD")).toBe("2017-01-22");
    expect(dateBrowserService.toDate.format("YYYY-MM-DD")).toBe("2017-01-29");

    dateBrowserService.previous();
    expect(dateBrowserService.fromDate.format("YYYY-MM-DD")).toBe("2017-01-15");
    expect(dateBrowserService.toDate.format("YYYY-MM-DD")).toBe("2017-01-22");

    dateBrowserService.previous();
    expect(dateBrowserService.fromDate.format("YYYY-MM-DD")).toBe("2017-01-08");
    expect(dateBrowserService.toDate.format("YYYY-MM-DD")).toBe("2017-01-15");

    dateBrowserService.previous();
    expect(dateBrowserService.fromDate.format("YYYY-MM-DD")).toBe("2017-01-01");
    expect(dateBrowserService.toDate.format("YYYY-MM-DD")).toBe("2017-01-08");

    dateBrowserService.previous();
    expect(dateBrowserService.fromDate.format("YYYY-MM-DD")).toBe("2016-12-25");
    expect(dateBrowserService.toDate.format("YYYY-MM-DD")).toBe("2017-01-01");

  });

  // it('week range should filter the right observations', () => {
  //   let observation: any, inTimeRange: boolean;
  //   let today = moment().format("YYYY-MM-DD");
  //
  //   observation = {
  //     observationDate: today
  //   };
  //
  //   dateBrowserService.setTimeUnit(DateBrowserService.TIMEUNIT_WEEK);
  //
  //   inTimeRange = dateBrowserService.isInTimeRange(observation);
  //   expect(inTimeRange).toBeTruthy("(week view) when the app just started, an observation made today should be in range" + (dateBrowserService.date + " vs " + observation.observationDate));
  //
  //   observation = {
  //     observationDate: "1972-03-15"
  //   };
  //   inTimeRange = dateBrowserService.isInTimeRange(observation);
  //   expect(inTimeRange).toBeFalsy("(week view) when the app just started, an observation made a long time ago should not be in range");
  //
  //   let oneWeekAgo = moment().subtract(1, 'weeks');
  //
  //   observation = {
  //     observationDate: oneWeekAgo.format("YYYY-MM-DD")
  //   };
  //   inTimeRange = dateBrowserService.isInTimeRange(observation);
  //   expect(inTimeRange).toBeFalsy("(week view) when the app just started, an observation made one week ago should not be in range");
  //
  //   dateBrowserService.previousTimeUnit();
  //   inTimeRange = dateBrowserService.isInTimeRange(observation);
  //   expect(inTimeRange).toBeTruthy();
  //
  //   let isNextEnabled = dateBrowserService.nextTimeUnit();
  //   expect(isNextEnabled).toBeFalsy();
  //
  // });


});

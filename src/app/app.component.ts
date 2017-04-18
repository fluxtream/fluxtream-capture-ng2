import {Component, ViewChild} from "@angular/core";
import {Nav, MenuController} from "ionic-angular";
import {LoginPage} from "../pages/login/login";
import {SettingsPage} from "../pages/settings/settings";
import {DebugPage} from "../pages/debug/debug";
import {UserPrefsService, UserPrefs} from "../providers/user-prefs-service";
import {SelfReportService} from "../providers/self-report-service";
import {Logger} from "../utils";
import {LoginService, LoginEvents} from "../providers/login-service";
import {TopicsPage} from "../pages/topics/topics";
import {PhotoUploadPage} from "../pages/photo-upload/photo-upload";
import {HeartRatePage} from "../pages/heart-rate/heart-rate";

@Component({
  templateUrl: 'app.html'
})
export class FluxtreamCaptureApp {

  rootPage: any = LoginPage;
  private logger;
  fullname: string;

  static readonly TOPICS_FILTER_ALL: string = "all";
  static readonly HISTORY_MODE_LOG: string = "log";
  static readonly HISTORY_MODE_CHART: string = "chart";

  @ViewChild(Nav) nav;

  selectionState = 'noneSelected';
  checkedTopics = {};

  constructor(private menu: MenuController,
              private loginService: LoginService,
              private selfReportService: SelfReportService,
              private userPrefs: UserPrefsService) {
    this.logger = Logger(false, FluxtreamCaptureApp.name);
    this.selfReportService.sortedTopicsEvents.subscribe((event)=>{
      this.logger.log("sorted topics, thus updating topics menu");
      this.updateTopicsMenu();
    });
    let loggedIn = this.userPrefs.getGlobal("login.userId")!=null;
    if (loggedIn)
      this.rootPage = TopicsPage;
    this.loginService.events.subscribe((event)=>{
      if (event===LoginEvents.SIGNED_IN)
        this.fullname = this.loginService.guestModel.fullname;
    })
  }

  signOut() {
    this.loginService.signOut().then(()=>{
      this.nav.setRoot(LoginPage);
    });
  }

  allTopicsChecked(yesOrNo) {
    if (!this.topics) return;
    for (let topic of this.topics) {
      this.checkedTopics[topic._id]=yesOrNo;
    }
    this.selectionState = yesOrNo?'allSelected':'noneSelected';
    this.logger.log("allTopicsChecked", yesOrNo);
    this.userPrefs.setValueForUser(UserPrefs.TOPICS_FILTER_KEY,
      yesOrNo?JSON.stringify([FluxtreamCaptureApp.TOPICS_FILTER_ALL]):"[]");
  }

  private updateTopicsMenu() {
    let userTopics = JSON.parse(this.userPrefs.getValueForUser(UserPrefs.TOPICS_FILTER_KEY,
      JSON.stringify([FluxtreamCaptureApp.TOPICS_FILTER_ALL])));
    sorted:for(let sTopic of this.topics) {
      if (userTopics.length==1&&userTopics[0]===FluxtreamCaptureApp.TOPICS_FILTER_ALL) {
        this.checkedTopics[sTopic._id] = true;
        continue sorted;
      } else
        for (let userTopicId of userTopics) {
          if (userTopicId===sTopic._id) {
            this.checkedTopics[sTopic._id]=true;
            continue sorted;
          }
        }
      this.checkedTopics[sTopic._id]=false;
    }
    this.logger.log("updateTopicsMenu", userTopics, this.topics, this.checkedTopics);
    // update selectionState
    this.getSelection();
  }

  getSelection():Array<string> {
    let topicIds = [];
    for (let topicId in this.checkedTopics) {
      if (this.checkedTopics[topicId])
        topicIds.push(topicId);
    }
    if (topicIds.length==0)
      this.selectionState = 'noneSelected';
    else if (topicIds.length==this.topics.length)
      this.selectionState = 'allSelected';
    else
      this.selectionState = 'someSelected';
    this.logger.log("getSelection", topicIds, this.selectionState);
    return topicIds;
  }

  topicsFilterEdited() {
    this.logger.log("topicsFilterEdited, checkedTopics", this.checkedTopics);
    let topicIds = this.getSelection();
    if (this.selectionState=='allSelected')
      this.userPrefs.setValueForUser(UserPrefs.TOPICS_FILTER_KEY,
        JSON.stringify([FluxtreamCaptureApp.TOPICS_FILTER_ALL]));
    else
      this.userPrefs.setValueForUser(UserPrefs.TOPICS_FILTER_KEY,
        JSON.stringify(topicIds));
  }

  get topics() {
    return SelfReportService.sortedTopics;
  }

  openPage(pageName:string):void {
    switch(pageName) {
      // case 'settings':
      //   this.nav.push(SettingsPage);
      //   this.menu.close();
      //   break;
      case 'photo-upload':
        this.nav.push(PhotoUploadPage);
        this.menu.close();
        break;
      case 'heart-rate':
        this.nav.push(HeartRatePage);
        this.menu.close();
        break;
      case 'debug':
        this.nav.push(DebugPage);
        this.menu.close();
        break;
    }
  }

}

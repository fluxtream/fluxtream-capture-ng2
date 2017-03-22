import {Component} from "@angular/core";
import {
  MenuController,
  ModalController,
  NavController,
  ToastController,
  ActionSheetController
} from "ionic-angular";
import {EditTopicPage} from "../edit-topic/edit-topic";
import {
  SelfReportService,
  PersistenceEvent, PersistenceEventType, SyncStatus
} from "../../providers/self-report-service";
import {EditObservationPage} from "../edit-observation/edit-observation";
import {HistoryPage} from "../history/history";
import {FluxtreamCaptureApp} from "../../app/app.component";
import {UserPrefsService, UserPrefs} from "../../providers/user-prefs-service";
import {Logger} from "../../utils";

/*
  Generated class for the Topics page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/

@Component({
  selector: 'page-topics',
  templateUrl: 'topics.html'
})
export class TopicsPage {

  private logger;

  historyMode: string;
  reordering: boolean;
  topics: Array<any>;
  SyncStatus = SyncStatus;
  syncStatus: SyncStatus = SyncStatus.STATUS_ACTIVE;

  constructor(private menuCtrl: MenuController,
              private navCtrl: NavController,
              private modalCtrl: ModalController,
              private selfReportService: SelfReportService,
              private userPrefs: UserPrefsService,
              private toastCtrl: ToastController,
              private actionSheetCtrl: ActionSheetController) {
    this.logger = Logger(true, TopicsPage.name);
    this.logger.debug("TopicsPage got constructed");
  }

  ionViewDidLoad() {
    this.logger.debug("ionview did load");
    this.historyMode = this.userPrefs.getValueForUser(UserPrefs.HISTORY_MODE,
      FluxtreamCaptureApp.HISTORY_MODE_LOG);
    this.userPrefs.prefChanges.subscribe((key)=>{
      this.logger.log("pref changed", key);
      if (key===UserPrefs.HISTORY_MODE) {
        this.historyMode = this.userPrefs.getValueForUser(UserPrefs.HISTORY_MODE,
          FluxtreamCaptureApp.HISTORY_MODE_LOG);
        this.logger.debug("historyMode just changed", this.historyMode);
      }
    });
    if (this.selfReportService.topics==null) {
      this.selfReportService.events.subscribe((event:PersistenceEvent)=>{
        if (event.type==PersistenceEventType.INITIALIZED.valueOf()) {
          this.load();
        } else if (event.type==PersistenceEventType.SYNC_STATUS_CHANGED.valueOf()) {
          if (event.info.dbName==="topics")
            this.syncStatus = event.info.status;
        }
      });
    } else
      this.load();
  }

  load() {
    this.selfReportService.getSortedTopics();
    this.selfReportService.topicsEvents.subscribe((event)=>{
      this.reloadTopics();
    });
    this.selfReportService.metadataEvents.subscribe((md)=>{
      this.reloadTopics();
    });
    this.reloadTopics();
  }

  reloadTopics() {
    this.selfReportService.getSortedTopics().then((sortedTopics)=>{
        this.topics = sortedTopics;
        this.syncStatus = SyncStatus.STATUS_IDLE;
      }
    );
  }

  updateTopic(topic, slidingItem) {
    this.navCtrl.push(EditTopicPage, {
      topic: topic
    }).then(slidingItem.close());
  }

  reOrder(indexes:any) {
    let element = this.topics[indexes.from];
    this.topics.splice(indexes.from, 1);
    this.topics.splice(indexes.to, 0, element);
    this.selfReportService.topics = this.topics;
    this.selfReportService.updateTopicsMetadata();
  }

  newObservation(topic) {
    this.navCtrl.push(EditObservationPage, {
      topicId: topic._id
    });
  }

  deleteTopic(topic, slidingItem) {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Are you sure? This will also remote all observations for this topic',
      buttons: [
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.selfReportService.remove(SelfReportService.TOPICS_DB, topic).then(()=>{
              let toast = this.toastCtrl.create({
                message: "Topic Deleted",
                duration: 3000,
                position: 'top'
              });
              toast.present().then(()=>{
                this.reloadTopics();
              });
            });
          }
        },{
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            slidingItem.close();
          }
        }
      ]
    });
    actionSheet.present();
  }

  toggleReordering(fab) {
    this.reordering = !this.reordering;
    if (!this.reordering)
      fab.close();
  }

  addTopic(fab) {
    this.modalCtrl.create(EditTopicPage).present();
    fab.close();
    // this.navCtrl.push(NewTopicPage);
  }

  history() {
    this.navCtrl.push(HistoryPage);
  }

  toggleMenu() {
    this.menuCtrl.toggle("main");
  }

}

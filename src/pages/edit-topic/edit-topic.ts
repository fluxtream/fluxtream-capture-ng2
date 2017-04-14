import {Component} from "@angular/core";
import {SelfReportService} from "../../providers/self-report-service";
import {
  ViewController, ModalController, AlertController,
  NavParams, NavController, ToastController, ActionSheetController
} from "ionic-angular";
import {IconChooserPage} from "../icon-chooser/icon-chooser";
import {RangeTopic} from "../../models/RangeTopic";
import {BaseTopic} from "../../models/BaseTopic";
import {NumericTopic} from "../../models/NumericTopic";

/*
  Generated class for the NewTopic page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/

@Component({
  selector: 'page-edit-topic',
  templateUrl: 'edit-topic.html'
})
export class EditTopicPage {

  topicName: string;
  topicType: string = "numeric";
  rangeStart: number;
  rangeEnd: number;
  rangeDefault: number;
  rangeStep: number = 1;
  errors: Array<string> = [];
  isValid: boolean = false;
  icon: string = "pencil2";
  color: string = "#000000";

  originalTopic: any;

  constructor(private selfReportService: SelfReportService,
              private viewCtrl: ViewController,
              private modalCtrl: ModalController,
              private alertCtrl: AlertController,
              private navCtrl: NavController,
              public navParams: NavParams,
              private toastCtrl: ToastController,
              private actionSheetCtrl: ActionSheetController) {
    let topic = navParams.get("topic");
    if (topic) {
      this.topicName = topic.name;
      this.topicType = topic.type;
      if (topic.type==="range") {
        this.rangeStart = topic.rangeStart;
        this.rangeEnd = topic.rangeEnd;
        this.rangeDefault = topic.rangeDefault;
      }
      if (topic.icon) this.icon = topic.icon;
      if (topic.color) this.color = topic.color;
      this.originalTopic = topic;
      this.isValid = true;
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad NewTopicPage');
  }

  setIcon() {
    let modal = this.modalCtrl.create(IconChooserPage);
    modal.onDidDismiss((data)=>{
      console.log("received icon:", data);
      if (data)
        this.icon = data.icon;
    });
    modal.present();
  }

  delete() {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Are you sure? This will also remote all observations for this topic',
      buttons: [
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.selfReportService.remove(SelfReportService.TOPICS_DB, this.originalTopic).then(()=>{
              let toast = this.toastCtrl.create({
                message: "Topic Deleted",
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

  dismiss() {
    this.viewCtrl.dismiss();
  }

  save() {
    console.log("saving topic...");
    let topic;
    if (this.topicType==="range") {
      topic = new RangeTopic(this.topicName, this.rangeStart, this.rangeEnd, this.rangeDefault);
      topic.step = this.rangeStep;
      console.log("saving range topic");
    } else if (this.topicType==="none") {
      topic = new BaseTopic(this.topicName);
    } else {
      topic = new NumericTopic(this.topicName);
    }
    console.log("OK topic is (logging topic and selfReportService)", topic, this.selfReportService);
    topic.icon = this.icon;
    topic.color = this.color;
    if (this.originalTopic) {
      topic._id = this.originalTopic._id;
      topic._rev = this.originalTopic._rev;
      this.selfReportService.update("topics", topic);
      this.navCtrl.pop();
    } else {
      this.selfReportService.create(SelfReportService.TOPICS_DB, topic).then(()=>{
        this.viewCtrl.dismiss();
      }).catch((error)=>{
        this.alertCtrl.create({
          title: "Error",
          subTitle: "Could not save Topic",
          buttons: [{
            text: "Dismiss",
            role: "cancel",
            handler: () => {
              setTimeout(()=>this.viewCtrl.dismiss(), 500);
            }
          }]
        }).present().then(()=>{
          this.viewCtrl.dismiss();
        });
      });
    }
  }

  switchTopicType(type) {
    this.topicType = type;
    if (type==="range") {
      this.rangeStart = this.rangeEnd = this.rangeDefault = null;
      // HACK: this is to remove range-related
      this.topicType = "numeric";
      this.validate(true);
      this.topicType = "range";
      this.isValid = false;
    } else
      this.validate(true);
  }

  validate(reportErrors:boolean) {
    let errors=[];
    if (this.topicName==null||this.topicName==="") {
      errors.push("Topic Name is required");
    } else if (!(/^[a-zA-Z0-9_]*$/.test(this.topicName))) {
      errors.push("Only alphanumeric characters are allowed for Topic Name");
    }
    if (this.topicType==="range") {
      if (this.rangeEnd==null||this.rangeStart==null) {
        errors.push("You have to specify Range Start & End values")
      } else {
        if (this.rangeStart===this.rangeEnd) {
          errors.push("Range End must be different to Range Start");
        } else if (this.rangeStart > this.rangeEnd) {
          errors.push("Range End must be greater than Range Start");
        }
      }
      if (this.rangeDefault!=null) {
        if (this.rangeDefault<this.rangeStart) {
          errors.push("Default value must be >= Range Start");
        } else if (this.rangeDefault>this.rangeEnd) {
          errors.push("Default value must be <= Range End (" + this.rangeDefault + ">" + this.rangeEnd + ")");
        }
      }
    }
    if (reportErrors)
      this.errors = errors;
    this.isValid = errors.length==0;
  }

  log(s) {
    console.log(s);
  }

  toNumber() {
    this.rangeStart = +this.rangeStart;
    this.rangeEnd = +this.rangeEnd;
    this.rangeDefault = +this.rangeDefault;
  }

}

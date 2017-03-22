import {Component} from "@angular/core";
import {NavParams, ViewController} from "ionic-angular";


/*
  Generated class for the TimeWidget page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-time-widget',
  templateUrl: 'time-widget.html'
})
export class TimeWidgetPage {

  date: string;
  time: string;

  private originalDate: string;
  private originalTime: string;

  constructor(private navParams: NavParams,
              private viewCtrl: ViewController) {

    this.date = this.originalDate = navParams.get("date");
    this.time = this.originalTime = navParams.get("time");
  }

  dismiss(done: boolean) {
    this.viewCtrl.dismiss(
      done
        ? { time: this.time, date: this.date }
        : {}
    );
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad TimeWidgetPage');
  }

}

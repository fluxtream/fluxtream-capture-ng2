import {Component} from "@angular/core";
import {NavParams, ViewController} from "ionic-angular";

/*
  Generated class for the IconChooser page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-icon-chooser',
  templateUrl: 'icon-chooser.html'
})
export class IconChooserPage {


  emotionsIcons: Array<string> = ["happy", "smile", "tongue", "sad", "wink", "grin",
    "cool", "angry", "evil", "shocked", "baffled", "confused", "neutral",
    "hipster", "wondering", "sleepy", "frustrated", "crying", "cloud",
    "heart", "heart-broken"];

  foodIcons: Array<string> = [
    "spoon-knife", "glass", "alcool", "mug"
  ];

  activitiesIcons: Array<string> = ["pencil2", "quill", "pen", "camera", "dice",
    "pacman", "credit-card", "display", "mobile", "tv", "wrench", "hammer", "books",
    "library", "cart", "coin-dollar"];

  eventsIcons: Array<string> = [ "man", "woman",
    "man-woman", "airplane", "bubbles", "phone"];

  abstractIcons: Array<string> = [ "pie-chart", "stats-dots", "stats-bars",
    "stats-bars2", "warning", "cross", "checkmark", "radio-checked",
    "spades", "clubs", "diamonds", "bullhorn",
    "lifebuoy", "pushpin",
    "stopwatch", "quotes-left", "hour-glass",
    "binoculars", "key", "magic-wand", "bug", "gift", "leaf", "bin",
    "accessibility", "switch", "eye", "eye-blocked",
    "star-empty", "star-full", "point-up", "point-right", "point-down", "point-left",
  ];

  constructor(public viewCtrl: ViewController, public navParams: NavParams) {}

  ionViewDidLoad() {
  }

  setIcon(iconName:string) {
    this.viewCtrl.dismiss({"icon":iconName});
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

}

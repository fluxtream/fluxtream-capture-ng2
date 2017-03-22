import {Component} from "@angular/core";
import {NavController, NavParams, ViewController} from "ionic-angular";
import {LatLngLiteral} from "angular2-google-maps/core";

/*
  Generated class for the MapWidget page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-map-widget',
  templateUrl: 'map-widget.html'
})
export class MapWidgetPage {

  obs_lat: number;
  obs_lng: number;
  new_obs_lat: number;
  new_obs_lng: number;
  topicName: string;
  zoom: number = 15;
  positionChanged: boolean;

  constructor(public navCtrl: NavController,
              public viewCtrl: ViewController,
              public navParams: NavParams) {
    this.topicName = navParams.get("topicName");
    let pos:LatLngLiteral = navParams.get("latLng");
    this.obs_lat = pos.lat;
    this.obs_lng = pos.lng;
  }

  dismiss(coords) {
    this.viewCtrl.dismiss(coords);
  }

  markerDragEnd(event) {
    console.log("drag end", event);
    this.new_obs_lat = event.coords.lat;
    this.new_obs_lng = event.coords.lng;
    if (this.new_obs_lat!=this.obs_lat||
        this.new_obs_lng!=this.obs_lng)
      this.positionChanged = true;
  }

  setPosition() {
    this.dismiss({lat: this.new_obs_lat, lng: this.new_obs_lng})
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MapWidgetPage');
  }

}

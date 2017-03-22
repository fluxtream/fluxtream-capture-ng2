import {Component} from "@angular/core";
import {GoogleMapsAPIWrapper} from "angular2-google-maps/core";

///<reference path="./googlemaps.d.ts"/>


/*
  Generated class for the OpenStreetMapsAdapter component.

  See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
  for more info on Angular 2 Components.
*/

declare var google;

@Component({
  selector: 'open-street-maps-adapter',
  template: ''
})
export class OpenStreetMapsAdapterComponent {

  public recenter(lat, lng):Promise<{}>{
    return new Promise(resolve => {
      this._wrapper.getNativeMap().then((map) => {
        map.setCenter({"lat":lat, "lng":lng});
        // give it the time to send "map center changed" event so
        // it was ignored when this Promise resolves
        resolve();
      })
    });
  }

  constructor(private _wrapper: GoogleMapsAPIWrapper) {
    this._wrapper.getNativeMap().then((map:any) => {

      const mapTypeIds = [];
      for(let type in google.maps.MapTypeId) {
        mapTypeIds.push(google.maps.MapTypeId[type]);
      }
      mapTypeIds.push("OSM");

      map.mapTypeId='OSM';

      function abc(){
        let s = "abc";
        let i = Math.round(Math.random()*2);
        return s[i];
      }

      map.mapTypes.set("OSM", new google.maps.ImageMapType({
        getTileUrl: function(coord, zoom) {
          // return "https://cartodb-basemaps-" + abc() + ".global.ssl.fastly.net/light_all/" + zoom + "/" + coord.x + "/" + coord.y + ".png"
          return "http://" + abc() + ".tile.openstreetmap.org/" +zoom + "/" + coord.x + "/" + coord.y + ".png";
        },
        tileSize: new google.maps.Size(256, 256),
        name: "OpenStreetMap",
        maxZoom: 18
      }));

    });
  }

}

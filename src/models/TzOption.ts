import * as moment from "moment-timezone"

/**
 * Created by candide on 07/03/2017.
 */

export class TzOption {

  public subZones: Array<moment.MomentZone> = [];
  public name: string;

  constructor(public offset: number,
              public zone: moment.MomentZone) {
  }

  public addSubZone(z) {
    for (let subZone of this.subZones)
      if (subZone.name===z.name)
        return;
    this.subZones.push(z);
    this.name = this.computeName();
    if (!this.zone)
      this.zone = this.subZones[0];
  }

  private computeName() {
    this.subZones.sort((t1: any, t2: any)=>{
      return t2.population - t1.population;
    });
    let name;
    if (this.zone&&this.zone.name.startsWith("Etc/"))
      name = this.zone.name.substring("Etc/".length);
    else {
      let hoursOffset = Math.floor(this.offset/60);
      name = "GMT" + (hoursOffset>=0?'+':'') + hoursOffset + ":" + (Math.abs(this.offset%60));
    }
    for (let zone of this.subZones) {
      if (zone.name.indexOf("/")!=-1
          && this.isBigCity(zone))
        name += " " + zone.name.substring(zone.name.lastIndexOf("/")+1);
    }
    return name;
  }

  private isBigCity(zone):boolean {
    if (zone.population<100000) return false;
    let continents = ["America", "Europe", "Africa", "Asia", "Australia"];
    for (let continent of continents)
      if (zone.name.startsWith(continent))
        return true;
    return false;
  }

}

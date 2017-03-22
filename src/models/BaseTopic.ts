import * as moment from "moment-timezone";
/**
 * Created by candide on 24/02/2017.
 */
export class BaseTopic {

  creationTime: string;
  updateTime: string;
  color: string;
  icon: string;
  type: string = "none";
  topicNumber: number;

  constructor(public name: string){
    let now: string = moment().toISOString();
    this.creationTime = now;
    this.updateTime = now;
  }

}

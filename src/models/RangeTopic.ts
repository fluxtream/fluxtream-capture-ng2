import {BaseTopic} from "./BaseTopic";

export class RangeTopic extends BaseTopic {

  constructor(name: string,
              public rangeStart: number,
              public rangeEnd: number,
              public defaultValue: number) {
    super(name);
    this.type = "range";
  }

}

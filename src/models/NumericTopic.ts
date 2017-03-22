import {BaseTopic} from "./BaseTopic";
export class NumericTopic extends BaseTopic {

  constructor(topicName: string) {
    super(topicName);
    this.type = "numeric";
  }

}

import {Utils} from "../utils";
/**
 * Created by candide on 15/02/2017.
 */

export class PhotoItem {

  date_taken: string;
  id: number;
  orientation: string;
  orientation_tag: number;
  thumb_id: number;
  thumb_uri: string;
  uri: string;

  static fromJSONArray(oa:[any]):Array<PhotoItem>{
    let photoItems = [];
    for (let item of oa)
      photoItems.push(PhotoItem.fromJSONObject(item));
    return photoItems;
  }

  static fromJSONObject(o:any):PhotoItem {
    let photoItem:PhotoItem = new PhotoItem();
    Utils.copyJSONProps(o, photoItem);
    return photoItem;
  }
}

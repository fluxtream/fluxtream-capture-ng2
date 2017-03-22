import {Platform} from "ionic-angular";
import {NativeService} from "../providers/native-service";
import {Utils} from "../utils";
import {IonicNativeService} from "../providers/impl/ionic-native-service";
/**
 * Created by candide on 09/02/2017.
 */

declare var forge;

export function nativeServiceProviderFactory(platform: Platform) {
  if (Utils.isDevice(platform))
    return new IonicNativeService();
  return new NativeService();
}

export const environment: any = {
  targetServer: "http://fluxtream.dev/",
  couchDbServerAddress: "@localhost:5984/",
  gmApiKey: "google maps api",
  production: false,
  testUsername: 'hi',
  testPassword: 'testtest'
};

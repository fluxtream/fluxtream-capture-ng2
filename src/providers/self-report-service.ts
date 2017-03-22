import {Injectable, EventEmitter} from "@angular/core";
import * as PouchDB from "pouchdb";
import "rxjs/add/operator/map";
import {environment} from "../env/environment";
import {DateBrowserService} from "./date-browser-service";
// import PouchDBFind from 'pouchdb-find'
// import * as moment from "moment";
// import {FluxtreamCaptureApp} from "../app/app.component";
import * as moment from "moment";
import {HashTable, Logger, Utils} from "../utils";
import {UserPrefs, UserPrefsService} from "./user-prefs-service";
import {FluxtreamCaptureApp} from "../app/app.component";
import {LoginService, LoginEvents} from "./login-service";
import {
  Http, Response, URLSearchParams,
  RequestOptionsArgs, ResponseContentType
} from "@angular/http";

/*
  Generated class for the SelfReport provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/

export class PersistenceEvent {

  public constructor(public type: PersistenceEventType,
                     public info: SyncStatusInfo) {

  }

}

export class SyncStatusInfo {
  constructor(public dbName: string, public status: SyncStatus){}
}

export enum PersistenceEventType {
  SYNC_STATUS_CHANGED,
  INITIALIZED
}

export enum SyncStatus {
  STATUS_IDLE,
  STATUS_ACTIVE,
  STATUS_ERROR
}

@Injectable()
export class SelfReportService {

  public events: EventEmitter<PersistenceEvent> = new EventEmitter<PersistenceEvent>();

  public static readonly OBSERVATIONS_DB: string = "observations";
  public static readonly TOPICS_DB: string = "topics";
  public static readonly METADATA_DB: string = "metadata";

  public sortedTopicsEvents: EventEmitter<any> = new EventEmitter<any>();
  public topicsEvents: EventEmitter<any> = new EventEmitter<any>();
  public metadataEvents: EventEmitter<any> = new EventEmitter<any>();
  public observationsEvents: EventEmitter<any> = new EventEmitter<any>();

  topics: any;
  topicsDB: any;
  private topicsById: HashTable<any> = {};

  static sortedTopics: any;

  observations: any;
  observationsDB: any;

  metadata: any;
  metadataDB: any;

  private topicsMetadata: any;
  private observationsSyncHandler;

  private syncStatuses: HashTable<SyncStatus> = {};

  syncOptions: any = {
    live: true,
    retry: true,
    continuous: true
  };

  private logger;

  constructor(private http: Http,
              private dateBrowserService: DateBrowserService,
              private loginService: LoginService,
              private userPrefs: UserPrefsService) {
    this.logger = Logger(true, SelfReportService.name);
    this.logger.debug("constructing SelfReportService instance");
    ["topics", "observations", "metadata"].forEach(dbName=>{
      this.syncStatuses[dbName] = SyncStatus.STATUS_IDLE;
    });
    if (this.loginService.getUserId()==null) {
      this.loginService.events.subscribe((loginEvent:LoginEvents)=>{
        this.logger.debug("received loginEvent", loginEvent);
        if (loginEvent==LoginEvents.SIGNED_IN.valueOf()) {
          this.initialize();
        }
      });
    } else
      this.initialize();
  }

  private initialize() {
    this.logger.debug("initializing self-report-service...");
    // don't retrieve couchdb credentials if we already have them in store
    if (this.userPrefs.getValueForUser("couchdb_user_login", null)!=null) {
      this.logger.debug("couchdb_user_login already available locally");
      this.initializeData();
      return;
    }
    this.logger.debug("retrieving couchdb credentials");
    let params: URLSearchParams = new URLSearchParams();
    params.set('access_token', this.userPrefs.getGlobal("login.fluxtream_access_token"));
    this.http.put(environment.targetServer+"api/v1/couch/", null,
      <RequestOptionsArgs>{
        headers: this.loginService.getRequestHeaders(),
        responseType: ResponseContentType.Json
      }).map((res:Response)=>{
      let userInfo = res.json();
      this.userPrefs.setValueForUser("couchdb_user_login", userInfo.user_login);
      this.userPrefs.setValueForUser("couchdb_user_token", userInfo.user_token);
      this.logger.log("received response from couch API", res.json());
      this.initializeData();
    }).subscribe();
  }

  public initializeData():Promise<any> {
    this.logger.debug("initializing data, this should be executed ONCE");
    return new Promise((resolve, reject)=>{
      ["topics", "observations", "metadata"].forEach((dbName)=>{
        this.initDB(dbName);
      });
      this.getAllDocs("metadata").then(()=>{
        this.getAllDocs("topics").then(()=>{
          this.getAllDocs("observations").then(()=>{
            this.logger.log("Data initialized!");
            this.events.emit(new PersistenceEvent(PersistenceEventType.INITIALIZED, null));
            // allow debugging in Chrome's PouchDB extension
            (<any>window).PouchDB = PouchDB;
            resolve();
          }).catch((error)=>reject(error));
        }).catch((error)=>reject(error));
      }).catch((error)=>reject(error));
    });
  }

  initDB(dbName) {
    // the local database name has to be specific both to the base
    // server address and the username
    let user_login = this.userPrefs.getValueForUser("couchdb_user_login", null);
    let user_token = this.userPrefs.getValueForUser("couchdb_user_token", null);
    this[dbName+"DB"] = new PouchDB(
      Utils.hash(environment.couchDbServerAddress) +"_" + dbName
      + "_" + user_login);
    var protocol = environment.couchLoginProtocol;
    if (!protocol) protocol = 'http://';
    let remoteCouchDBAddress = protocol + user_login + ':'
      + user_token + environment.couchDbServerAddress
      + "self_report_db_" + dbName + "_" + user_login ;
    this.logger.debug("and this is the remote couchdb address for " + dbName, remoteCouchDBAddress);
    let self = this;
    this[dbName+"SyncHandler"] = this[dbName+"DB"]
      .sync(remoteCouchDBAddress, this.syncOptions)
      .on('change', function (info) {
        self.logger.debug("sync: change event, " + dbName, info);
      }).on('paused', function (err) {
        // replication paused (e.g. replication up to date, user went offline)
        self.logger.debug("sync: paused event, " + dbName, err);
        self.events.emit(new PersistenceEvent(PersistenceEventType.SYNC_STATUS_CHANGED, new SyncStatusInfo(dbName, SyncStatus.STATUS_IDLE)));
      }).on('active', function () {
        // replicate resumed (e.g. new changes replicating, user went back online)
        self.logger.debug("sync: active, " + dbName);
        self.events.emit(new PersistenceEvent(PersistenceEventType.SYNC_STATUS_CHANGED, new SyncStatusInfo(dbName, SyncStatus.STATUS_ACTIVE)));
      }).on('denied', function (err) {
        // a document failed to replicate (e.g. due to permissions)
        self.logger.debug("sync: denied, " + dbName, err);
        self.events.emit(new PersistenceEvent(PersistenceEventType.SYNC_STATUS_CHANGED, new SyncStatusInfo(dbName, SyncStatus.STATUS_ERROR)));
      }).on('complete', function (info) {
        // handle complete
        self.logger.debug("sync: complete, " + dbName, info);
        self.events.emit(new PersistenceEvent(PersistenceEventType.SYNC_STATUS_CHANGED, new SyncStatusInfo(dbName, SyncStatus.STATUS_IDLE)));
      }).on('error', function (err) {
        // handle error
        self.logger.debug("sync: error, " + dbName, err);
        self.events.emit(new PersistenceEvent(PersistenceEventType.SYNC_STATUS_CHANGED, new SyncStatusInfo(dbName, SyncStatus.STATUS_ERROR)));
      });
  }

  destroy(dbName) {
    this[dbName+"DB"].destroy().then(this.logger.log("database " + dbName + " destroyed"));
  }

  sync(dbName:string) {
    this[dbName+"DB"].sync(environment.couchDbServer + dbName, this.syncOptions);
  }

  getAllDocs(dbName:string):Promise<any> {
    if (this[dbName]) {
      return Promise.resolve(this[dbName]);
    }

    let remoteDbName = dbName + "DB";

    return new Promise(resolve => {
      this[remoteDbName].allDocs({

        include_docs: true

      }).then((result) => {

        let tempCache = [];

        result.rows.map((row) => {
          tempCache.push(row.doc);
        });

        this[dbName] = tempCache;
        if (dbName==="observations") {
          this.sortObservations();
          //TODO...
        }

        this[remoteDbName].changes({live: true, since: 'now', include_docs: true}).on('change', (change) => {
          this.handleChange(change, dbName);
        });

        resolve(this[dbName]);

      }).catch((error) => {

        this.logger.err(error);

      });

    });
  }

  getSortedTopics():Promise<any> {
    return new Promise((resolve, reject)=> {
      this.getMetadata().then((mds) => {
        for (let md of mds) {
          if (md.database === SelfReportService.TOPICS_DB) {
            this.topicsMetadata = md;
            break;
          }
        }
        this.topicsDB.allDocs({include_docs: true}).then(data=>{
          data = this.unwrap(data);
          if (this.topicsMetadata) {
            for (let i=0; i<this.topicsMetadata.topicIds.length; i++) {
              let topicId = this.topicsMetadata.topicIds[i];
              for (let topic of data) {
                if (topic._id==topicId)
                  topic.topicNumber = (i+1);
              }
            }
          } else {
            this.topicsMetadata = {"database": SelfReportService.TOPICS_DB, "topicIds": []};
          }
          this.sortTopics(data);
          for (let topic of data)
            this.topicsById[topic._id] = topic;
          SelfReportService.sortedTopics = data;
          this.sortedTopicsEvents.emit("sorted");
          resolve(data);
        }).catch((err)=>reject(err));
      }).catch((err)=>reject(err));
    });
  }

  unwrap(data) {
    if (!data.rows) return [];
    let unwrapped = [];
    for (let row of data.rows) {
      if (!row.doc) continue;
      unwrapped.push(row.doc);
    }
    return unwrapped;
  }

  sortTopics(data) {
    data.sort((t1, t2)=>{
      if (t1.topicNumber && t2.topicNumber)
        return t1.topicNumber - t2.topicNumber;
      else {
        if (t1.name > t2.name)
          return 1;
        if (t1.name < t2.name)
          return -1;
        return 0;
      }
    });
  }

  getTopicById(id:string):Promise<any> {
    return new Promise((resolve)=>{
      this.topicsDB.allDocs({include_docs: true}).then((topics)=>{
        topics = this.unwrap(topics);
        for (let topic of topics) {
          if (topic._id==id)
            resolve(topic);
        }
        resolve(null)
      })
    });
  }

  getTopicByName(name:string):Promise<any> {
    return new Promise((resolve)=>{
      this.topicsDB.allDocs({include_docs: true}).then((topics)=>{
        topics = this.unwrap(topics);
        for (let topic of topics) {
          if (topic.name==name)
            resolve(topic);
        }
        resolve(null);
      })
    });
  }

  getMetadata():Promise<any> {
    return new Promise((resolve, reject)=>{
      this.metadataDB.allDocs({include_docs: true}).then((metadata)=>{
        resolve(this.unwrap(metadata));
      });
    });
  }

  getObservations():Promise<any> {
    return new Promise((resolve, reject)=>{
      this.observationsDB.allDocs({include_docs: true}).then(observations=>{
        resolve(this.unwrap(observations));
      });
    });
  }

  handleChange(change, dbName){

    let localData = this[dbName];

    let changedDoc = null;
    let changedIndex = null;

    localData.forEach((doc, index) => {

      if(doc._id === change.id){
        changedDoc = doc;
        changedIndex = index;
      }

    });

    //A document was deleted
    if(change.deleted){
      localData.splice(changedIndex, 1);
      change.doc = changedDoc;
      if (dbName==="observations")
        this.sortObservations();
    }
    else {

      //A document was updated
      if(changedDoc){
        this.logger.debug("changed value:" + change.doc.value);
        this.weekend(change.doc);
        localData[changedIndex] = change.doc;
      }

      //A document was added
      else {
        localData.push(change.doc);
        if (dbName==="observations")
          this.sortObservations();
      }

    }

    if (dbName==="topics") this.topicsEvents.emit(change);
    if (dbName==="observations") this.observationsEvents.emit(change);
    if (dbName==="metadata") this.metadataEvents.emit(change);

  }

  public create(dbName, object){
    return new Promise((resolve, reject)=>{
      this[dbName+"DB"].post(object, null, (error, response)=>{
        if (error) reject(error);
        if (response) resolve(response);
       })
    });
  }

  public update(dbName, object):Promise<any> {
    return new Promise((resolve, reject)=>{
      this[dbName+"DB"].put(object).then(()=>resolve({}))
        .catch((err) => {
          reject(err);
        });
      });
  }

  public remove(dbName: string, object: any):Promise<any>{
    return new Promise((resolve, reject)=>{
      let oId = object._id;
      this[dbName+"DB"].remove(object).then(()=>{
        if (dbName == "topics") {
          this.cleanupTopicsFilter();
          this.updateTopicsMetadata();
          this.removeTopicObservations(oId).then(()=>{
            resolve();
          });
        } else {
          resolve();
        }
      }).catch((err) => {
        this.logger.error("Error removing object", dbName, object);
        reject(err);
      });
    });
  }

  private removeTopicObservations(topicId: any):Promise<any> {
    return new Promise((resolve, reject)=>{
      let toDelete = [];
      this.observations.forEach(observation=>{
        if (observation.topicId===topicId) {
          toDelete.push({
            _id: observation._id,
            _rev: observation._rev,
            _deleted: true
          });
        }
      });
      this.logger.log("about to delete " + toDelete.length + " observations");
      this.observationsDB.bulkDocs(toDelete).then(()=>{
        this.sortObservations();
        resolve();
      }).catch((error)=>{
        reject(error);
      });
    });
  }

  public updateTopicsMetadata() {
    this.topicsMetadata.topicIds = [];
    this.topicsMetadata.topicNames = [];
    for(let i=0; i<this.topics.length; i++) {
      let topic = this.topics[i];
      topic.topicNumber = (i+1);
      this.topicsMetadata.topicIds.push(topic._id);
      this.topicsMetadata.topicNames.push(topic.name);
    }
    if (this.topicsMetadata._id) {
      this.logger.log("updating topicsMetadata", this.topicsMetadata);
      this.update(SelfReportService.METADATA_DB, this.topicsMetadata);
    } else {
      this.logger.log("creating topicsMetadata", this.topicsMetadata);
      this.create(SelfReportService.METADATA_DB, this.topicsMetadata);
    }
  }

  private cleanupTopicsFilter() {
    let userTopics = JSON.parse(this.userPrefs.getValueForUser(UserPrefs.TOPICS_FILTER_KEY,
      JSON.stringify([FluxtreamCaptureApp.TOPICS_FILTER_ALL])));
    let cleanedUpUserTopics = [];
    for (let topicId of userTopics) {
      if (this.getTopicById(topicId))
        cleanedUpUserTopics.push(topicId);
    }
    this.userPrefs.setValueForUser(UserPrefs.TOPICS_FILTER_KEY,
      JSON.stringify(cleanedUpUserTopics));
  }

  filterObservations(filter: Array<string>):Promise<Array<any>> {
    if (this.observations==null||filter==null||filter.length==0) {
      this.logger.warn("no observations yet, cannot filter anything");
      return Promise.resolve([]);
    } else {
      // this.logger.debug("filtering observations", this.observations);
      return new Promise((resolve)=>{
        let observationsInTimeRange = this.getObservationsInTimeRange();
        let filteredObservations = [];
        let flatFilter = JSON.stringify(filter);
        for (let observation of observationsInTimeRange) {
          if ((filter.length==1&&filter[0]=='all') ||
              flatFilter.indexOf(observation.topicId)!=-1) {
            // if (this.topicsById[observation.topicId]) {
              observation.topic = this.topicsById[observation.topicId];
              filteredObservations.push(observation);
            // } else
            //   this.logger.warn("WARNING: unknown topic ID in observation "
            //     + observation._id + ":" + observation.topicId);
          }
        }
        resolve(filteredObservations);
      });
    }
  }

  private getObservationsInTimeRange():Array<any> {
    let startRangeDate, endRangeDate;
    if (this.dateBrowserService.timeUnit === DateBrowserService.TIMEUNIT_DAY) {
      this.logger.log("get observations for date " + this.dateBrowserService.date);
      startRangeDate = endRangeDate = this.dateBrowserService.date;
    } else {
      startRangeDate = this.dateBrowserService.fromDateStr;
      endRangeDate = this.dateBrowserService.toDateStr;
      this.logger.log("get observations from " + startRangeDate + " to " + endRangeDate);
    }
    let startIndex = this.getFirstObservationDateIndex(startRangeDate, endRangeDate);
    if (startIndex<0) return [];
    let endIndex = startIndex;
    for (; endIndex < this.observations.length; endIndex++)
      if (this.observations[endIndex].observationDate>endRangeDate) {
        endIndex--;
        break;
      }
    return this.observations.slice(startIndex, endIndex);
  }

  getFirstObservationDateIndex(date, maxDate): number {
    for (let i=0; i<this.observations.length; i++)  {
      if (this.observations[i].observationDate>=date &&
          this.observations[i].observationDate<=maxDate)
        return i;
    }
    return -1;
  }

  sortObservations() {
    this.observations.sort((o1, o2)=>{
      if (!o1.moment)
        o1.moment = moment.tz(o1.observationDate + " " + o1.observationTime, o1.timezone);
      if (!o2.moment)
        o2.moment = moment.tz(o2.observationDate + " " + o2.observationTime, o2.timezone);
      this.weekend(o1);
      this.weekend(o2);
      if (o1.moment.isBefore(o2.moment))
        return -1;
      if (o1.moment.isAfter(o2.moment))
        return 1;
      return 0;
    });
  }

  weekend(observation) {
    if (observation.we)
      return;
    if (!observation.moment)
      observation.moment = moment.tz(observation.observationDate + " " + observation.observationTime, observation.timezone);
    let day = observation.moment.format("dddd");
    observation.we = "Saturday Sunday".indexOf(day)!=-1;
  }

}

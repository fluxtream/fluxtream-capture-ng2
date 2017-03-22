import {NgModule, ErrorHandler, CUSTOM_ELEMENTS_SCHEMA} from "@angular/core";
import {
  IonicApp,
  IonicModule,
  IonicErrorHandler,
  Platform
} from "ionic-angular";
import {FluxtreamCaptureApp} from "./app.component";
import {nativeServiceProviderFactory, environment} from "../env/environment";
import {LoginPage} from "../pages/login/login";
import {SignInPage} from "../pages/sign-in/sign-in";
import {SignUpPage} from "../pages/sign-up/sign-up";
import {DeviceIdService} from "../providers/device-id";
import {LoginService} from "../providers/login-service";
import {UserPrefsService} from "../providers/user-prefs-service";
import {SettingsPage} from "../pages/settings/settings";
import {NativeService} from "../providers/native-service";
import {TopicsPage} from "../pages/topics/topics";
import {EditTopicPage} from "../pages/edit-topic/edit-topic";
import {EditObservationPage} from "../pages/edit-observation/edit-observation";
import {SelfReportService} from "../providers/self-report-service";
import {TimeWidgetPage} from "../pages/time-widget/time-widget";
import {MapWidgetPage} from "../pages/map-widget/map-widget";
import {OpenStreetMapsAdapterComponent} from "../components/open-street-maps-adapter/open-street-maps-adapter";
import {AgmCoreModule} from "angular2-google-maps/core";
import {IconChooserPage} from "../pages/icon-chooser/icon-chooser";
import {DebugPage} from "../pages/debug/debug";
import {HistoryPage} from "../pages/history/history";
import {TestDataService} from "../providers/test-data-service";
import {MomentModule} from "angular2-moment";
import {ChartModule} from "angular2-highcharts";
import {TimezoneWidgetPage} from "../pages/timezone-widget/timezone-widget";
import {DateBrowserService} from "../providers/date-browser-service";
import {ShowHideContainer} from "../components/show-hide-password/show-hide-container";
import {ShowHideInput} from "../components/show-hide-password/show-hide-input";
import {ForgotPasswordPage} from "../pages/forgot-password/forgot-password";
import {TermsOfServicePage} from "../pages/terms-of-service/terms-of-service";

@NgModule({
  declarations: [
    DebugPage,
    FluxtreamCaptureApp,
    LoginPage,
    SignInPage,
    SignUpPage,
    TopicsPage,
    EditTopicPage,
    EditObservationPage,
    SettingsPage,
    TimeWidgetPage,
    MapWidgetPage,
    OpenStreetMapsAdapterComponent,
    ShowHideContainer,
    ShowHideInput,
    IconChooserPage,
    HistoryPage,
    TimezoneWidgetPage,
    ForgotPasswordPage,
    TermsOfServicePage
  ],
  imports: [
    ChartModule.forRoot(require('highcharts')),
    IonicModule.forRoot(FluxtreamCaptureApp, {}, {
      links: [
        { component: HistoryPage, name: 'History', segment: 'history' },
        { component: DebugPage, name: 'Debug', segment: 'debug' },
        { component: IconChooserPage, name: 'Icons', segment: 'icons' },
        { component: LoginPage, name: 'Login', segment: 'login' },
        { component: SignInPage, name: 'Sign in', segment: 'signin' },
        { component: SignUpPage, name: 'Sign up', segment: 'signup' },
        { component: SettingsPage, name: 'Settings', segment: 'settings' },
        { component: EditObservationPage, name: 'New Observation', segment: 'observation/:topicId' },
        { component: EditTopicPage, name: 'New Topic', segment: 'new-topic' },
        { component: TopicsPage, name: 'Home', segment: 'home' }
      ]
    }),
    AgmCoreModule.forRoot({
      apiKey: environment.gmApiKey
    }),
    MomentModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    FluxtreamCaptureApp,
    LoginPage,
    SignInPage,
    SignUpPage,
    SettingsPage,
    TopicsPage,
    EditTopicPage,
    EditObservationPage,
    TimeWidgetPage,
    MapWidgetPage,
    OpenStreetMapsAdapterComponent,
    IconChooserPage,
    HistoryPage,
    DebugPage,
    TimezoneWidgetPage,
    ForgotPasswordPage,
    TermsOfServicePage
  ],
  providers: [
    DeviceIdService,
    LoginService,
    UserPrefsService,
    {
      provide: NativeService,
      useFactory: nativeServiceProviderFactory,
      deps: [Platform]
    },
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    SelfReportService,
    DateBrowserService,
    TestDataService
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class AppModule {}

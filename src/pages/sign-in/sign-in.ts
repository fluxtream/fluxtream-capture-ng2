import {Component} from "@angular/core";
import {NavController, NavParams} from "ionic-angular";
import {LoginService} from "../../providers/login-service";
import {Response} from "@angular/http";
import {TopicsPage} from "../topics/topics";
import {FormGroup, FormControl, Validators} from "@angular/forms";
import {environment} from "../../env/environment";
import {SignUpPage} from "../sign-up/sign-up";
import {ForgotPasswordPage} from "../forgot-password/forgot-password";
import {Logger} from "../../utils";

/*
  Generated class for the SignIn page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-sign-in',
  templateUrl: 'sign-in.html'
})
export class SignInPage {

  private logger: any;

  login: FormGroup;
  errorMessage: string;

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              private loginService: LoginService) {
    this.logger = Logger(true, SignInPage.name);
    this.login = new FormGroup({
      username: new FormControl(environment.testUsername, Validators.required),
      password: new FormControl(environment.testPassword, Validators.required)
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SignInPage');
  }

  signIn() {
    this.logger.log("we should sign in", this.login);
    this.loginService.signIn(
      this.login.getRawValue().username,
      this.login.getRawValue().password).then(
      (signInObs)=> {
        this.logger.log("typeof signInObs", typeof signInObs, signInObs);
        signInObs
          .map((response:Response)=>{
            this.logger.log("got response", response);
            if (response.status==200) {
              this.loginService.handleAuthSuccessResponse(response.json());
              this.navCtrl.push(TopicsPage).then(()=>{
                this.navCtrl.setRoot(TopicsPage);
              });
            } else {
              this.logger.error("We shouldn't end up here");
            }
          }).subscribe(null, (error)=>this.handleError(error));
      }
    );
    console.log(this.login.value);
    // this.loginService.handleAuthSuccessResponse({
    //   "fullname": "Aurélien Kemmler",
    //   "username": "candide",
    //   "firstname": "Candide",
    //   "lastname": "Kemmler",
    //   "id": 1,
    //   "photoURL": null,
    //   "access_token": "844062ce-de9e-44af-9360-d5fd95a5fcdd"
    // });
  }

  goToSignup() {
    this.navCtrl.push(SignUpPage);
  }

  goToForgotPassword() {
    this.navCtrl.push(ForgotPasswordPage);
  }

  private handleError(error: Response) {
    this.errorMessage = "Cannot login (" + error.statusText + "). Verify username and password and try again";
    this.logger.log("now error message is " + this.errorMessage);
    this.logger.log("logging error " + error.status + ", " + error.statusText, error);
    this.logger.error("handling error", error);
  }

}

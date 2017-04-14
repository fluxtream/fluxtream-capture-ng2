import { Component } from '@angular/core';
import {NavController, ModalController, AlertController} from 'ionic-angular';
import { Validators, FormGroup, FormControl } from '@angular/forms';

import { TermsOfServicePage } from '../terms-of-service/terms-of-service';
import {TopicsPage} from "../topics/topics";
import {LoginService} from "../../providers/login-service";
import {Response} from "@angular/http";
import {Logger} from "../../utils";
import 'rxjs/add/operator/catch';

@Component({
  selector: 'signup-page',
  templateUrl: 'sign-up.html'
})
export class SignUpPage {

  private logger: any;

  signup: FormGroup;
  main_page: { component: any };

  static instance: SignUpPage;

  constructor(public nav: NavController,
              public modal: ModalController,
              public alertCtrl: AlertController,
              public loginService: LoginService) {
    this.logger = Logger(true, SignUpPage.name);

    this.main_page = { component: TopicsPage };

    this.signup = new FormGroup({
      email: new FormControl('', [Validators.required]),
      username: new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z0-9]+$/)]),
      firstname: new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z]+$/)]),
      lastname: new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z]+$/)]),
      password: new FormControl('xxxxxxxx', [Validators.required, Validators.minLength(8), Validators.maxLength(24)]),
      confirm_password: new FormControl('xxxxxxxx', Validators.required)
    });

    SignUpPage.instance = this;
  }

  doSignup(){
    console.log(this.signup.value);
    this.loginService.signUp(this.signup.value).then(
      (signUpObs)=> {
        signUpObs
          .map((response:Response)=>{
            console.log("got response", response);
            this.loginService.handleAuthSuccessResponse(response.json());
            this.nav.setRoot(this.main_page.component);
          }).subscribe(null, this.handleError);
      }
    );
  }

  static showError() {
    let alert = SignUpPage.instance.alertCtrl.create({
      title: 'Server Error',
      subTitle: 'Please verify email, username and passwords',
      buttons: ['Dismiss']
    });
    alert.present();
  }

  public handleError(error: Response) {
    console.log("logging error " + error.status + ", " + error.statusText, error);
    console.error("handling error", error);
    SignUpPage.showError();
  }

  showTermsModal() {
    let modal = this.modal.create(TermsOfServicePage);
    modal.present();
  }

}

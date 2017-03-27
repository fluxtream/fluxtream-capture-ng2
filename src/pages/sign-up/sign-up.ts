import { Component } from '@angular/core';
import { NavController, ModalController } from 'ionic-angular';
import { Validators, FormGroup, FormControl } from '@angular/forms';

import { TermsOfServicePage } from '../terms-of-service/terms-of-service';
import {TopicsPage} from "../topics/topics";
import {LoginService} from "../../providers/login-service";
import {Response} from "@angular/http";
import {Logger} from "../../utils";

@Component({
  selector: 'signup-page',
  templateUrl: 'sign-up.html'
})
export class SignUpPage {

  private logger: any;

  signup: FormGroup;
  main_page: { component: any };

  constructor(public nav: NavController,
              public modal: ModalController,
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

  public handleError(error: Response) {
    console.log("logging error " + error.status + ", " + error.statusText, error);
    console.error("handling error", error);
  }

  showTermsModal() {
    let modal = this.modal.create(TermsOfServicePage);
    modal.present();
  }

}

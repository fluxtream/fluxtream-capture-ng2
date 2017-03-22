import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import {SignInPage} from "../sign-in/sign-in";
import {SignUpPage} from "../sign-up/sign-up";
import {UserPrefsService} from "../../providers/user-prefs-service";
import {TopicsPage} from "../topics/topics";

/*
  Generated class for the Login page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {

  loggedIn: boolean;

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              private userPrefs: UserPrefsService) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');
  }

  signIn() {
    this.navCtrl.push(SignInPage);
  }

  signUp() {
    this.navCtrl.push(SignUpPage);
  }

}

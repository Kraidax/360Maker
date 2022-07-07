import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthCookie } from '../auth-cookies-handler';
import { Router } from '@angular/router';

declare var require: any;


@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent{

  data! : any;

  constructor(private http: HttpClient, private _authCookie: AuthCookie, private router: Router) { }

  ngOnInit(): void {
  }

  async onFormSubmit(userForm: NgForm){

    const bcrypt = require('bcryptjs');

    const Username = userForm.value['username']
    const Password = userForm.value['password']

    var salt = bcrypt.genSaltSync(10);
    const Hash = bcrypt.hashSync(Password, salt)

    
    console.log('Submit pswd:',Password);
    console.log('Submit Hash:',Hash);

    this.login(Username,Password);
   
    
    
  }

  login(Username: any, Password: any) {
    
    this.http.post('http://localhost:4200/api/signin', { "username": Username, "pswd": Password }, {observe: 'response', responseType: 'text', headers : { 'Content-Type': 'application/json' }} )
    .subscribe((result)=>{
      this.data = result.body
      console.log("this.data :", this.data)
      this._authCookie.setAuth(this.data)
      console.log("C'est fait")
      var mon_token = this._authCookie.getAuth()
      console.log("mon_token :", mon_token)
      this.router.navigate([""]);
    })
  }
  
}
  
function delay(milliseconds : number) {
  return new Promise(resolve => setTimeout( resolve, milliseconds));
}
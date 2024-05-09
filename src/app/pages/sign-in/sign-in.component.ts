/*========================
; Title: Sign-In Component
; Date: 16 September 2021
; Author: George Henderson
; Modified by: Kevin Jones
; Description: Class file for the sign-in component.
========================*/

import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { Message } from 'primeng/api/message';
import { ApiService } from 'src/app/shared/services/api.service';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css'],
})
export class SignInComponent implements OnInit {
  signinForm: FormGroup;
  error: string;
  errorMessages: Message[];

  constructor(
    private fb: FormBuilder,
    private cookieService: CookieService,
    private router: Router,
    private http: HttpClient
  ) {}

  /**
   * Creates the signinForm: 'username' & 'password'
   */
  ngOnInit(): void {
    this.signinForm = this.fb.group({
      username: ['', Validators.compose([Validators.required])],
      password: [
        '',
        Validators.compose([
          Validators.required,
          Validators.pattern('^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{8,}$'),
        ]),
      ],
    });
  }

  /**
   * Sends a POST request with the users given credentials
   * If the user is authenticated, send them to home page otherwise display proper error.
   */
  signIn(): void {
    const userName = this.signinForm.controls.username.value;
    const password = this.signinForm.controls.password.value;

    const user = {
      userName,
      password,
    };

    // Authenticate User
    this.http
      .post(`https://${ApiService.API_HOST}/bcrs/session/signin`, {
        userName,
        password,
      })
      .subscribe(
        (res) => {
          console.log(res['data']);
          // User is authenticated
          if (res['data'].userName) {
            // Give user cookie: 'session_user' set to their username.
            this.cookieService.set('session_user', res['data'].userName, 1);
            this.router.navigate(['/']);
          }
          // Error
        },
        (err) => {
          console.log(err);
          this.errorMessages = [
            { severity: 'error', summary: 'Error', detail: err['message'] },
          ];
        }
      );
  }
}

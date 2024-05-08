/*======================================
; Title: Register Component
; Date: 25 September 2021
; Author: George Henderson
; Modified by: Kevin Jones
; Description: Class file for register component.
======================================*/

import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { SecurityQuestionService } from '../../shared/services/security-question.service';
import { Message } from 'primeng/api/message';
import { ApiService } from 'src/app/shared/services/api.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  /* Variables */
  securityQuestions: Array<string>;

  contactForm: FormGroup;
  securityQuestionsForm: FormGroup;
  credentialsForm: FormGroup;

  errorMessage: string;
  errorMessages: Message[];

  constructor(
    private fb: FormBuilder,
    private securityQuestionService: SecurityQuestionService,
    private http: HttpClient,
    private cookieService: CookieService,
    private router: Router
  ) {
    // Get list of security questions user can use to answer
    this.securityQuestionService.findAllSecurityQuestions().subscribe(
      (res) => {
        this.securityQuestions = res.data;
      },
      (err) => {
        console.log(err);
      }
    );
  }

  ngOnInit(): void {
    // Contact Form
    this.contactForm = this.fb.group({
      firstName: [null, Validators.compose([Validators.required])],
      lastName: [null, Validators.compose([Validators.required])],
      phoneNumber: [null, Validators.compose([Validators.required])],
      email: [
        null,
        Validators.compose([Validators.required, Validators.email]),
      ],
      address: [null, Validators.compose([Validators.required])],
    });

    // Security Questions Form
    this.securityQuestionsForm = this.fb.group({
      securityQuestion1: [null, Validators.compose([Validators.required])],
      securityQuestion2: [null, Validators.compose([Validators.required])],
      securityQuestion3: [null, Validators.compose([Validators.required])],
      answerToSecurityQuestion1: [
        null,
        Validators.compose([Validators.required]),
      ],
      answerToSecurityQuestion2: [
        null,
        Validators.compose([Validators.required]),
      ],
      answerToSecurityQuestion3: [
        null,
        Validators.compose([Validators.required]),
      ],
    });

    // Credentials Form
    this.credentialsForm = this.fb.group({
      userName: [null, Validators.compose([Validators.required])],
      password: [
        null,
        Validators.compose([
          Validators.required,
          Validators.pattern('^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{8,}$'),
        ]),
      ],
    });
  }

  /**
   * Sends POST request to create a user account based on the information they specified in the
   * form stepper.
   */
  register() {
    /* Pulls value from forms to create local variables */
    const contact = this.contactForm.value;
    const securityQuestions = this.securityQuestionsForm.value;
    const credentials = this.credentialsForm.value;

    // Create user selected security questions array
    const selectedSecurityQuestions = [
      {
        questionText: securityQuestions.securityQuestion1,
        answerText: securityQuestions.answerToSecurityQuestion1,
      },
      {
        questionText: securityQuestions.securityQuestion2,
        answerText: securityQuestions.answerToSecurityQuestion2,
      },
      {
        questionText: securityQuestions.securityQuestion3,
        answerText: securityQuestions.answerToSecurityQuestion3,
      },
    ];

    // register POST request
    this.http
      .post(`http://${ApiService.API_HOST}/bcrs/session/register`, {
        userName: credentials.userName,
        password: credentials.password,
        firstName: contact.firstName,
        lastName: contact.lastName,
        phoneNumber: contact.phoneNumber,
        address: contact.address,
        email: contact.email,
        selectedSecurityQuestions: selectedSecurityQuestions,
      })
      .subscribe(
        (res) => {
          // Set the user cookie and navigate them to 'home'
          this.cookieService.set('session_user', credentials.userName, 1);
          this.router.navigate(['/']);
        },
        (err) => {
          // Error
          console.log(err);
          // Set error message
          this.errorMessages = [
            { severity: 'error', summary: 'Error', detail: err['message'] },
          ];
        }
      );
  }
}

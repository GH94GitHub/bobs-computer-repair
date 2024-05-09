/*
============================================
; Title:  verify-security-questions-form.component.ts
; Author: Professor Krasso
; Date: 23 Sep 2021
; Modified By: Kevin Jones
; Description: Verify security questions component file
;===========================================
*/

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Message } from 'primeng/api/message';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-verify-security-questions-form',
  templateUrl: './verify-security-questions-form.component.html',
  styleUrls: ['./verify-security-questions-form.component.css'],
})
export class VerifySecurityQuestionsFormComponent implements OnInit {
  selectedSecurityQuestions: any;
  question1: string;
  question2: string;
  question3: string;
  username: string;
  form: FormGroup;
  errorMessages: Message[];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private fb: FormBuilder
  ) {
    // Get the username from the query params
    this.username = this.route.snapshot.queryParamMap.get('username');
    console.log(this.username);

    // Get the users security questions from the query params
    this.http
      .get('api/users/' + this.username + '/security-questions')
      .subscribe(
        (res) => {
          this.selectedSecurityQuestions = res['data'];
          console.log(this.selectedSecurityQuestions);
          console.log(res);
        },
        (err) => {
          console.log(err);
        },
        () => {
          this.question1 = this.selectedSecurityQuestions[0].questionText;
          this.question2 = this.selectedSecurityQuestions[1].questionText;
          this.question3 = this.selectedSecurityQuestions[2].questionText;

          console.log(this.question1);
          console.log(this.question2);
          console.log(this.question3);
        }
      );
  }

  ngOnInit() {
    // Create the form group and add the form controls
    this.form = this.fb.group({
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
  }

  verifySecurityQuestions() {
    // Get the answers from the form
    const answerToSecurityQuestion1 =
      this.form.controls['answerToSecurityQuestion1'].value;
    const answerToSecurityQuestion2 =
      this.form.controls['answerToSecurityQuestion2'].value;
    const answerToSecurityQuestion3 =
      this.form.controls['answerToSecurityQuestion3'].value;

    console.log(answerToSecurityQuestion1);
    console.log(answerToSecurityQuestion2);
    console.log(answerToSecurityQuestion3);

    // Check if the answers match the users answers
    this.http
      .post(
        `https://${ApiService.API_HOST}/bcrs/session/verify/users/${this.username}/security-questions`,
        {
          questionText1: this.question1,
          questionText2: this.question2,
          questionText3: this.question3,
          answerText1: answerToSecurityQuestion1,
          answerText2: answerToSecurityQuestion2,
          answerText3: answerToSecurityQuestion3,
        }
      )
      .subscribe((res) => {
        console.log(res);
        // If the answers match, navigate to the reset password page
        if (res['message'] === 'success') {
          this.router.navigate(['/session/reset-password'], {
            queryParams: { isAuthenticated: 'true', username: this.username },
            skipLocationChange: true,
          });
          // If the answers do not match, display an error message
        } else {
          this.errorMessages = [
            {
              severity: 'error',
              summary: 'Error',
              detail: 'Unable to verify security question answers',
            },
          ];
          console.log('Unable to verify security question answers');
        }
      });
  }
}

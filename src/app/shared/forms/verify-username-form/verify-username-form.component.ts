/*
============================================
; Title:  verify-username-form.component.ts
; Author: Professor Krasso
; Date: 23 Sep 2021
; Modified By: Kevin Jones
; Description: Verify username component file
;===========================================
*/

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Message } from 'primeng/api/message';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-verify-username-form',
  templateUrl: './verify-username-form.component.html',
  styleUrls: ['./verify-username-form.component.css'],
})
export class VerifyUsernameFormComponent implements OnInit {
  form: FormGroup;
  errorMessages: Message[];

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit() {
    // Form validation
    this.form = this.fb.group({
      username: [null, Validators.compose([Validators.required])],
    });
  }

  validateUsername() {
    // Get the username from the form
    const username = this.form.controls['username'].value;

    // Send the username to the server
    this.http.get(`https://${ApiService.API_HOST}/bcrs/session/verify/users/${username}`).subscribe(
      (res) => {
        console.log(res);
        // If the username is valid, redirect to the password page
        this.router.navigate(['/session/verify-security-questions'], {
          queryParams: { username: username },
          skipLocationChange: true,
        });
      },
      // If the username is invalid, display an error message
      (err) => {
        this.errorMessages = [
          { severity: 'error', summary: 'Error', detail: err['message'] },
        ];
        console.log(err);
      }
    );
  }
}

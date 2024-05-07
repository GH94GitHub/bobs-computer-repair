/*
============================================
; Title:  base-layout.component.ts
; Author: Professor Krasso
; Date: 17 Sep 2021
; Modified By: George Henderson, Kevin Jones
; Description: Base layout component file
;===========================================
*/

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { RoleService } from '../services/role.service';

@Component({
  selector: 'app-base-layout',
  templateUrl: './base-layout.component.html',
  styleUrls: ['./base-layout.component.css'],
})
export class BaseLayoutComponent implements OnInit {
  year: number = Date.now();
  userRole: string;
  isAdmin: boolean;
  username: string;

  constructor(
    private cookieService: CookieService,
    private router: Router,
    private roleService: RoleService
  ) { }
  ngOnInit(): void {
    this.username = this.cookieService.get('session_user');

    // get the user role in order to control access permissions
    this.roleService
      .findUserRole(this.cookieService.get('session_user'))
      .subscribe((res) => {
        const role = res['data'].role;
        this.userRole = role;
        if(role === "admin")
          // Set state
          this.isAdmin = true;
      });
  }
  /**
   * Deletes all users cookies, and sends them to the sign in page.
   */
  signOut() {
    this.cookieService.deleteAll();
    this.router.navigate(['/session/signin']);
  }
}

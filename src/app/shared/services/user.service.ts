/*
============================================
; Title:  user.service.ts
; Author: Professor Krasso
; Modified by: George Henderson, Kevin Jones
; Date: 17 Sep 2021
; Description: User service file
;===========================================
*/

import { Injectable } from '@angular/core';
import { User } from './../interfaces/user.interface';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient) {}

  // find all users in the database through the api
  findAllUsers(): Observable<any> {
    return this.http.get(`http://${ApiService.API_HOST}/bcrs/users`);
  }

  // find all users by id in the database through the api
  findUserById(userId: string): Observable<any> {
    return this.http.get(`http://${ApiService.API_HOST}/bcrs/users/${userId}`);
  }

  // create a new user
  createUser(user: User): Observable<any> {
    return this.http.post(`http://${ApiService.API_HOST}/bcrs/users/`, {
      userName: user.userName,
      password: user.password,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      address: user.address,
      email: user.email,
      role: user.role,
    });
  }

  // update a user
  updateUser(userId: string, user: User): Observable<any> {
    return this.http.put(`http://${ApiService.API_HOST}/bcrs/users/${userId}`, {
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      address: user.address,
      email: user.email,
      role: user.role,
    });
  }

  // delete a user
  deleteUser(userId: string): Observable<any> {
    return this.http.delete(`http://${ApiService.API_HOST}/bcrs/users/${userId}`);
  }
}

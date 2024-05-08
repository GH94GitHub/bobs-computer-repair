/*
============================================
; Title:  role.service.ts
; Author: Professor Krasso
; Modified by: George Henderson, Kevin Jones
; Date: 30 Sep 2021
; Description: Role service file
;===========================================
*/

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Role } from '../interfaces/role.interface';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  constructor(private http: HttpClient) {}

  // get all roles
  findAllRoles(): Observable<any> {
    return this.http.get(`${ApiService.API_HOST}/api/roles`);
  }

  // get role by id
  findRoleById(roleId: string): Observable<any> {
    return this.http.get(`${ApiService.API_HOST}/api/roles/${roleId}`);
  }

  // create new role
  createRole(role: Role): Observable<any> {
    return this.http.post(`${ApiService.API_HOST}/api/roles`, {
      text: role.text,
    });
  }

  // update role
  updateRole(roleId: string, role: Role): Observable<any> {
    return this.http.put(`${ApiService.API_HOST}/api/roles/${roleId}`, {
      text: role.text,
    });
  }

  // delete role
  deleteRole(roleId: string): Observable<any> {
    return this.http.delete(`${ApiService.API_HOST}/api/roles/${roleId}`);
  }

  // find user role by user id
  findUserRole(userName: string): Observable<any> {
    return this.http.get(`${ApiService.API_HOST}/api/users/${userName}/role`);
  }
}

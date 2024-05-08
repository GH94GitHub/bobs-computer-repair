/**
 * Date: 16 September 2021
 * Title: security-question.service.ts
 * Author: Fred Marble
 * Description: Creating the Security Question Service.
 */

import { Injectable } from '@angular/core';
import { SecurityQuestion } from '../interfaces/security-question.interface';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class SecurityQuestionService {

  constructor(private http: HttpClient) { }

  findAllSecurityQuestions(): Observable<any> {
    return this.http.get(`http://${ApiService.API_HOST}/bcrs/security-questions`);
  }

  findSecurityQuestionById(questionId: string): Observable<any>{
    return this.http.get(`http://${ApiService.API_HOST}/bcrs/security-questions/${questionId}`);
  }

  createSecurityQuestion(newSecurityQuestion: SecurityQuestion): Observable<any>{
    return this.http.post(`http://${ApiService.API_HOST}/bcrs/security-questions`, {
      text: newSecurityQuestion.text
    })
  }

  updateSecurityQuestion(questionId: string, updatedSecurityQuestion: SecurityQuestion): Observable<any>{
    return this.http.put(`http://${ApiService.API_HOST}/bcrs/security-questions/${questionId}`, {
      text: updatedSecurityQuestion.text
    })
  }

  deleteSecurityQuestion(questionId: string): Observable<any>{
    return this.http.delete(`http://${ApiService.API_HOST}/bcrs/security-questions/${questionId}`);
  }
}

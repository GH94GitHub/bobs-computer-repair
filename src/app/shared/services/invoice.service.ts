/*
============================================
; Title:  invoice.service.ts
; Author: Professor Krasso
; Modified by: George Henderson, Kevin Jones
; Date: 1 Oct 2021
; Description: Invoice service file
;===========================================
*/

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Invoice } from '../interfaces/invoice.interface';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class InvoiceService {
  constructor(private http: HttpClient) {}

  // post invoice to the database
  createInvoice(userName: string, invoice: Invoice): Observable<any> {
    return this.http.post(`http://${ApiService.API_HOST}/bcrs/invoices/${userName}`, {
      userName: userName,
      lineItems: invoice.getLineItems(),
      partsAmount: invoice.partsAmount,
      laborAmount: invoice.getLaborAmount(),
      lineItemTotal: invoice.getLineItemTotal(),
      total: invoice.getTotal(),
    });
  }

  // route to the graph
  findPurchasesByServiceGraph(): Observable<any> {
    return this.http.get(`http://${ApiService.API_HOST}/bcrs/invoices/purchases-graph`);
  }
}

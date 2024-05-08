/*
============================================
; Title:  home.component.ts
; Author: Professor Krasso
; Modified By: Tony Henderson
; Date: 18 Sep 2021
; Description: Home component TS file
;===========================================
*/

import { Component, OnInit, ViewChild } from '@angular/core';
import { ProductService } from '../../shared/services/product.service';
import { IProduct } from '../../shared/interfaces/product.interface';
import { MatDialog } from '@angular/material/dialog';
import { AddInvoiceItemDialogComponent } from 'src/app/shared/add-invoice-item-dialog/add-invoice-item-dialog.component';
import { MatTable } from '@angular/material/table';
import { Invoice } from '../../shared/interfaces/invoice.interface';
import { CookieService } from 'ngx-cookie-service';
import { InvoiceDialogComponent } from '../..//shared/invoice-dialog/invoice-dialog.component';
import { HttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { PrintInvoiceDialogComponent } from 'src/app/shared/print-invoice-dialog/print-invoice-dialog.component';
import { ApiService } from 'src/app/shared/services/api.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers: [MessageService]
})
export class HomeComponent implements OnInit {

//---------------------- Variables
  displayedColumns: Array<string> = [ 'name', 'price', 'functions'];

  total: number = 0;
  products: Array<IProduct>
  @ViewChild(MatTable) table: MatTable<any>;
  dataTableSource = [];

  invoice: Invoice;
//---------------------- Constructor

  constructor(
    private productService: ProductService,
    private messageService: MessageService,
    private dialog: MatDialog,
    private http: HttpClient,
    private cookieService: CookieService)
  {
    this.products = productService.getProducts();

    this.invoice = new Invoice(cookieService.get('session_user'));
  }

  ngOnInit(): void {}

//---------------------- Functions

/**
 * Opens dialog with a form allowing the user to add a requested service to the invoice.
 */
  addServiceDialog(): void {
    let dialogRef = this.dialog.open(AddInvoiceItemDialogComponent, {
      disableClose: true
    });

    // Add the new item to the datatable and the running invoice
    dialogRef.afterClosed().subscribe(service => {
      if (service) {

        this.addToInvoice(service.title, service.price, service.parts, service.hours);

        console.log('-- invoice after dialog close --');
        console.log(this.invoice);
      }
    })
  }

/**
 * Helper that adds specified item to the running invoice
 * @param item
 */
  addToInvoice(title: string, price: number, parts?: number, hours?: number) {

    // newServiceObject
    let newService = {
      title: title,
      price: price
    }

    // If the item is custom add the parts and hours value to the newService object.
    if(parts) newService['parts'] = parts;
    if(hours) newService['hours'] = hours;

    // Add the newService to the datatable and refresh
    this.dataTableSource.push(newService);
    this.table.renderRows();

    // Add partsAmount and laborAmount to the running invoice
    this.invoice.partsAmount += ( Number(parts) || 0 );
    this.invoice.laborHours += (Number(hours) || 0 );

    // Add the item to the invoice.lineItems
    if (newService['parts'] === undefined && newService['hours'] === undefined) {
      console.log('This is a lineItem!')
      this.invoice.addToLineItems(newService);
    }

    // Add to the running invoice total
    this.total += Number(price);

    // Log invoice after changes
    console.log('-- Invoice after adding --');
    console.log(this.invoice);
  }

  /**
   * Helper that resets the home page for a new transaction.
   */
  reset() {
    this.dataTableSource = [];
    this.table.renderRows();
    this.total = 0;
    this.invoice.clear();
  }

  /**
   * Creates an invoice and shows the invoice summary.
   */
  placeOrder() {

    // Add invoice to database
    this.http.post(ApiService.API_HOST + '/bcrs/invoices/' + this.cookieService.get('session_user'), {
      lineItems: this.invoice.getLineItems(),
      partsAmount: this.invoice.partsAmount,
      laborAmount: this.invoice.getLaborAmount(),
      lineItemTotal: this.invoice.getLineItemTotal(),
      total: this.invoice.getTotal()
    }).subscribe( res => { // Success
      // Success Toast
      this.messageService.add(
        { severity: 'success', summary: 'Success', detail: `Created invoice with the amount of $${Math.round((this.invoice.getTotal() + Number.EPSILON) * 100) / 100}` },
      )
      // Open Invoice Summary Dialog
      let dialogRef = this.dialog.open(InvoiceDialogComponent, {
        width: '550px',
        data: this.invoice,
        disableClose: true
      });

      // When dialog is closed
      dialogRef.afterClosed().subscribe(res => {
        // Reset the invoice
        this.reset();
      })
    }, err => { // Error
      console.log(err);
    });

  }

  /**
   * Called when user clicks the delete icon next to an added item
   */
  deleteFromInvoice(index: number, title: string, price: number, parts?: number, hours?: number) {
    // Delete item from datatable and refresh
    this.dataTableSource.splice(index, 1);
    this.table.renderRows();

    // Subtract from invoice.partsAmount
    this.invoice.partsAmount -= ( Number(parts) || 0 );
    // Subtract from invoice.laborHours
    this.invoice.laborHours -= (Number(hours) || 0 );

    // Remove from invoice lineItems
    if (parts === undefined && hours === undefined) {
      this.invoice.removeFromLineItems({
        title: title,
        price: price
      })
    }

    // Subtract from invoice.total
    this.total -= Number(price);

    // Log running invoice after item was deleted
    console.log('-- Invoice after deletion --');
    console.log(this.invoice);
  }

}

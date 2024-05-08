import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  public static readonly API_HOST: string = "api.george-henderson.com";

  constructor() { }
}

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  userIsAuthenticated = true;
  private userId = 'xyz';

  constructor() { }

  getUserIsAuthenticated() {
    return this.userIsAuthenticated;
  }

  getUserId() {
    return this.userId;
  }

  login() {
    this.userIsAuthenticated = true;
  }

  logout() {
    this.userIsAuthenticated = false;
  }
}

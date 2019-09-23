import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { take, tap, delay, switchMap, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

import { AuthService } from '../auth/auth.service';
import { Booking } from 'src/app/model/places/booking/booking.model';


interface BookingData {
  bookedFrom: string;
  bookedTo: string;
  firstName: string;
  guestNumber: number;
  lastName: string;
  placeId: string;
  placeImage: string;
  placeTitle: string;
  userId: string;
}

@Injectable({ providedIn: 'root' })
export class BookingService {
  private bookings = new BehaviorSubject<Booking[]>([]);

  getBookings() {
    return this.bookings.asObservable();
  }

  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) {

  }

  addBooking(
    placeId: string,
    placeTitle: string,
    placeImage: string,
    firstName: string,
    lastName: string,
    guestNumber: number,
    dateFrom: Date,
    dateTo: Date
  ) {
    let generatedId: string;
    const newBooking = new Booking(
      Math.random().toString(),
      placeId,
      this.authService.getUserId(),
      placeTitle,
      placeImage,
      firstName,
      lastName,
      guestNumber,
      dateFrom,
      dateTo
    );
    return this.http.post<{ name: string }>('https://ionic-angular-course-1bcb3.firebaseio.com/bookings.json',
      { ...newBooking, id: null }
    ).pipe(switchMap(resData => {
      generatedId = resData.name;
      return this.bookings
    }),
      take(1),
      tap(bookings => {
        this.bookings.next(bookings.concat(newBooking));
      })
    );
  }

  cancelBooking(bookingId: string) {
    return this.http.delete(
      `https://ionic-angular-course-1bcb3.firebaseio.com/bookings/${bookingId}.json`
    ).pipe(switchMap(() => {
      return this.bookings;
    }), take(1),
      tap(bookings => {
        this.bookings.next(bookings.filter(b => b.id !== bookingId));
      }));
  }

  fetchBookings() {
    return this.http.get<{ [key: string]: BookingData }>(
      `https://ionic-angular-course-1bcb3.firebaseio.com/bookings.json?orderBy="userId"&equalTo="${this.authService.getUserId()}"`)
      .pipe(map(
        bookingData => {
          const bookings = [];
          for (const key in bookingData) {
            if (bookingData.hasOwnProperty(key)) {
              bookings.push(
                new Booking(
                  key,
                  bookingData[key].placeId,
                  bookingData[key].userId,
                  bookingData[key].placeTitle,
                  bookingData[key].placeImage,
                  bookingData[key].firstName,
                  bookingData[key].lastName,
                  bookingData[key].guestNumber,
                  new Date(bookingData[key].bookedFrom),
                  new Date(bookingData[key].bookedTo)
                )
              )
            }
          }
          return bookings;
        }), tap(bookings => {
          this.bookings.next(bookings);
        })
      )
  }
}

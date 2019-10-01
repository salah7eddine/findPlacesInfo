import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { take, map, tap, delay, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';


import { PlaceModule } from './../../model/places/PlaceModule';
import { AuthService } from './../auth/auth.service';
import { PlaceLocation } from 'src/app/model/places/location.model';

/* new PlaceModule(
  'p1',
  'Manhattan Mansion',
  'In the heart of New York City.',
  'https://www.gannett-cdn.com/presto/2019/07/10/USAT/fb8153c0-5248-45ba-a934-17ee45327263-AP_Financier_Teenage_Girls.JPG?crop=4432,2539,x0,y1444&width=3200&height=1680&fit=bounds',
  149.99,
  new Date('2019-01-01'),
  new Date('2019-12-31'),
  'abc'
),
  new PlaceModule(
    'p2',
    'kipe Love',
    'A romantic place in Paris',
    'https://news.chastin.com/wp-content/uploads/2018/11/paris.jpg',
    189.99,
    new Date('2019-01-01'),
    new Date('2019-12-31'),
    'abc'
  ),
  new PlaceModule(
    'p3',
    'The Foggy Palace',
    'Not your average city trip!',
    'https://i1.trekearth.com/photos/138102/dsc_0681.jpg',
    99.99,
    new Date('2019-01-01'),
    new Date('2019-12-31'),
    'abc'
  ) */




interface PlaceData {
  availableFrom: string;
  availableTo: string;
  description: string;
  imageUrl: string;
  price: number;
  title: string;
  userId: string;
  location: PlaceLocation
}


@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  placesData = new BehaviorSubject<PlaceModule[]>([]);

  getPlaces() {
    return this.placesData.asObservable();
  }

  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) { }


  fetchPlaces() {
    return this.authService.getToken().pipe(
      take(1),
      switchMap(token => {
        return this.http.get<{ [key: string]: PlaceData }>(`https://ionic-angular-course-1bcb3.firebaseio.com/offered-places.json?auth=${token}`)
      }), map(resData => {
        const places = [];
        for (const key in resData) {
          if (resData.hasOwnProperty(key)) {
            places.push(
              new PlaceModule(
                key,
                resData[key].title,
                resData[key].description,
                resData[key].imageUrl,
                resData[key].price,
                new Date(resData[key].availableFrom),
                new Date(resData[key].availableTo),
                resData[key].userId,
                resData[key].location
              )
            );
          }
        }
        return places;
      }),
      tap(places => {
        this.placesData.next(places);
      })
    );
  }

  getPlace(id: string) {
    return this.authService.getToken().pipe(
      take(1),
      switchMap(token => {
        return this.http.get<PlaceModule>(`https://ionic-angular-course-1bcb3.firebaseio.com/offered-places/${id}.json?auth=${token}`)
      }),
      map(placeData => {
        return new PlaceModule(
          id,
          placeData.title,
          placeData.description,
          placeData.imageUrl,
          placeData.price,
          new Date(placeData.availableFrom),
          new Date(placeData.availableTo),
          placeData.userId,
          placeData.location
        );
      })
    );
  }

  uploadImage(image: File) {
    const uploadData = new FormData();
    uploadData.append('image', image);

    return this.authService.getToken().pipe(
      take(1),
      switchMap(token => {
        return this.http.post<{ imageUrl: string, imagePath: string }>(
          'https://us-central1-ionic-angular-course-1bcb3.cloudfunctions.net/storeImage', uploadData,
          { headers: { Authorization: 'Bearer ' + token } }
        );
      }))
  }

  addPlace(
    title: string,
    description: string,
    price: number,
    dateForm: Date,
    dateTo: Date,
    location: PlaceLocation,
    imageUrl: string
  ) {
    let generateId: string;
    let fetchedUserId: string;
    let newPlace: PlaceModule
    return this.authService.getUserId().pipe(
      take(1),
      switchMap(userId => {
        fetchedUserId = userId;
        return this.authService.getToken();
      }),
      take(1),
      switchMap(token => {
        if (!fetchedUserId) {
          throw new Error('No user found!');
        }

        newPlace = new PlaceModule(
          Math.random().toString(),
          title,
          description,
          imageUrl,
          price,
          dateForm,
          dateTo,
          fetchedUserId,
          location
        );

        return this.http.post<{ name: string }>(
          `https://ionic-angular-course-1bcb3.firebaseio.com/offered-places.json?auth=${token}`,
          {
            ...newPlace,
            id: null
          })
      }), switchMap(resData => {
        generateId = resData.name;
        return this.placesData;
      }),
      take(1),
      tap(places => {
        newPlace.id = generateId;
        this.placesData.next(places.concat(newPlace));
      })
    );
    /* return this.placesData.pipe(take(1), delay(1000), tap(places => {
      setTimeout(() => {
        this.placesData.next(places.concat(newPlace));
      }, 1000);
    })); */
  }

  updatePlace(placeId: string, title: string, description: string) {
    let updatedPlaces: PlaceModule[];
    let fetchedToken: string;
    return this.authService.getToken().pipe(
      take(1),
      switchMap(
        token => {
          fetchedToken = token;
          return this.placesData;
        }),
      take(1),
      switchMap(places => {
        if (!places || places.length <= 0) {
          return this.fetchPlaces();
        } else {
          return of(places);
        }
      }),
      switchMap(places => {
        const updatedPlaceIndex = places.findIndex(pl => pl.id === placeId);
        updatedPlaces = [...places];
        const oldPlace = updatedPlaces[updatedPlaceIndex];
        updatedPlaces[updatedPlaceIndex] = new PlaceModule(
          oldPlace.id,
          title,
          description,
          oldPlace.imageUrl,
          oldPlace.price,
          oldPlace.availableFrom,
          oldPlace.availableTo,
          oldPlace.userId,
          oldPlace.location
        );
        return this.http.put(
          `https://ionic-angular-course-1bcb3.firebaseio.com/offered-places/${placeId}.json?auth=${fetchedToken}`,
          { ...updatedPlaces[updatedPlaceIndex], id: null }
        );
      }),
      tap(() => {
        this.placesData.next(updatedPlaces);
      }));
  }
}

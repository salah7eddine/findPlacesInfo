import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export enum SearchType {
  all = '',
  movie = 'movie',
  series = 'series',
  episode = 'episode'
}

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  apiKey = "38367489"; // <-- Enter your own key here!
  url: string = "http://www.omdbapi.com/";

  constructor(private http: HttpClient) { }

  searchData(title: string, type: SearchType): Observable<any> {
    return this.http.get(`${this.url}?s=${encodeURI(title)}&type=${type}&apikey=${this.apiKey}`)
      .pipe(
        map(results => {
          return results['Search'];
        })
      );
  }

  getDetails(id) {
    return this.http.get(`${this.url}?i=${id}&plot=full&apikey=${this.apiKey}`);
  }
}

import { Component, OnInit, OnDestroy } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { SegmentChangeEventDetail } from '@ionic/core';
import { Subscription } from 'rxjs';

import { PlaceModule } from './../../model/places/PlaceModule';
import { PlacesService } from './../../services/places/places.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.page.html',
  styleUrls: ['./discover.page.scss']
})
export class DiscoverPage implements OnInit, OnDestroy {
  loadedPlaces: PlaceModule[];
  listedLodedPlaces: PlaceModule[];
  relevantPlaces: PlaceModule[];
  isLoading = false;
  private placesSub: Subscription;

  constructor(
    private placesService: PlacesService,
    private menuCtrl: MenuController,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.placesSub = this.placesService.fetchPlaces().subscribe(places => {
      this.loadedPlaces = places;
      this.relevantPlaces = this.loadedPlaces;
      this.listedLodedPlaces = this.relevantPlaces.slice(1);
    });
  }

  ionViewWillEnter() {
    this.isLoading = true;
    this.placesService.fetchPlaces().subscribe(() => {
      this.isLoading = false;
    });
  }

  onOpenMenu() {
    // this.menuCtrl.close('m1');
    // this.menuCtrl.open('m1');
    this.menuCtrl.toggle('m1');
  }

  onFilterUpdate(event: CustomEvent<SegmentChangeEventDetail>) {
    this.authService
      .getUserId()
      .pipe(
        take(1)
      )
      .subscribe(userId => {
        if (event.detail.value === 'all') {
          this.relevantPlaces = this.loadedPlaces;
          if (this.relevantPlaces) {
            this.listedLodedPlaces = this.relevantPlaces.slice(1);
          }
        } else {
          this.relevantPlaces = this.loadedPlaces.filter(
            place => place.userId !== userId
          );
          if (this.relevantPlaces) {
            this.listedLodedPlaces = this.relevantPlaces.slice(1);
          }
        }
      });
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if (this.placesSub) {
      this.placesSub.unsubscribe();
    }
  }
}

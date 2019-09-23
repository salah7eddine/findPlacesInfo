import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Plugins, Capacitor } from '@capacitor/core';


import { environment } from 'src/environments/environment';
import { ModalController, ActionSheetController, AlertController } from '@ionic/angular';
import { PlaceLocation, Coordinates } from '../../../model/places/location.model';
import { MapModalComponent } from '../../map-modal/map-modal.component';

@Component({
  selector: 'app-location-picker',
  templateUrl: './location-picker.component.html',
  styleUrls: ['./location-picker.component.scss'],
})
export class LocationPickerComponent implements OnInit {

  placeLocation: any;
  @Output() locationPick = new EventEmitter<PlaceLocation>();
  @Input() showPreview = false;
  selectedLocationImage: string;
  isLoading = false;

  constructor(
    private modalCtrl: ModalController,
    private http: HttpClient,
    private actionSheetCtrl: ActionSheetController,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() { }

  onPickLocation() {
    this.actionSheetCtrl.create({
      header: 'Please Choose',
      buttons: [
        {
          text: 'Auto-Locate',
          handler: () => {
            this.locateUser();
          }
        },
        {
          text: 'Pick on Map',
          handler: () => {
            this.openMap();
          }
        },
        { text: 'Cancel', role: 'cancel' }
      ]
    }).then(actionSheetEl => {
      actionSheetEl.present();
    });
  }

  private locateUser() {
    if (!Capacitor.isPluginAvailable('Geolocation')) {
      this.showErrorAlert();
      return;
    }
    this.isLoading = true;
    Plugins
      .Geolocation
      .getCurrentPosition()
      .then(geoPosition => {
        const coordinates: Coordinates =
          { lat: geoPosition.coords.latitude, lng: geoPosition.coords.longitude };
        this.createPlace(coordinates.lat, coordinates.lng);
        this.isLoading = false
      })
      .catch(err => {
        this.showErrorAlert();
      });
  }

  private showErrorAlert() {
    this.alertCtrl.create({
      header: 'Could not fetch location',
      message: 'Please use the map to pick a location!',
      buttons: ['Okay']
    }).then(alert => alert.present());
  }

  private openMap() {
    this.modalCtrl.create({ component: MapModalComponent }).then(modalEl => {
      modalEl.present();
      modalEl.onDidDismiss().then(modalData => {
        if (!modalData.data) {
          return;
        }
        const coordinates: Coordinates = {
          lat: modalData.data.lat,
          lng: modalData.data.lng
        };
        modalData.role = 'pick';
        this.createPlace(coordinates.lat, coordinates.lng);
      })
    })
  }

  createPlace(lat: number, lng: number) {
    this.placeLocation = {
      lat: lat,
      lng: lng,
      staticMapImageUrl: null,
      address: null
    };

    let url = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/${this.placeLocation.lng},${this.placeLocation.lat},10,1,1/300x200@2x?access_token=${environment.mapboxApiKey}`;

    this.http.get(url).subscribe(data => {
      this.isLoading = false;
    }, err => {
      this.selectedLocationImage = err.url;
      this.isLoading = false;
      this.locationPick.emit(this.placeLocation);
    });
  }
}

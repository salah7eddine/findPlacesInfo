import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Renderer2, OnDestroy, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { resolve, reject } from 'q';

import { Map, latLng, tileLayer, Layer, marker, canvas, Canvas } from 'leaflet';



@Component({
  selector: 'app-map-modal',
  templateUrl: './map-modal.component.html',
  styleUrls: ['./map-modal.component.scss'],
})
export class MapModalComponent implements OnInit, AfterViewInit {

  @Input() pos: any = [31.791702, -7.092620000000011];
  @Input() selectable = true;
  @Input() closeButtonText = 'Cancel';
  @Input() title = 'Pick Location';
  map: Map;
  mapCanvas: any;
  googleMaps: any;

  clickListenner: any;

  /* @ViewChild('map') mapElementRef: ElementRef; */


  ionViewDidEnter() { this.leafletMap(); }

  constructor(private modalCtrl: ModalController, private renderer: Renderer2) { }

  ngOnInit() { }

  leafletMap() {
    // In setView add latLng and zoom
    this.map = new Map('mapId').setView(this.pos, 12);
    // http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png
    // http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}
    this.mapCanvas = tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'map in ionic with LeafLet',
    });

    this.mapCanvas.addTo(this.map);


    marker(this.pos).addTo(this.map)
      .bindPopup('Ionic 4 <br> Leaflet.')
      .openPopup();

    /*   for (let property of this.propertyList) {
        marker([property.lat, property.long]).addTo(this.map)
          .bindPopup(property.city)
          .openPopup();
      } */

    this.clickListenner = this.map.on('click', (e) => { this.onMapClick(e) })
  }

  onMapClick(e) {
    let selectedCoords = { lat: e.latlng.lat, lng: e.latlng.lng };
    if (this.selectable) {
      this.modalCtrl.dismiss(selectedCoords);
    }
  }

  /** Remove map when we have multiple map object */
  ionViewWillLeave() {
    this.map.remove();
  }

  ngAfterViewInit() {
    /* this.getGoogleMaps().then(googleMaps => {
      const mapEl = this.mapElementRef.nativeElement;
      const map = new googleMaps.Map(mapEl, {
        center: { lat: -34.397, lng: 150.644 },
        zoom: 16
      });

      googleMaps.event.addListenerOnce(map, 'idle', () => {
        this.renderer.addClass(mapEl, 'visible');
      });

    }).catch(err => {
      console.log(err);
    }); */
  }

  onCancel() {
    this.modalCtrl.dismiss();
  }

  /*  OnDestroy() {
 
   } */

  /*  private getGoogleMaps(): Promise<any> {
     const win = window as any;
     const googleModule = win.google;
 
     if (googleModule && googleModule.maps) {
       return Promise.resolve(googleModule.maps);
     }
     return new Promise((res, rej) => {
       const script = document.createElement('script');
       script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyAe34bpCI41s9jXVQYkTdwu-drEI57C65Q';
       script.async = true;
       script.defer = true;
       document.body.appendChild(script);
       script.onload = () => {
         const loadedGoogeModule = win.google;
         if (loadedGoogeModule && loadedGoogeModule.maps) {
           resolve(loadedGoogeModule.maps);
         } else {
           reject('Google maps SDK not available.');
         }
       };
 
     })
   } */

}

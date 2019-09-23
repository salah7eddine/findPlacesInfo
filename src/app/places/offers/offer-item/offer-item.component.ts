import { Component, OnInit, Input } from '@angular/core';
import { PlaceModule } from './../../../model/places/PlaceModule';

@Component({
  selector: 'app-offer-item',
  templateUrl: './offer-item.component.html',
  styleUrls: ['./offer-item.component.scss']
})
export class OfferItemComponent implements OnInit {
  @Input() offer: PlaceModule;

  constructor() { }

  ngOnInit() { }


}

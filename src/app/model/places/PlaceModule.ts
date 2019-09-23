import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlaceLocation } from './location.model';
@NgModule({
  declarations: [],
  imports: [CommonModule]
})

export class PlaceModule {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public imageUrl: string,
    public price: number,
    public availableFrom: Date,
    public availableTo: Date,
    public userId: string,
    public location: PlaceLocation
  ) { }
}

import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { GuardGuard } from './services/auth/guard.guard';

const routes: Routes = [
  // { path: '', redirectTo: 'places', pathMatch: 'full' },
  { path: '', redirectTo: 'places', pathMatch: 'full' },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule)
  },
  { path: 'auth', loadChildren: './auth/auth.module#AuthPageModule' },
  {
    path: 'places',
    loadChildren: './places/places.module#PlacesPageModule',
    canLoad: [GuardGuard]
  },
  {
    path: 'bookings',
    loadChildren: './bookings/bookings.module#BookingsPageModule',
    canLoad: [GuardGuard]
  },
  {
    path: 'movies', loadChildren: './movies/movies/movies.module#MoviesPageModule', canLoad: [GuardGuard]
  },
  {
    path: 'movies/:id', loadChildren: './movies/movie-details/movie-details.module#MovieDetailsPageModule', canLoad: [GuardGuard]
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }


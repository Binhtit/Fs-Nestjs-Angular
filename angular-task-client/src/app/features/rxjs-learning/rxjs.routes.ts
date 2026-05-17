import { Routes } from '@angular/router';

export const RXJS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/rxjs-list.component').then((m) => m.RxjsListComponent),
  },
];

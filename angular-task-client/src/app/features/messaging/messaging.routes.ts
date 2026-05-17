import { Routes } from '@angular/router';

export const MESSAGING_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/messaging-list.component').then((m) => m.MessagingListComponent),
  },
];

/** Tasks Routes — Lazy loaded */
import { Routes } from '@angular/router';

export const TASKS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/task-list.component').then((m) => m.TaskListComponent),
  },
];

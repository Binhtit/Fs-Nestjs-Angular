/**
 * Task Service — Kế thừa BaseApiService
 *
 * SCALABLE: Chỉ cần set endpoint + thêm methods đặc biệt
 * BaseApiService đã có sẵn: getAll, getById, create, update, delete
 */
import { Injectable } from '@angular/core';
import { BaseApiService } from '@core/services/base-api.service';
import { Task } from '@core/models/task.model';

@Injectable({ providedIn: 'root' })
export class TaskService extends BaseApiService<Task> {
  protected endpoint = '/tasks';
}

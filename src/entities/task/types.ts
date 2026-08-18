import { User } from '@/entities/user/types';

export type TaskStatus = 'new' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface TaskComment {
  id: string;
  author: User;
  text: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  address: string;
  latitude: number;
  longitude: number;
  dueDate: string;
  assignee: User;
  images: string[];
  comments: TaskComment[];
}

export interface TaskFilters {
  search: string;
  status: TaskStatus | 'all';
  priority: TaskPriority | 'all';
}

export interface TaskListResponse {
  items: Task[];
  page: number;
  totalPages: number;
  total: number;
}

export interface CreateTaskPayload {
  title: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
}

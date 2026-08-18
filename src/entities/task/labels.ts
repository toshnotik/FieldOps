import { TaskPriority, TaskStatus } from './types';

export const taskStatusLabels: Record<TaskStatus, string> = {
  new: 'Новая',
  in_progress: 'В работе',
  done: 'Готово'
};

export const taskPriorityLabels: Record<TaskPriority, string> = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий'
};

export const taskStatusColors: Record<TaskStatus, string> = {
  new: '#2563EB',
  in_progress: '#D97706',
  done: '#059669'
};

export const taskPriorityColors: Record<TaskPriority, string> = {
  low: '#64748B',
  medium: '#7C3AED',
  high: '#DC2626'
};

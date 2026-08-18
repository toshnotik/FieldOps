import { Task } from '@/entities/task/types';
import { User } from '@/entities/user/types';

export const currentUser: User = {
  id: 'u-1',
  name: 'Алексей Орлов',
  email: 'tech@fieldops.local',
  role: 'Старший техник'
};

export const users: User[] = [
  currentUser,
  {
    id: 'u-2',
    name: 'Мария Белова',
    email: 'maria@fieldops.local',
    role: 'Инженер'
  }
];

export const initialTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Ремонт оборудования',
    description: 'Проверить шкаф управления, заменить поврежденный блок питания и зафиксировать результат фотоотчетом.',
    status: 'in_progress',
    priority: 'high',
    address: 'ул. Ленина, 15',
    latitude: 55.751244,
    longitude: 37.618423,
    dueDate: '2026-08-18T14:00:00.000Z',
    assignee: currentUser,
    images: [],
    comments: [
      {
        id: 'comment-1',
        author: users[1],
        text: 'Клиент подтвердил доступ на объект после 13:30.',
        createdAt: '2026-08-18T08:30:00.000Z'
      }
    ]
  },
  {
    id: 'task-2',
    title: 'Осмотр насосной станции',
    description: 'Снять показатели давления, проверить журнал аварий и состояние резервного насоса.',
    status: 'new',
    priority: 'medium',
    address: 'пр-т Мира, 22',
    latitude: 55.779744,
    longitude: 37.633186,
    dueDate: '2026-08-19T09:15:00.000Z',
    assignee: users[1],
    images: [],
    comments: []
  },
  {
    id: 'task-3',
    title: 'Плановое ТО вентиляции',
    description: 'Заменить фильтры, проверить вибрацию двигателя и обновить наклейку обслуживания.',
    status: 'done',
    priority: 'low',
    address: 'Никольская ул., 8',
    latitude: 55.757865,
    longitude: 37.62101,
    dueDate: '2026-08-17T16:00:00.000Z',
    assignee: currentUser,
    images: [],
    comments: [
      {
        id: 'comment-2',
        author: currentUser,
        text: 'Работы завершены, фильтры заменены.',
        createdAt: '2026-08-17T15:45:00.000Z'
      }
    ]
  },
  {
    id: 'task-4',
    title: 'Проверка датчиков доступа',
    description: 'Протестировать датчики на входной группе и настроить задержку закрытия.',
    status: 'new',
    priority: 'high',
    address: 'Тверская ул., 11',
    latitude: 55.763908,
    longitude: 37.608913,
    dueDate: '2026-08-20T12:00:00.000Z',
    assignee: currentUser,
    images: [],
    comments: []
  }
];

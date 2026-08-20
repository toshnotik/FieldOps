import { CreateTaskPayload, Task, TaskFilters, TaskListResponse, TaskRealtimeEvent, TaskStatus } from '@/entities/task/types';
import { currentUser, initialTasks } from './mockData';
import { sleep } from '@/shared/lib/sleep';
import { taskRealtime } from './realtime';

let accessToken: string | null = null;
let tasks: Task[] = [...initialTasks];
const statuses: TaskStatus[] = ['new', 'in_progress', 'done'];
type LocalTaskSource = Exclude<TaskRealtimeEvent['source'], 'remote'>;

function ensureAuth() {
  if (!accessToken) {
    throw new Error('Необходима авторизация');
  }
}

function filterTasks(filters: TaskFilters) {
  const query = filters.search.trim().toLowerCase();

  return tasks.filter((task) => {
    const matchesSearch =
      !query ||
      task.title.toLowerCase().includes(query) ||
      task.address.toLowerCase().includes(query) ||
      task.description.toLowerCase().includes(query);
    const matchesStatus = filters.status === 'all' || task.status === filters.status;
    const matchesPriority = filters.priority === 'all' || task.priority === filters.priority;

    return matchesSearch && matchesStatus && matchesPriority;
  });
}

export const apiClient = {
  setToken(token: string | null) {
    accessToken = token;
  },

  auth: {
    async login(email: string, password: string) {
      await sleep(450);

      if (!email.includes('@') || password.length < 6) {
        throw new Error('Проверьте email и пароль');
      }

      accessToken = `mock-token-${Date.now()}`;
      return {
        accessToken,
        user: currentUser
      };
    },

    async me() {
      await sleep(250);
      ensureAuth();
      return currentUser;
    }
  },

  tasks: {
    async getTasks(filters: TaskFilters, page = 1, pageSize = 8): Promise<TaskListResponse> {
      await sleep(350);
      ensureAuth();

      const filtered = filterTasks(filters).sort((a, b) => Date.parse(a.dueDate) - Date.parse(b.dueDate));
      const start = (page - 1) * pageSize;
      const items = filtered.slice(start, start + pageSize);

      return {
        items,
        page,
        totalPages: Math.max(1, Math.ceil(filtered.length / pageSize)),
        total: filtered.length
      };
    },

    async getAllTasks() {
      await sleep(250);
      ensureAuth();
      return [...tasks];
    },

    async getTask(id: string) {
      await sleep(250);
      ensureAuth();
      const task = tasks.find((item) => item.id === id);

      if (!task) {
        throw new Error('Задача не найдена');
      }

      return task;
    },

    async createTask(payload: CreateTaskPayload) {
      await sleep(350);
      ensureAuth();

      const task: Task = {
        ...payload,
        id: `task-${Date.now()}`,
        assignee: currentUser,
        images: [],
        comments: []
      };

      tasks = [task, ...tasks];
      taskRealtime.emit({ type: 'task.created', task, source: 'local' });
      return task;
    },

    async updateStatus(id: string, status: TaskStatus, options: { source?: LocalTaskSource } = {}) {
      await sleep(300);
      ensureAuth();

      tasks = tasks.map((task) => (task.id === id ? { ...task, status } : task));
      const task = tasks.find((task) => task.id === id)!;
      taskRealtime.emit({ type: 'task.status_changed', task, source: options.source ?? 'local' });
      return task;
    },

    async addImage(id: string, uri: string) {
      await sleep(300);
      ensureAuth();

      tasks = tasks.map((task) => (task.id === id ? { ...task, images: [uri, ...task.images] } : task));
      const task = tasks.find((task) => task.id === id)!;
      taskRealtime.emit({ type: 'task.updated', task, source: 'local' });
      return task;
    },

    async addComment(id: string, text: string, options: { source?: LocalTaskSource } = {}) {
      await sleep(300);
      ensureAuth();

      tasks = tasks.map((task) =>
        task.id === id
          ? {
              ...task,
              comments: [
                {
                  id: `comment-${Date.now()}`,
                  author: currentUser,
                  text,
                  createdAt: new Date().toISOString()
                },
                ...task.comments
              ]
            }
          : task
      );

      const task = tasks.find((task) => task.id === id)!;
      taskRealtime.emit({ type: 'task.updated', task, source: options.source ?? 'local' });
      return task;
    },

    simulateRemoteStatusChange() {
      const candidates = tasks.filter((task) => task.status !== 'done');

      if (!candidates.length) {
        return null;
      }

      const task = candidates[Math.floor(Math.random() * candidates.length)];
      const currentIndex = statuses.indexOf(task.status);
      const nextStatus = statuses[Math.min(currentIndex + 1, statuses.length - 1)];

      tasks = tasks.map((item) => (item.id === task.id ? { ...item, status: nextStatus } : item));
      const updated = tasks.find((item) => item.id === task.id)!;

      return {
        type: 'task.status_changed' as const,
        task: updated,
        source: 'remote' as const
      };
    }
  }
};

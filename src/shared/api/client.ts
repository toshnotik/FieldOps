import { CreateTaskPayload, Task, TaskFilters, TaskListResponse, TaskStatus } from '@/entities/task/types';
import { currentUser, initialTasks } from './mockData';
import { sleep } from '@/shared/lib/sleep';

let accessToken: string | null = null;
let tasks: Task[] = [...initialTasks];

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
      return task;
    },

    async updateStatus(id: string, status: TaskStatus) {
      await sleep(300);
      ensureAuth();

      tasks = tasks.map((task) => (task.id === id ? { ...task, status } : task));
      return tasks.find((task) => task.id === id)!;
    },

    async addImage(id: string, uri: string) {
      await sleep(300);
      ensureAuth();

      tasks = tasks.map((task) => (task.id === id ? { ...task, images: [uri, ...task.images] } : task));
      return tasks.find((task) => task.id === id)!;
    },

    async addComment(id: string, text: string) {
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

      return tasks.find((task) => task.id === id)!;
    }
  }
};

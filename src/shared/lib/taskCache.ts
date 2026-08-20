import { Task, TaskListResponse } from '@/entities/task/types';
import { QueryClient } from '@tanstack/react-query';

export function updateTaskInQueryCache(queryClient: QueryClient, task: Task) {
  queryClient.setQueryData(['task', task.id], task);

  queryClient.setQueriesData({ queryKey: ['tasks'] }, (oldData: unknown) => {
    if (!oldData || typeof oldData !== 'object') {
      return oldData;
    }

    if ('pages' in oldData && Array.isArray((oldData as { pages: TaskListResponse[] }).pages)) {
      const infiniteData = oldData as { pages: TaskListResponse[]; pageParams: unknown[] };
      let changed = false;
      const pages = infiniteData.pages.map((page) => {
        let pageChanged = false;
        const items = page.items.map((item) => {
          if (item.id !== task.id) {
            return item;
          }

          pageChanged = true;
          changed = true;
          return task;
        });

        return pageChanged ? { ...page, items } : page;
      });

      if (!changed) {
        return oldData;
      }

      return {
        ...infiniteData,
        pages
      };
    }

    if (Array.isArray(oldData)) {
      let changed = false;
      const items = oldData.map((item) => {
        if (item.id !== task.id) {
          return item;
        }

        changed = true;
        return task;
      });

      return changed ? items : oldData;
    }

    return oldData;
  });
}

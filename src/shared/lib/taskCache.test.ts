import { QueryClient } from '@tanstack/react-query';
import { initialTasks } from '@/shared/api/mockData';
import { updateTaskInQueryCache } from './taskCache';

describe('updateTaskInQueryCache', () => {
  it('updates task details and infinite task lists', () => {
    const queryClient = new QueryClient();
    const updatedTask = { ...initialTasks[0], status: 'done' as const };

    queryClient.setQueryData(['task', updatedTask.id], initialTasks[0]);
    queryClient.setQueryData(['tasks', { search: '', status: 'all', priority: 'all' }], {
      pages: [
        {
          items: [initialTasks[0], initialTasks[1]],
          page: 1,
          totalPages: 1,
          total: 2
        }
      ],
      pageParams: [1]
    });

    updateTaskInQueryCache(queryClient, updatedTask);

    expect(queryClient.getQueryData(['task', updatedTask.id])).toEqual(updatedTask);
    expect(queryClient.getQueriesData({ queryKey: ['tasks'] })[0][1]).toMatchObject({
      pages: [
        {
          items: [expect.objectContaining({ id: updatedTask.id, status: 'done' }), initialTasks[1]]
        }
      ]
    });

    queryClient.clear();
  });
});

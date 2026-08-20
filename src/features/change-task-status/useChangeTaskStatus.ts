import { Task, TaskStatus } from '@/entities/task/types';
import { enqueueTaskOfflineOperation } from '@/features/offline/offlineQueue';
import { useNetwork } from '@/providers/NetworkProvider';
import { apiClient } from '@/shared/api/client';
import { updateTaskInQueryCache } from '@/shared/lib/taskCache';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useChangeTaskStatus(taskId: string) {
  const queryClient = useQueryClient();
  const { isOnline, refreshQueueCount } = useNetwork();

  return useMutation({
    mutationFn: async (status: TaskStatus) => {
      if (!isOnline) {
        const task = (queryClient.getQueryData(['task', taskId]) as Task | undefined) ?? (await apiClient.tasks.getTask(taskId));
        const optimisticTask = { ...task, status };

        await enqueueTaskOfflineOperation({
          type: 'task.updateStatus',
          taskId,
          status
        });
        await refreshQueueCount();

        return optimisticTask;
      }

      return apiClient.tasks.updateStatus(taskId, status, { source: 'local' });
    },
    onSuccess: (task) => {
      updateTaskInQueryCache(queryClient, task);
    }
  });
}

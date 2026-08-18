import { TaskStatus } from '@/entities/task/types';
import { apiClient } from '@/shared/api/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useChangeTaskStatus(taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (status: TaskStatus) => apiClient.tasks.updateStatus(taskId, status),
    onSuccess: (task) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.setQueryData(['task', taskId], task);
    }
  });
}

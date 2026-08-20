import { taskStatusLabels } from '@/entities/task/labels';
import { useAuth } from '@/providers/AuthProvider';
import { useNetwork } from '@/providers/NetworkProvider';
import { notifyTaskStatusChanged } from '@/providers/NotificationsProvider';
import { apiClient } from '@/shared/api/client';
import { taskRealtime } from '@/shared/api/realtime';
import { updateTaskInQueryCache } from '@/shared/lib/taskCache';
import { PropsWithChildren, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export function RealtimeProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const { token, isBootstrapping } = useAuth();
  const { isOnline } = useNetwork();

  useEffect(() => {
    if (!token || isBootstrapping || !isOnline) {
      taskRealtime.disconnect();
      return;
    }

    const unsubscribe = taskRealtime.connect((event) => {
      if (event.type === 'task.status_changed' || event.type === 'task.updated') {
        updateTaskInQueryCache(queryClient, event.task);
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
      }

      if (event.type === 'task.created') {
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
      }

      if (event.type === 'task.status_changed' && event.source === 'remote') {
        notifyTaskStatusChanged(event.task.title, taskStatusLabels[event.task.status]);
      }
    });

    taskRealtime.startSimulation(() => apiClient.tasks.simulateRemoteStatusChange());

    return unsubscribe;
  }, [isBootstrapping, isOnline, queryClient, token]);

  return <>{children}</>;
}

import { Task } from '@/entities/task/types';
import { initialTasks } from '@/shared/api/mockData';
import { apiClient } from '@/shared/api/client';
import { getOfflineQueue } from '@/features/offline/offlineQueue';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { PropsWithChildren } from 'react';
import { useChangeTaskStatus } from './useChangeTaskStatus';

const mockRefreshQueueCount = jest.fn();
let mockIsOnline = true;

jest.mock('@/providers/NetworkProvider', () => ({
  useNetwork: () => ({
    isOnline: mockIsOnline,
    refreshQueueCount: mockRefreshQueueCount
  })
}));

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('TaskStatus', () => {
  let queryClient: QueryClient;

  beforeEach(async () => {
    mockIsOnline = true;
    mockRefreshQueueCount.mockReset();
    await AsyncStorage.clear();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { gcTime: Infinity },
        mutations: { gcTime: Infinity }
      }
    });
  });

  afterEach(() => {
    queryClient.clear();
    jest.restoreAllMocks();
  });

  it('changes status online and updates query cache', async () => {
    const task = initialTasks[0];
    const updatedTask: Task = { ...task, status: 'done' };
    jest.spyOn(apiClient.tasks, 'updateStatus').mockResolvedValueOnce(updatedTask);
    const { result } = renderHook(() => useChangeTaskStatus(task.id), {
      wrapper: createWrapper(queryClient)
    });

    await act(async () => {
      await result.current.mutateAsync('done');
    });

    expect(apiClient.tasks.updateStatus).toHaveBeenCalledWith(task.id, 'done', { source: 'local' });
    await waitFor(() => expect(queryClient.getQueryData(['task', task.id])).toEqual(updatedTask));
  });

  it('queues status changes offline and returns an optimistic task', async () => {
    mockIsOnline = false;
    const task = initialTasks[0];
    queryClient.setQueryData(['task', task.id], task);
    const updateStatus = jest.spyOn(apiClient.tasks, 'updateStatus');
    const { result } = renderHook(() => useChangeTaskStatus(task.id), {
      wrapper: createWrapper(queryClient)
    });

    await act(async () => {
      const optimisticTask = await result.current.mutateAsync('done');
      expect(optimisticTask.status).toBe('done');
    });

    expect(updateStatus).not.toHaveBeenCalled();
    expect(mockRefreshQueueCount).toHaveBeenCalledTimes(1);
    await expect(getOfflineQueue()).resolves.toEqual([
      expect.objectContaining({ taskId: task.id, status: 'done', type: 'task.updateStatus' })
    ]);
  });
});

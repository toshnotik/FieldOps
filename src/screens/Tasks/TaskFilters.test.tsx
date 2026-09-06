import { TaskFilters } from '@/entities/task/types';
import { initialTasks } from '@/shared/api/mockData';
import { apiClient } from '@/shared/api/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { PropsWithChildren } from 'react';
import TasksScreen from './TasksScreen';

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn()
  }
}));

let mockNetworkState = {
  isOnline: true,
  pendingOperations: 0,
  syncError: null as null | { remaining: number }
};

jest.mock('@/providers/NetworkProvider', () => ({
  useNetwork: () => mockNetworkState
}));

let queryClient: QueryClient;

function renderWithQueryClient() {
  queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity }
    }
  });

  function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  return render(<TasksScreen />, { wrapper: Wrapper });
}

describe('TaskFilters', () => {
  beforeEach(() => {
    mockNetworkState = {
      isOnline: true,
      pendingOperations: 0,
      syncError: null
    };
    jest.spyOn(apiClient.tasks, 'getTasks').mockImplementation(async (filters: TaskFilters, page = 1) => ({
      items: initialTasks.filter((task) => filters.status === 'all' || task.status === filters.status),
      page,
      totalPages: 1,
      total: initialTasks.length
    }));
  });

  afterEach(() => {
    queryClient?.clear();
    jest.restoreAllMocks();
  });

  it('renders task data and applies status filter on press', async () => {
    const { getByLabelText, getByText } = renderWithQueryClient();

    await waitFor(() => expect(getByText('Ремонт оборудования')).toBeTruthy());
    expect(getByLabelText('Фильтр статуса: Все')).toBeTruthy();

    await act(async () => {
      fireEvent.press(getByLabelText('Фильтр статуса: Готово'));
      await waitFor(() =>
        expect(apiClient.tasks.getTasks).toHaveBeenLastCalledWith(
          expect.objectContaining({ status: 'done' }),
          1
        )
      );
    });
  });

  it('shows offline sync errors in the network banner', async () => {
    mockNetworkState = {
      isOnline: true,
      pendingOperations: 3,
      syncError: { remaining: 2 }
    };

    const { getByText } = renderWithQueryClient();

    await waitFor(() => expect(getByText('Не удалось синхронизировать изменения: 3')).toBeTruthy());
    await waitFor(() => expect(getByText('Плановое ТО вентиляции')).toBeTruthy());
  });
});

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

jest.mock('@/providers/NetworkProvider', () => ({
  useNetwork: () => ({
    isOnline: true,
    pendingOperations: 0
  })
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
    const { getByText } = renderWithQueryClient();

    await waitFor(() => expect(getByText('Ремонт оборудования')).toBeTruthy());

    await act(async () => {
      fireEvent.press(getByText('Готово'));
    });

    await waitFor(() =>
      expect(apiClient.tasks.getTasks).toHaveBeenLastCalledWith(
        expect.objectContaining({ status: 'done' }),
        1
      )
    );
  });
});

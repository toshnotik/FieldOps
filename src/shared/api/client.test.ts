import { apiClient } from './client';
import { taskRealtime } from './realtime';

describe('apiClient.tasks', () => {
  beforeEach(async () => {
    await apiClient.auth.login('tech@fieldops.local', '123456');
  });

  it('filters tasks by status', async () => {
    const response = await apiClient.tasks.getTasks(
      { search: '', status: 'done', priority: 'all' },
      1
    );

    expect(response.items.length).toBeGreaterThan(0);
    expect(response.items.every((task) => task.status === 'done')).toBe(true);
  });

  it('emits realtime event after status update', async () => {
    const events: string[] = [];
    const unsubscribe = taskRealtime.connect((event) => events.push(event.type));

    await apiClient.tasks.updateStatus('task-1', 'done');
    unsubscribe();

    expect(events).toContain('task.status_changed');
  });
});

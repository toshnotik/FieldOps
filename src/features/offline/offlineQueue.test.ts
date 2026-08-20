import AsyncStorage from '@react-native-async-storage/async-storage';
import { clearOfflineQueue, enqueueOfflineOperation, getOfflineQueue, processOfflineQueue } from './offlineQueue';

describe('offlineQueue', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('persists queued operations in order', async () => {
    await enqueueOfflineOperation({
      id: 'op-1',
      type: 'task.updateStatus',
      taskId: 'task-1',
      status: 'in_progress',
      createdAt: '2026-08-20T10:00:00.000Z'
    });
    await enqueueOfflineOperation({
      id: 'op-2',
      type: 'task.addComment',
      taskId: 'task-1',
      text: 'Буду на объекте через 10 минут',
      createdAt: '2026-08-20T10:01:00.000Z'
    });

    await expect(getOfflineQueue()).resolves.toEqual([
      expect.objectContaining({ id: 'op-1', type: 'task.updateStatus' }),
      expect.objectContaining({ id: 'op-2', type: 'task.addComment' })
    ]);
  });

  it('clears queued operations after sync', async () => {
    await enqueueOfflineOperation({
      id: 'op-1',
      type: 'task.updateStatus',
      taskId: 'task-1',
      status: 'done',
      createdAt: '2026-08-20T10:00:00.000Z'
    });

    await clearOfflineQueue();

    await expect(getOfflineQueue()).resolves.toEqual([]);
  });

  it('keeps concurrent enqueue operations', async () => {
    await Promise.all([
      enqueueOfflineOperation({
        id: 'op-1',
        type: 'task.updateStatus',
        taskId: 'task-1',
        status: 'in_progress',
        createdAt: '2026-08-20T10:00:00.000Z'
      }),
      enqueueOfflineOperation({
        id: 'op-2',
        type: 'task.updateStatus',
        taskId: 'task-2',
        status: 'done',
        createdAt: '2026-08-20T10:01:00.000Z'
      })
    ]);

    await expect(getOfflineQueue()).resolves.toHaveLength(2);
  });

  it('preserves the first failed operation and unprocessed tail during sync', async () => {
    await enqueueOfflineOperation({
      id: 'op-1',
      type: 'task.updateStatus',
      taskId: 'task-1',
      status: 'in_progress',
      createdAt: '2026-08-20T10:00:00.000Z'
    });
    await enqueueOfflineOperation({
      id: 'op-2',
      type: 'task.updateStatus',
      taskId: 'task-2',
      status: 'done',
      createdAt: '2026-08-20T10:01:00.000Z'
    });
    await enqueueOfflineOperation({
      id: 'op-3',
      type: 'task.addComment',
      taskId: 'task-3',
      text: 'Проверить повторно',
      createdAt: '2026-08-20T10:02:00.000Z'
    });

    await processOfflineQueue(async (operation) => {
      if (operation.id === 'op-2') {
        throw new Error('network failed');
      }
    });

    await expect(getOfflineQueue()).resolves.toEqual([
      expect.objectContaining({ id: 'op-2' }),
      expect.objectContaining({ id: 'op-3' })
    ]);
  });
});

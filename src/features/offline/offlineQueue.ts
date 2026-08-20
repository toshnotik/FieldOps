import AsyncStorage from '@react-native-async-storage/async-storage';
import { TaskStatus } from '@/entities/task/types';

const OFFLINE_QUEUE_KEY = 'fieldops.offlineQueue';
let queueLock = Promise.resolve();

export type OfflineOperation =
  | {
      id: string;
      type: 'task.updateStatus';
      taskId: string;
      status: TaskStatus;
      createdAt: string;
    }
  | {
      id: string;
      type: 'task.addComment';
      taskId: string;
      text: string;
      createdAt: string;
    };

type NewOfflineOperation = OfflineOperation extends infer Operation
  ? Operation extends OfflineOperation
    ? Omit<Operation, 'id' | 'createdAt'>
    : never
  : never;

export async function getOfflineQueue(): Promise<OfflineOperation[]> {
  const raw = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
  return raw ? (JSON.parse(raw) as OfflineOperation[]) : [];
}

async function withQueueLock<T>(operation: () => Promise<T>) {
  const run = queueLock.then(operation, operation);
  queueLock = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

export async function enqueueOfflineOperation(operation: OfflineOperation) {
  return withQueueLock(async () => {
    const queue = await getOfflineQueue();
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify([...queue, operation]));
  });
}

export async function enqueueTaskOfflineOperation(operation: NewOfflineOperation) {
  await enqueueOfflineOperation({
    ...operation,
    id: `offline-${Date.now()}`,
    createdAt: new Date().toISOString()
  } as OfflineOperation);
}

export async function clearOfflineQueue() {
  return withQueueLock(async () => {
    await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
  });
}

export async function processOfflineQueue(
  processor: (operation: OfflineOperation) => Promise<void>
) {
  return withQueueLock(async () => {
    const queue = await getOfflineQueue();
    const remaining: OfflineOperation[] = [];

    for (let index = 0; index < queue.length; index += 1) {
      const operation = queue[index];

      try {
        await processor(operation);
      } catch {
        remaining.push(operation, ...queue.slice(index + 1));
        break;
      }
    }

    if (remaining.length) {
      await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remaining));
    } else {
      await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
    }

    return {
      processed: queue.length - remaining.length,
      remaining: remaining.length
    };
  });
}

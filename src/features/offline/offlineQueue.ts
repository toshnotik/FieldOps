import AsyncStorage from '@react-native-async-storage/async-storage';
import { z } from 'zod';

const OFFLINE_QUEUE_KEY = 'fieldops.offlineQueue';
let queueLock = Promise.resolve();

const TaskStatusSchema = z.enum(['new', 'in_progress', 'done']);
const BaseOfflineOperationSchema = z.object({
  id: z.string(),
  taskId: z.string(),
  createdAt: z.string()
});
const OfflineOperationSchema = z.discriminatedUnion('type', [
  BaseOfflineOperationSchema.extend({
    type: z.literal('task.updateStatus'),
    status: TaskStatusSchema
  }),
  BaseOfflineOperationSchema.extend({
    type: z.literal('task.addComment'),
    text: z.string()
  })
]);
const OfflineQueueSchema = z.array(OfflineOperationSchema);

export type OfflineOperation = z.infer<typeof OfflineOperationSchema>;

export type ProcessOfflineQueueResult = {
  processed: number;
  remaining: number;
  failedOperation?: OfflineOperation;
  error?: string;
};

type NewOfflineOperation = OfflineOperation extends infer Operation
  ? Operation extends OfflineOperation
    ? Omit<Operation, 'id' | 'createdAt'>
    : never
  : never;

export async function getOfflineQueue(): Promise<OfflineOperation[]> {
  const raw = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = OfflineQueueSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : [];
  } catch {
    return [];
  }
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
): Promise<ProcessOfflineQueueResult> {
  return withQueueLock(async () => {
    const queue = await getOfflineQueue();
    const remaining: OfflineOperation[] = [];
    let failedOperation: OfflineOperation | undefined;
    let syncError: string | undefined;

    for (let index = 0; index < queue.length; index += 1) {
      const operation = queue[index];

      try {
        await processor(operation);
      } catch (error) {
        failedOperation = operation;
        syncError = error instanceof Error ? error.message : String(error);
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
      remaining: remaining.length,
      failedOperation,
      error: syncError
    };
  });
}

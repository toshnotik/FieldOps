import NetInfo from '@react-native-community/netinfo';
import { useAuth } from '@/providers/AuthProvider';
import { apiClient } from '@/shared/api/client';
import { getOfflineQueue, processOfflineQueue } from '@/features/offline/offlineQueue';
import { PropsWithChildren, createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface NetworkContextValue {
  isOnline: boolean;
  pendingOperations: number;
  refreshQueueCount: () => Promise<void>;
  syncPendingOperations: () => Promise<void>;
}

const NetworkContext = createContext<NetworkContextValue | null>(null);

export function NetworkProvider({ children }: PropsWithChildren) {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingOperations, setPendingOperations] = useState(0);
  const queryClient = useQueryClient();
  const { isBootstrapping, token } = useAuth();

  async function refreshQueueCount() {
    setPendingOperations((await getOfflineQueue()).length);
  }

  async function syncPendingOperations() {
    if (!isOnline || isBootstrapping || !token) {
      return;
    }

    const result = await processOfflineQueue(async (operation) => {
      switch (operation.type) {
        case 'task.updateStatus':
          await apiClient.tasks.updateStatus(operation.taskId, operation.status, { source: 'sync' });
          return;
        case 'task.addComment':
          await apiClient.tasks.addComment(operation.taskId, operation.text, { source: 'sync' });
          return;
        default: {
          const exhaustive: never = operation;
          throw new Error(`Unsupported offline operation: ${JSON.stringify(exhaustive)}`);
        }
      }
    });

    await refreshQueueCount();
    if (result.processed > 0) {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  }

  useEffect(() => {
    refreshQueueCount();

    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = Boolean(state.isConnected && state.isInternetReachable !== false);
      setIsOnline(online);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (isOnline && token && !isBootstrapping) {
      syncPendingOperations();
    }
  }, [isBootstrapping, isOnline, token]);

  const value = useMemo(
    () => ({
      isOnline,
      pendingOperations,
      refreshQueueCount,
      syncPendingOperations
    }),
    [isOnline, pendingOperations]
  );

  return <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>;
}

export function useNetwork() {
  const context = useContext(NetworkContext);

  if (!context) {
    throw new Error('useNetwork must be used within NetworkProvider');
  }

  return context;
}

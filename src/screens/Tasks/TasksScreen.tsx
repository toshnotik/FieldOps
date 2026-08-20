import { taskPriorityLabels, taskStatusLabels } from '@/entities/task/labels';
import { TaskPriority, TaskStatus } from '@/entities/task/types';
import { TaskCard } from '@/entities/task/ui/TaskCard';
import { apiClient } from '@/shared/api/client';
import { useNetwork } from '@/providers/NetworkProvider';
import { EmptyState } from '@/shared/ui/EmptyState';
import { Input } from '@/shared/ui/Input';
import { useTheme } from '@/shared/ui/theme';
import { useAppStore } from '@/store/appStore';
import { useInfiniteQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

const statuses: Array<TaskStatus | 'all'> = ['all', 'new', 'in_progress', 'done'];
const priorities: Array<TaskPriority | 'all'> = ['all', 'low', 'medium', 'high'];

export default function TasksScreen() {
  const filters = useAppStore((state) => state.taskFilters);
  const setTaskFilters = useAppStore((state) => state.setTaskFilters);
  const { isOnline, pendingOperations } = useNetwork();
  const { colors } = useTheme();

  const query = useInfiniteQuery({
    queryKey: ['tasks', filters],
    queryFn: ({ pageParam }) => apiClient.tasks.getTasks(filters, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined)
  });

  const tasks = query.data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.filters, { backgroundColor: colors.background }]}>
        <View
          style={[
            styles.networkBanner,
            { backgroundColor: isOnline ? colors.onlineBanner : colors.offlineBanner }
          ]}
        >
          <Text style={[styles.networkText, { color: colors.text }]}>
            {isOnline ? 'Онлайн: статусы обновляются в реальном времени' : 'Офлайн: изменения будут синхронизированы позже'}
          </Text>
          {pendingOperations ? <Text style={[styles.networkCount, { backgroundColor: colors.warning }]}>{pendingOperations}</Text> : null}
        </View>
        <Input
          label="Поиск"
          placeholder="Название, адрес или описание"
          value={filters.search}
          onChangeText={(search) => setTaskFilters({ search })}
        />
        <View style={styles.filterBlock}>
          <Text style={[styles.filterLabel, { color: colors.text }]}>Статус</Text>
          <View style={styles.chips}>
            {statuses.map((status) => (
              <Chip
                key={status}
                active={filters.status === status}
                label={status === 'all' ? 'Все' : taskStatusLabels[status]}
                onPress={() => setTaskFilters({ status })}
              />
            ))}
          </View>
        </View>
        <View style={styles.filterBlock}>
          <Text style={[styles.filterLabel, { color: colors.text }]}>Приоритет</Text>
          <View style={styles.chips}>
            {priorities.map((priority) => (
              <Chip
                key={priority}
                active={filters.priority === priority}
                label={priority === 'all' ? 'Все' : taskPriorityLabels[priority]}
                onPress={() => setTaskFilters({ priority })}
              />
            ))}
          </View>
        </View>
      </View>

      {query.isLoading ? (
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      ) : query.isError ? (
        <EmptyState title="Не удалось загрузить задачи" subtitle="Потяните список вниз, чтобы повторить запрос." />
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <TaskCard task={item} onPress={() => router.push(`/task/${item.id}`)} />}
          refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={() => query.refetch()} />}
          ListEmptyComponent={<EmptyState title="Задач не найдено" subtitle="Измените поиск или фильтры." />}
          ListFooterComponent={
            query.hasNextPage ? (
              <Pressable style={styles.loadMore} onPress={() => query.fetchNextPage()}>
                {query.isFetchingNextPage ? <ActivityIndicator color={colors.primary} /> : <Text style={[styles.loadMoreText, { color: colors.primary }]}>Загрузить еще</Text>}
              </Pressable>
            ) : null
          }
        />
      )}

      <Pressable style={[styles.fab, { backgroundColor: colors.primary }]} onPress={() => router.push('/task/create')}>
        <Text style={styles.fabText}>+</Text>
      </Pressable>
    </View>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        { backgroundColor: colors.surface, borderColor: colors.border },
        active && { backgroundColor: colors.primary, borderColor: colors.primary }
      ]}
    >
      <Text style={[styles.chipText, { color: active ? '#FFFFFF' : colors.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  filters: {
    padding: 16,
    gap: 12,
  },
  filterBlock: {
    gap: 8
  },
  filterLabel: {
    fontWeight: '800'
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  chip: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  chipText: {
    fontWeight: '700'
  },
  loader: {
    marginTop: 48
  },
  list: {
    padding: 16,
    paddingTop: 0,
    gap: 12
  },
  loadMore: {
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center'
  },
  loadMoreText: {
    fontWeight: '800'
  },
  networkBanner: {
    minHeight: 40,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  networkText: {
    flex: 1,
    fontWeight: '700'
  },
  networkCount: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    overflow: 'hidden',
    textAlign: 'center',
    lineHeight: 24,
    color: '#FFFFFF',
    fontWeight: '900'
  },
  fab: {
    position: 'absolute',
    right: 18,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center'
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 32,
    lineHeight: 34,
    fontWeight: '700'
  }
});

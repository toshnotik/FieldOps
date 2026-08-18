import { taskPriorityLabels, taskStatusLabels } from '@/entities/task/labels';
import { TaskPriority, TaskStatus } from '@/entities/task/types';
import { TaskCard } from '@/entities/task/ui/TaskCard';
import { apiClient } from '@/shared/api/client';
import { EmptyState } from '@/shared/ui/EmptyState';
import { Input } from '@/shared/ui/Input';
import { colors } from '@/shared/ui/theme';
import { useAppStore } from '@/store/appStore';
import { useInfiniteQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

const statuses: Array<TaskStatus | 'all'> = ['all', 'new', 'in_progress', 'done'];
const priorities: Array<TaskPriority | 'all'> = ['all', 'low', 'medium', 'high'];

export default function TasksScreen() {
  const filters = useAppStore((state) => state.taskFilters);
  const setTaskFilters = useAppStore((state) => state.setTaskFilters);

  const query = useInfiniteQuery({
    queryKey: ['tasks', filters],
    queryFn: ({ pageParam }) => apiClient.tasks.getTasks(filters, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined)
  });

  const tasks = query.data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <View style={styles.screen}>
      <View style={styles.filters}>
        <Input
          label="Поиск"
          placeholder="Название, адрес или описание"
          value={filters.search}
          onChangeText={(search) => setTaskFilters({ search })}
        />
        <View style={styles.filterBlock}>
          <Text style={styles.filterLabel}>Статус</Text>
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
          <Text style={styles.filterLabel}>Приоритет</Text>
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
                {query.isFetchingNextPage ? <ActivityIndicator color={colors.primary} /> : <Text style={styles.loadMoreText}>Загрузить еще</Text>}
              </Pressable>
            ) : null
          }
        />
      )}

      <Pressable style={styles.fab} onPress={() => router.push('/task/create')}>
        <Text style={styles.fabText}>+</Text>
      </Pressable>
    </View>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background
  },
  filters: {
    padding: 16,
    gap: 12,
    backgroundColor: colors.background
  },
  filterBlock: {
    gap: 8
  },
  filterLabel: {
    color: colors.text,
    fontWeight: '800'
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.surface
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  chipText: {
    color: colors.text,
    fontWeight: '700'
  },
  chipTextActive: {
    color: '#FFFFFF'
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
    color: colors.primary,
    fontWeight: '800'
  },
  fab: {
    position: 'absolute',
    right: 18,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 32,
    lineHeight: 34,
    fontWeight: '700'
  }
});

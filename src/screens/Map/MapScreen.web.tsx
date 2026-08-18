import { taskStatusColors, taskStatusLabels } from '@/entities/task/labels';
import { Task } from '@/entities/task/types';
import { apiClient } from '@/shared/api/client';
import { EmptyState } from '@/shared/ui/EmptyState';
import { colors } from '@/shared/ui/theme';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

export default function MapScreenWeb() {
  const tasksQuery = useQuery({
    queryKey: ['tasks', 'map'],
    queryFn: () => apiClient.tasks.getAllTasks()
  });

  if (tasksQuery.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (tasksQuery.isError || !tasksQuery.data) {
    return <EmptyState title="Карту загрузить не удалось" subtitle="Проверьте авторизацию и повторите попытку." />;
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.notice}>Web-версия показывает список маркеров. Нативная карта доступна в Expo Go или сборке iOS/Android.</Text>
      <FlatList
        data={tasksQuery.data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState title="Нет задач для карты" />}
        renderItem={({ item }) => <MapTaskRow task={item} />}
      />
    </View>
  );
}

function MapTaskRow({ task }: { task: Task }) {
  return (
    <Pressable style={styles.row} onPress={() => router.push(`/task/${task.id}`)}>
      <View style={[styles.dot, { backgroundColor: taskStatusColors[task.status] }]} />
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{task.title}</Text>
        <Text style={styles.rowMeta}>
          {task.address} · {taskStatusLabels[task.status]}
        </Text>
        <Text style={styles.coords}>
          {task.latitude.toFixed(5)}, {task.longitude.toFixed(5)}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background
  },
  wrap: {
    flex: 1,
    backgroundColor: colors.background
  },
  list: {
    padding: 16,
    gap: 10
  },
  notice: {
    margin: 16,
    marginBottom: 0,
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.surfaceMuted,
    color: colors.text,
    lineHeight: 20
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.surface
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7
  },
  rowText: {
    flex: 1,
    gap: 4
  },
  rowTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800'
  },
  rowMeta: {
    color: colors.textMuted,
    lineHeight: 20
  },
  coords: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700'
  }
});

import { taskPriorityColors, taskPriorityLabels, taskStatusColors, taskStatusLabels } from '@/entities/task/labels';
import { Task } from '@/entities/task/types';
import { formatTaskDate } from '@/shared/lib/date';
import { colors } from '@/shared/ui/theme';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export function TaskCard({ task, onPress }: { task: Task; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.header}>
        <View style={styles.titleWrap}>
          <Text style={styles.title}>{task.title}</Text>
          <Text style={styles.address}>{task.address}</Text>
        </View>
        <View style={[styles.statusDot, { backgroundColor: taskStatusColors[task.status] }]} />
      </View>

      <View style={styles.meta}>
        <Text style={[styles.badge, { color: taskPriorityColors[task.priority] }]}>
          Приоритет: {taskPriorityLabels[task.priority]}
        </Text>
        <Text style={[styles.badge, { color: taskStatusColors[task.status] }]}>
          Статус: {taskStatusLabels[task.status]}
        </Text>
      </View>

      <Text style={styles.date}>{formatTaskDate(task.dueDate)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 16,
    gap: 12
  },
  pressed: {
    opacity: 0.78
  },
  header: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start'
  },
  titleWrap: {
    flex: 1,
    gap: 4
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800'
  },
  address: {
    color: colors.textMuted,
    fontSize: 14
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 5
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  badge: {
    fontSize: 14,
    fontWeight: '700'
  },
  date: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600'
  }
});

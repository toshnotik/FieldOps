import { taskPriorityLabels, taskStatusColors, taskStatusLabels } from '@/entities/task/labels';
import { Task, TaskStatus } from '@/entities/task/types';
import { useChangeTaskStatus } from '@/features/change-task-status/useChangeTaskStatus';
import { useUploadPhoto } from '@/features/upload-photo/useUploadPhoto';
import { apiClient } from '@/shared/api/client';
import { formatTaskDate } from '@/shared/lib/date';
import { Button } from '@/shared/ui/Button';
import { EmptyState } from '@/shared/ui/EmptyState';
import { Input } from '@/shared/ui/Input';
import { Screen } from '@/shared/ui/Screen';
import { colors } from '@/shared/ui/theme';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';

export default function TaskDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [comment, setComment] = useState('');
  const queryClient = useQueryClient();
  const taskQuery = useQuery({
    queryKey: ['task', id],
    queryFn: () => apiClient.tasks.getTask(id)
  });
  const statusMutation = useChangeTaskStatus(id);
  const photoMutation = useUploadPhoto(id);
  const commentMutation = useMutation({
    mutationFn: (text: string) => apiClient.tasks.addComment(id, text),
    onSuccess: (task) => {
      setComment('');
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.setQueryData(['task', id], task);
    }
  });

  if (taskQuery.isLoading) {
    return (
      <Screen style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </Screen>
    );
  }

  if (taskQuery.isError || !taskQuery.data) {
    return (
      <Screen>
        <EmptyState title="Задача не найдена" subtitle="Вернитесь к списку и попробуйте открыть карточку снова." />
      </Screen>
    );
  }

  const task: Task = taskQuery.data;

  function changeStatus(status: TaskStatus) {
    statusMutation.mutate(status, {
      onError: (error) => Alert.alert('Статус не изменен', error instanceof Error ? error.message : 'Попробуйте еще раз')
    });
  }

  function openMap() {
    const url = `https://maps.google.com/?q=${task.latitude},${task.longitude}`;
    Linking.openURL(url);
  }

  return (
    <Screen scroll style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>{task.title}</Text>
        <Text style={styles.description}>{task.description}</Text>
      </View>

      <View style={styles.info}>
        <Info label="Адрес" value={task.address} />
        <Info label="Координаты" value={`${task.latitude.toFixed(5)}, ${task.longitude.toFixed(5)}`} />
        <Info label="Исполнитель" value={`${task.assignee.name}, ${task.assignee.role}`} />
        <Info label="Дедлайн" value={formatTaskDate(task.dueDate)} />
        <Info label="Приоритет" value={taskPriorityLabels[task.priority]} />
        <Info label="Статус" value={taskStatusLabels[task.status]} color={taskStatusColors[task.status]} />
      </View>

      <View style={styles.actions}>
        <Button title="Начать работу" onPress={() => changeStatus('in_progress')} disabled={task.status === 'in_progress'} loading={statusMutation.isPending} />
        <Button title="Завершить" onPress={() => changeStatus('done')} disabled={task.status === 'done'} loading={statusMutation.isPending} />
        <Button title="Добавить фото" variant="secondary" onPress={() => photoMutation.mutate()} loading={photoMutation.isPending} />
        <Button title="Открыть на карте" variant="secondary" onPress={openMap} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Фотографии</Text>
        {task.images.length ? (
          <View style={styles.images}>
            {task.images.map((uri) => (
              <Image key={uri} source={{ uri }} style={styles.image} />
            ))}
          </View>
        ) : (
          <Text style={styles.muted}>Фото пока не добавлены.</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Комментарии</Text>
        <View style={styles.commentForm}>
          <Input label="Комментарий" value={comment} onChangeText={setComment} placeholder="Что важно знать по задаче" />
          <Button
            title="Добавить комментарий"
            onPress={() => commentMutation.mutate(comment.trim())}
            disabled={comment.trim().length < 2}
            loading={commentMutation.isPending}
          />
        </View>
        <View style={styles.comments}>
          {task.comments.map((item) => (
            <View key={item.id} style={styles.comment}>
              <Text style={styles.commentAuthor}>{item.author.name}</Text>
              <Text style={styles.commentText}>{item.text}</Text>
              <Text style={styles.commentDate}>{formatTaskDate(item.createdAt)}</Text>
            </View>
          ))}
          {!task.comments.length ? <Text style={styles.muted}>Комментариев пока нет.</Text> : null}
        </View>
      </View>
    </Screen>
  );
}

function Info({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, color ? { color } : null]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: 20
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  header: {
    gap: 10
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '900'
  },
  description: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 24
  },
  info: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border
  },
  infoRow: {
    padding: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    gap: 4
  },
  infoLabel: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700'
  },
  infoValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700'
  },
  actions: {
    gap: 10
  },
  section: {
    gap: 12
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900'
  },
  images: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  image: {
    width: 104,
    height: 104,
    borderRadius: 8,
    backgroundColor: colors.surfaceMuted
  },
  muted: {
    color: colors.textMuted,
    fontSize: 15
  },
  commentForm: {
    gap: 10
  },
  comments: {
    gap: 10
  },
  comment: {
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: 6
  },
  commentAuthor: {
    color: colors.text,
    fontWeight: '800'
  },
  commentText: {
    color: colors.text,
    lineHeight: 20
  },
  commentDate: {
    color: colors.textMuted,
    fontSize: 12
  }
});

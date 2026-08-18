import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Alert, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Screen } from '@/shared/ui/Screen';
import { taskSchema, TaskFormValues } from '@/features/create-task/taskSchema';

export default function CreateTaskScreen() {
  const queryClient = useQueryClient();
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      address: '',
      latitude: 55.751244,
      longitude: 37.618423,
      priority: 'medium',
      status: 'new',
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    }
  });

  const mutation = useMutation({
    mutationFn: apiClient.tasks.createTask,
    onSuccess: (task) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      router.replace(`/task/${task.id}`);
    },
    onError: (error) => Alert.alert('Задача не создана', error instanceof Error ? error.message : 'Попробуйте еще раз')
  });

  const submit = handleSubmit((values) =>
    mutation.mutate({
      ...values,
      dueDate: new Date(values.dueDate).toISOString()
    })
  );

  return (
    <Screen scroll>
      <View style={styles.form}>
        <Controller control={control} name="title" render={({ field }) => <Input label="Название" value={field.value} onChangeText={field.onChange} error={errors.title?.message} />} />
        <Controller control={control} name="description" render={({ field }) => <Input label="Описание" value={field.value} onChangeText={field.onChange} multiline error={errors.description?.message} style={styles.textarea} />} />
        <Controller control={control} name="address" render={({ field }) => <Input label="Адрес" value={field.value} onChangeText={field.onChange} error={errors.address?.message} />} />
        <Controller control={control} name="latitude" render={({ field }) => <Input label="Широта" value={String(field.value)} onChangeText={field.onChange} keyboardType="numeric" error={errors.latitude?.message} />} />
        <Controller control={control} name="longitude" render={({ field }) => <Input label="Долгота" value={String(field.value)} onChangeText={field.onChange} keyboardType="numeric" error={errors.longitude?.message} />} />
        <Controller control={control} name="priority" render={({ field }) => <Input label="Приоритет: low / medium / high" value={field.value} onChangeText={field.onChange} autoCapitalize="none" error={errors.priority?.message} />} />
        <Controller control={control} name="status" render={({ field }) => <Input label="Статус: new / in_progress / done" value={field.value} onChangeText={field.onChange} autoCapitalize="none" error={errors.status?.message} />} />
        <Controller control={control} name="dueDate" render={({ field }) => <Input label="Дата ISO" value={field.value} onChangeText={field.onChange} error={errors.dueDate?.message} />} />
        <Button title="Создать задачу" onPress={submit} loading={mutation.isPending} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 14
  },
  textarea: {
    minHeight: 96,
    textAlignVertical: 'top',
    paddingTop: 12
  }
});

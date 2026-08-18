import { apiClient } from '@/shared/api/client';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useUploadPhoto(taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        throw new Error('Нет доступа к фотографиям');
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7
      });

      if (result.canceled) {
        throw new Error('Выбор фото отменен');
      }

      return apiClient.tasks.addImage(taskId, result.assets[0].uri);
    },
    onSuccess: (task) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.setQueryData(['task', taskId], task);
    },
    onError: (error) => {
      if (error instanceof Error && error.message !== 'Выбор фото отменен') {
        Alert.alert('Фото не добавлено', error.message);
      }
    }
  });
}

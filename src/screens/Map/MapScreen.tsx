import { taskStatusColors, taskStatusLabels } from '@/entities/task/labels';
import { Task } from '@/entities/task/types';
import { apiClient } from '@/shared/api/client';
import { EmptyState } from '@/shared/ui/EmptyState';
import { colors } from '@/shared/ui/theme';
import { useAppStore } from '@/store/appStore';
import { useQuery } from '@tanstack/react-query';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

export default function MapScreen() {
  const [locationError, setLocationError] = useState<string | null>(null);
  const mapRegion = useAppStore((state) => state.mapRegion);
  const setMapRegion = useAppStore((state) => state.setMapRegion);
  const tasksQuery = useQuery({
    queryKey: ['tasks', 'map'],
    queryFn: () => apiClient.tasks.getAllTasks()
  });

  useEffect(() => {
    async function detectLocation() {
      const permission = await Location.requestForegroundPermissionsAsync();

      if (!permission.granted) {
        setLocationError('Геолокация недоступна. Показаны задачи по умолчанию.');
        return;
      }

      const current = await Location.getCurrentPositionAsync({});
      setMapRegion({
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
        latitudeDelta: 0.08,
        longitudeDelta: 0.08
      });
    }

    detectLocation();
  }, [setMapRegion]);

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

  const tasks: Task[] = tasksQuery.data;
  const initialRegion =
    mapRegion ??
    (tasks[0]
      ? {
          latitude: tasks[0].latitude,
          longitude: tasks[0].longitude,
          latitudeDelta: 0.08,
          longitudeDelta: 0.08
        }
      : null);

  if (Platform.OS === 'web' || !initialRegion) {
    return (
      <View style={styles.webWrap}>
        {locationError ? <Text style={styles.notice}>{locationError}</Text> : null}
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.webList}
          ListEmptyComponent={<EmptyState title="Нет задач для карты" />}
          renderItem={({ item }) => <MapTaskRow task={item} />}
        />
      </View>
    );
  }

  return (
    <View style={styles.mapWrap}>
      <MapView style={styles.map} initialRegion={initialRegion} showsUserLocation onRegionChangeComplete={setMapRegion}>
        {tasks.map((task) => (
          <Marker
            key={task.id}
            coordinate={{ latitude: task.latitude, longitude: task.longitude }}
            pinColor={taskStatusColors[task.status]}
            title={task.title}
            description={task.address}
            onCalloutPress={() => router.push(`/task/${task.id}`)}
          />
        ))}
      </MapView>
      {locationError ? <Text style={styles.noticeFloating}>{locationError}</Text> : null}
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
  mapWrap: {
    flex: 1
  },
  map: {
    flex: 1
  },
  noticeFloating: {
    position: 'absolute',
    left: 16,
    right: 16,
    top: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.surface,
    color: colors.text,
    fontWeight: '700'
  },
  webWrap: {
    flex: 1,
    backgroundColor: colors.background
  },
  webList: {
    padding: 16,
    gap: 10
  },
  notice: {
    margin: 16,
    marginBottom: 0,
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.surfaceMuted,
    color: colors.text
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
  }
});

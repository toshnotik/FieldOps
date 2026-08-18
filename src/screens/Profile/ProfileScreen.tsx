import { useAuth } from '@/providers/AuthProvider';
import { taskStatusLabels } from '@/entities/task/labels';
import { Task } from '@/entities/task/types';
import { apiClient } from '@/shared/api/client';
import { Button } from '@/shared/ui/Button';
import { Screen } from '@/shared/ui/Screen';
import { colors } from '@/shared/ui/theme';
import { useAppStore } from '@/store/appStore';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { StyleSheet, Switch, Text, View } from 'react-native';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const theme = useAppStore((state) => state.theme);
  const toggleTheme = useAppStore((state) => state.toggleTheme);
  const queryClient = useQueryClient();
  const tasksQuery = useQuery({
    queryKey: ['tasks', 'profileStats'],
    queryFn: () => apiClient.tasks.getAllTasks()
  });

  const tasks: Task[] = tasksQuery.data ?? [];
  const done = tasks.filter((task) => task.status === 'done').length;
  const inProgress = tasks.filter((task) => task.status === 'in_progress').length;
  const newTasks = tasks.filter((task) => task.status === 'new').length;

  async function logout() {
    await signOut();
    queryClient.clear();
    router.replace('/login');
  }

  return (
    <Screen scroll style={styles.screen}>
      <View style={styles.profile}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name.slice(0, 1) ?? 'F'}</Text>
        </View>
        <View style={styles.profileText}>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.meta}>{user?.role}</Text>
          <Text style={styles.meta}>{user?.email}</Text>
        </View>
      </View>

      <View style={styles.stats}>
        <Stat label={taskStatusLabels.done} value={done} />
        <Stat label={taskStatusLabels.in_progress} value={inProgress} />
        <Stat label={taskStatusLabels.new} value={newTasks} />
      </View>

      <View style={styles.setting}>
        <View>
          <Text style={styles.settingTitle}>Темная тема</Text>
          <Text style={styles.settingText}>Локальное состояние Zustand</Text>
        </View>
        <Switch value={theme === 'dark'} onValueChange={toggleTheme} trackColor={{ true: colors.primary, false: colors.border }} />
      </View>

      <Button title="Выйти" variant="danger" onPress={logout} />
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: 18
  },
  profile: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900'
  },
  profileText: {
    flex: 1,
    gap: 4
  },
  name: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900'
  },
  meta: {
    color: colors.textMuted,
    fontSize: 14
  },
  stats: {
    flexDirection: 'row',
    gap: 10
  },
  stat: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: 4
  },
  statValue: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '900'
  },
  statLabel: {
    color: colors.textMuted,
    fontWeight: '700'
  },
  setting: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface
  },
  settingTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900'
  },
  settingText: {
    color: colors.textMuted,
    marginTop: 4
  }
});

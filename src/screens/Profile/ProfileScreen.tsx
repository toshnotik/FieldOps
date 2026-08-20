import { useAuth } from '@/providers/AuthProvider';
import { taskStatusLabels } from '@/entities/task/labels';
import { Task } from '@/entities/task/types';
import { apiClient } from '@/shared/api/client';
import { Button } from '@/shared/ui/Button';
import { Screen } from '@/shared/ui/Screen';
import { useTheme } from '@/shared/ui/theme';
import { useAppStore } from '@/store/appStore';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { StyleSheet, Switch, Text, View } from 'react-native';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const toggleTheme = useAppStore((state) => state.toggleTheme);
  const { colors, theme } = useTheme();
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
      <View style={[styles.profile, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>{user?.name.slice(0, 1) ?? 'F'}</Text>
        </View>
        <View style={styles.profileText}>
          <Text style={[styles.name, { color: colors.text }]}>{user?.name}</Text>
          <Text style={[styles.meta, { color: colors.textMuted }]}>{user?.role}</Text>
          <Text style={[styles.meta, { color: colors.textMuted }]}>{user?.email}</Text>
        </View>
      </View>

      <View style={styles.stats}>
        <Stat label={taskStatusLabels.done} value={done} />
        <Stat label={taskStatusLabels.in_progress} value={inProgress} />
        <Stat label={taskStatusLabels.new} value={newTasks} />
      </View>

      <View style={[styles.setting, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View>
          <Text style={[styles.settingTitle, { color: colors.text }]}>Темная тема</Text>
          <Text style={[styles.settingText, { color: colors.textMuted }]}>Локальное состояние Zustand</Text>
        </View>
        <Switch value={theme === 'dark'} onValueChange={toggleTheme} trackColor={{ true: colors.primary, false: colors.border }} />
      </View>

      <Button title="Выйти" variant="danger" onPress={logout} />
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  const { colors } = useTheme();

  return (
    <View style={[styles.stat, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textMuted }]}>{label}</Text>
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
    borderWidth: 1
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center'
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
    fontSize: 20,
    fontWeight: '900'
  },
  meta: {
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
    gap: 4
  },
  statValue: {
    fontSize: 28,
    fontWeight: '900'
  },
  statLabel: {
    fontWeight: '700'
  },
  setting: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '900'
  },
  settingText: {
    marginTop: 4
  }
});

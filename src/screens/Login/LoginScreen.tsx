import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { loginSchema, LoginFormValues } from '@/features/auth/loginSchema';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Screen } from '@/shared/ui/Screen';
import { colors } from '@/shared/ui/theme';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'tech@fieldops.local',
      password: '123456'
    }
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await signIn(values.email, values.password);
      router.replace('/');
    } catch (error) {
      Alert.alert('Не удалось войти', error instanceof Error ? error.message : 'Попробуйте еще раз');
    }
  });

  return (
    <Screen style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>FieldOps</Text>
        <Text style={styles.subtitle}>Мобильное рабочее место сотрудника выездной службы</Text>
      </View>

      <View style={styles.form}>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Email"
              autoCapitalize="none"
              keyboardType="email-address"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.email?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Пароль"
              secureTextEntry
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.password?.message}
            />
          )}
        />
        <Button title="Войти" onPress={onSubmit} loading={isSubmitting} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    justifyContent: 'center',
    gap: 28
  },
  header: {
    gap: 10,
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center'
  },
  title: {
    color: colors.text,
    fontSize: 40,
    fontWeight: '900'
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 24,
    flexShrink: 1
  },
  form: {
    gap: 16,
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center'
  }
});

import { User } from '@/entities/user/types';
import { apiClient } from '@/shared/api/client';
import { getAccessToken, removeAccessToken, saveAccessToken } from '@/features/auth/tokenStorage';
import { PropsWithChildren, createContext, useContext, useEffect, useMemo, useState } from 'react';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isBootstrapping: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    async function bootstrap() {
      const storedToken = await getAccessToken();
      apiClient.setToken(storedToken);
      setToken(storedToken);

      if (storedToken) {
        try {
          setUser(await apiClient.auth.me());
        } catch {
          await removeAccessToken();
          apiClient.setToken(null);
          setToken(null);
        }
      }

      setIsBootstrapping(false);
    }

    bootstrap();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isBootstrapping,
      async signIn(email: string, password: string) {
        const result = await apiClient.auth.login(email, password);
        await saveAccessToken(result.accessToken);
        setToken(result.accessToken);
        setUser(result.user);
      },
      async signOut() {
        await removeAccessToken();
        apiClient.setToken(null);
        setToken(null);
        setUser(null);
      }
    }),
    [isBootstrapping, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}

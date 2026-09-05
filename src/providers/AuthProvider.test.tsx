import { AuthProvider, useAuth } from './AuthProvider';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { PropsWithChildren } from 'react';
import { getAccessToken, removeAccessToken, saveAccessToken } from '@/features/auth/tokenStorage';
import { apiClient } from '@/shared/api/client';

jest.mock('@/features/auth/tokenStorage', () => ({
  getAccessToken: jest.fn(async () => null),
  removeAccessToken: jest.fn(async () => undefined),
  saveAccessToken: jest.fn(async () => undefined)
}));

function Wrapper({ children }: PropsWithChildren) {
  return <AuthProvider>{children}</AuthProvider>;
}

describe('AuthProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    apiClient.setToken(null);
  });

  it('bootstraps a stored token into the current user', async () => {
    jest.mocked(getAccessToken).mockResolvedValueOnce('stored-token');
    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isBootstrapping).toBe(false));

    expect(result.current.token).toBe('stored-token');
    expect(result.current.user?.email).toBe('tech@fieldops.local');
    expect(removeAccessToken).not.toHaveBeenCalled();
  });

  it('removes an invalid stored token during bootstrap', async () => {
    jest.mocked(getAccessToken).mockResolvedValueOnce('stored-token');
    jest.spyOn(apiClient.auth, 'me').mockRejectedValueOnce(new Error('expired'));
    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isBootstrapping).toBe(false));

    expect(result.current.token).toBeNull();
    expect(result.current.user).toBeNull();
    expect(removeAccessToken).toHaveBeenCalledTimes(1);
  });

  it('signs in, persists token, and signs out', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isBootstrapping).toBe(false));

    await act(async () => {
      await result.current.signIn('tech@fieldops.local', '123456');
    });

    expect(result.current.user?.email).toBe('tech@fieldops.local');
    expect(saveAccessToken).toHaveBeenCalledWith(expect.stringMatching(/^mock-token-/));

    await act(async () => {
      await result.current.signOut();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(removeAccessToken).toHaveBeenCalledTimes(1);
  });
});

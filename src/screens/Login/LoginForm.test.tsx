import { Alert } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import LoginScreen from './LoginScreen';

const mockReplace = jest.fn();
const mockSignIn = jest.fn();

jest.mock('expo-router', () => ({
  router: {
    replace: (...args: unknown[]) => mockReplace(...args)
  }
}));

jest.mock('@/providers/AuthProvider', () => ({
  useAuth: () => ({
    signIn: mockSignIn
  })
}));

describe('LoginForm', () => {
  beforeEach(() => {
    mockSignIn.mockReset();
    mockReplace.mockReset();
    jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('shows validation errors for invalid credentials', async () => {
    const { getByLabelText, getByText } = render(<LoginScreen />);

    fireEvent.changeText(getByLabelText('Email'), 'bad-email');
    fireEvent.changeText(getByLabelText('Пароль'), '123');
    fireEvent.press(getByText('Войти'));

    await waitFor(() => expect(getByText('Введите корректный email')).toBeTruthy());
    expect(getByText('Минимум 6 символов')).toBeTruthy();
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('shows loading while submitting and navigates after success', async () => {
    let resolveSignIn: () => void = () => undefined;
    mockSignIn.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveSignIn = resolve;
        })
    );
    const { getByRole, getByText, queryByText } = render(<LoginScreen />);

    fireEvent.press(getByText('Войти'));

    await waitFor(() => expect(queryByText('Войти')).toBeNull());
    expect(getByRole('button', { busy: true })).toBeTruthy();

    resolveSignIn();

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/'));
  });

  it('shows an alert when login fails', async () => {
    mockSignIn.mockRejectedValueOnce(new Error('Сервер недоступен'));
    const { getByText } = render(<LoginScreen />);

    fireEvent.press(getByText('Войти'));

    await waitFor(() =>
      expect(Alert.alert).toHaveBeenCalledWith('Не удалось войти', 'Сервер недоступен')
    );
  });
});

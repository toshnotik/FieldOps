import { fireEvent, render } from '@testing-library/react-native';
import { TaskCard } from './TaskCard';
import { initialTasks } from '@/shared/api/mockData';

describe('TaskCard', () => {
  it('renders task summary', () => {
    const { getByRole, getByText } = render(<TaskCard task={initialTasks[0]} onPress={jest.fn()} />);

    expect(getByText('Ремонт оборудования')).toBeTruthy();
    expect(getByText('ул. Ленина, 15')).toBeTruthy();
    expect(getByText('Приоритет: Высокий')).toBeTruthy();
    expect(getByText('Статус: В работе')).toBeTruthy();
    expect(getByRole('button', { name: /Ремонт оборудования/ })).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByText } = render(<TaskCard task={initialTasks[0]} onPress={onPress} />);

    fireEvent.press(getByText('Ремонт оборудования'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});

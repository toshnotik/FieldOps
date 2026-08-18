import { render } from '@testing-library/react-native';
import { TaskCard } from './TaskCard';
import { initialTasks } from '@/shared/api/mockData';

describe('TaskCard', () => {
  it('renders task summary', () => {
    const { getByText } = render(<TaskCard task={initialTasks[0]} onPress={jest.fn()} />);

    expect(getByText('Ремонт оборудования')).toBeTruthy();
    expect(getByText('ул. Ленина, 15')).toBeTruthy();
    expect(getByText('Приоритет: Высокий')).toBeTruthy();
    expect(getByText('Статус: В работе')).toBeTruthy();
  });
});

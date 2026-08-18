import { z } from 'zod';

export const taskSchema = z.object({
  title: z.string().min(3, 'Минимум 3 символа'),
  description: z.string().min(10, 'Добавьте описание'),
  address: z.string().min(3, 'Укажите адрес'),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  priority: z.enum(['low', 'medium', 'high']),
  status: z.enum(['new', 'in_progress', 'done']),
  dueDate: z.string().min(10, 'Укажите дату')
});

export type TaskFormValues = z.infer<typeof taskSchema>;

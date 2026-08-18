export function formatTaskDate(value: string) {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));
}

export function toDateInputValue(value: string) {
  return value.slice(0, 16);
}

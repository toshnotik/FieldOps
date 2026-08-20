import { TaskRealtimeEvent } from '@/entities/task/types';

type Listener = (event: TaskRealtimeEvent) => void;

class MockTaskRealtime {
  private listeners = new Set<Listener>();
  private connected = false;
  private timer: ReturnType<typeof setInterval> | null = null;

  connect(onEvent: Listener) {
    this.listeners.add(onEvent);
    this.connected = true;

    return () => {
      this.listeners.delete(onEvent);

      if (!this.listeners.size) {
        this.disconnect();
      }
    };
  }

  emit(event: TaskRealtimeEvent) {
    if (!this.connected) {
      return;
    }

    this.listeners.forEach((listener) => listener(event));
  }

  startSimulation(getRandomEvent: () => TaskRealtimeEvent | null) {
    if (this.timer) {
      return;
    }

    this.timer = setInterval(() => {
      const event = getRandomEvent();

      if (event) {
        this.emit(event);
      }
    }, 25_000);
  }

  disconnect() {
    this.connected = false;

    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}

export const taskRealtime = new MockTaskRealtime();

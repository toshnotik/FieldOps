import { TaskFilters } from '@/entities/task/types';
import { create } from 'zustand';

export interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

interface AppStore {
  selectedTaskId: string | null;
  taskFilters: TaskFilters;
  mapRegion: MapRegion | null;
  theme: 'light' | 'dark';
  setSelectedTaskId: (id: string | null) => void;
  setTaskFilters: (filters: Partial<TaskFilters>) => void;
  setMapRegion: (region: MapRegion) => void;
  toggleTheme: () => void;
}

export const useAppStore = create<AppStore>((set) => ({
  selectedTaskId: null,
  taskFilters: {
    search: '',
    status: 'all',
    priority: 'all'
  },
  mapRegion: null,
  theme: 'light',
  setSelectedTaskId: (id) => set({ selectedTaskId: id }),
  setTaskFilters: (filters) =>
    set((state) => ({
      taskFilters: {
        ...state.taskFilters,
        ...filters
      }
    })),
  setMapRegion: (region) => set({ mapRegion: region }),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' }))
}));

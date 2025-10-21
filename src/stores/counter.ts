import {create} from 'zustand';

interface CounterState {
  count: number;
  increment: () => void;
  decrement: () => void;
}

export const useCounterStore = create<CounterState>((set) => ({
  count: 0,
  increment: () => set((s) => ({count: s.count + 1})),
  decrement: () => set((s) => ({count: s.count - 1})),
}));

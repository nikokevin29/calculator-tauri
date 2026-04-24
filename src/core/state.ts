// Pure vanilla state — zero library dependency

export type CalcState = {
  display: string;
  expression: string;
  memory: number;
  history: string[];
  isResult: boolean; // true setelah = ditekan
  isError: boolean;
};

const initialState: CalcState = {
  display: "0",
  expression: "",
  memory: 0,
  history: [],
  isResult: false,
  isError: false,
};

let state: CalcState = { ...initialState };

type Listener = (state: CalcState) => void;
const listeners = new Set<Listener>();

export const getState = (): CalcState => ({ ...state });

export const setState = (partial: Partial<CalcState>): void => {
  state = { ...state, ...partial };
  listeners.forEach((fn) => fn(state));
};

export const resetState = (): void => {
  state = { ...initialState };
  listeners.forEach((fn) => fn(state));
};

export const subscribe = (fn: Listener): (() => void) => {
  listeners.add(fn);
  fn(state); // emit current state immediately
  return () => listeners.delete(fn);
};

export interface TimeWheelProps {
  valueMinutes: number;
  onChange: (minutes: number) => void;
}

export const HOURS_LIST = Array.from({ length: 24 }, (_, h) => h);
export const MINUTES_LIST = Array.from({ length: 12 }, (_, i) => i * 5);

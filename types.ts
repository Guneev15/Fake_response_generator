
export enum FieldType {
  TEXT = 'Text Input',
  PARAGRAPH = 'Long Answer',
  EMAIL = 'Email',
  SELECT = 'Dropdown Select',
  CHECKBOX = 'Checkbox',
  NUMBER = 'Number',
  DATE = 'Date',
  TIME = 'Time',
  LINEAR_SCALE = 'Linear Scale',
}

export interface FormField {
  id: string;
  label: string;
  type: FieldType;
  options?: string[]; // For Select/Checkbox
  googleEntryId?: string; // The entry.123456 ID for Google Forms
}

export interface GeneratedRecord {
  id: string;
  [key: string]: string | number | boolean | string[];
}

export interface SimulationStats {
  total: number;
  success: number;
  failed: number;
  avgTimePerRecord: number;
}

export type SimulationStatus = 'idle' | 'analyzing' | 'running' | 'completed' | 'stopped';

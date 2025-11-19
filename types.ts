export enum FieldType {
  TEXT = 'Text Input',
  EMAIL = 'Email',
  SELECT = 'Dropdown Select',
  CHECKBOX = 'Checkbox',
  NUMBER = 'Number',
}

export interface FormField {
  id: string;
  label: string;
  type: FieldType;
  options?: string[]; // For Select/Checkbox
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

export type SimulationStatus = 'idle' | 'running' | 'completed';

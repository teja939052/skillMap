export const PROFICIENCY_COLORS: Record<number, string> = {
  0: '#94A3B8',
  1: '#F59E0B',
  2: '#3B82F6',
  3: '#10B981',
  4: '#8B5CF6',
  5: '#EC4899',
};

export const PROFICIENCY_LABELS: Record<number, string> = {
  0: 'Unassessed',
  1: 'Aware',
  2: 'Foundation',
  3: 'Competent',
  4: 'Advanced',
  5: 'Expert',
};

export interface ProficiencyLevel {
  level: number;
  label: string;
  color: string;
}

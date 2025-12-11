
export enum Screen {
  LOGIN = 'LOGIN',
  SIGN_UP = 'SIGN_UP',
  TWO_FACTOR = 'TWO_FACTOR',
  ASSESSMENT = 'ASSESSMENT',
  HOME = 'HOME',
  CHILD_DASHBOARD = 'CHILD_DASHBOARD',
  LEARNING_JOURNEY = 'LEARNING_JOURNEY',
  TRACING = 'TRACING',
  READING = 'READING',
  SPELLING = 'SPELLING',
  MEMORY = 'MEMORY',
  DASHBOARD = 'DASHBOARD',
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD',
  SETTINGS = 'SETTINGS',
  DIFFICULTY_SELECT = 'DIFFICULTY_SELECT',
  FOCUS_SELECT = 'FOCUS_SELECT'
}

export enum Difficulty {
  MILD = 'Mild',
  MODERATE = 'Moderate',
  SEVERE = 'Severe',
  PROFOUND = 'Profound'
}

export interface UserProfile {
  uid: string;
  email: string;
  childName: string;
  role: 'Guardian' | 'Admin';
  assessmentComplete: boolean;
  assignedDifficulty: Difficulty;
  focusAreas?: string[];
  assessmentScores?: {
    wordRecognition: number;
    letterAccuracy: number;
    phonemeMatching: number;
    wordSequencing: number;
    readingComp: number;
    workingMemory: number;
    visualProcessing: number;
    spelling: number;
    overallAverage: number;
  };
}

export interface GuardianApplication {
  id?: string;
  guardianName: string;
  email: string;
  childName: string;
  childAge: string;
  relationship: string;
  notes: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  dateApplied: string;
}

export enum TracingCategory {
  LINES = 'Lines',
  LETTERS = 'Letters',
  NUMBERS = 'Numbers',
  SHAPES = 'Shapes'
}

export interface TracingVariant {
  pathData: string;
  label: string;
  viewBox?: string;
}

export interface TracingItem {
  id: string;
  category: TracingCategory;
  label: string;
  pathData: string; // Default/Fallback
  viewBox: string;
  difficultyConfig?: {
    [key in Difficulty]?: TracingVariant;
  };
}

export interface ReadingVariant {
  word: string;
  sentence: string;
}

export interface ReadingItem {
  id: string;
  difficultyLevel: number;
  word: string; // Default/Fallback
  sentence: string; // Default/Fallback
  difficultyConfig?: {
    [key in Difficulty]?: ReadingVariant;
  };
}

export interface SpellingItem {
  id: string;
  word: string;
  scrambled: string[];
  hint: string;
}

export interface MemoryItem {
  id: string;
  sequence: string;
  type: 'Numbers' | 'Letters' | 'Mixed';
}

export interface ProgressRecord {
  date: string;
  activityType: 'Tracing' | 'Reading' | 'Spelling' | 'Memory';
  score: number;
  details: string;
}

export interface PronunciationResult {
  score: number;
  isCorrect: boolean;
  feedback: string;
  phoneticBreakdown?: string;
}

// === Task Types ===

export type TaskType =
  | 'quiz'
  | 'flashcard'
  | 'email-sim'
  | 'phone-dialog'
  | 'calculator'
  | 'map-routing'
  | 'crisis'
  | 'document-review'
  | 'drag-match'
  | 'fill-blank'
  | 'audio-term';

export interface Task {
  id: string;
  type: TaskType;
  title: string;
  /** Task-specific payload */
  data: TaskData;
}

// === Task Data Interfaces ===

export interface QuizData {
  question: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
}

export interface EmailSimData {
  senderName: string;
  subject: string;
  body: string;
  responses: Array<{
    text: string;
    isCorrect: boolean;
    feedback: string;
  }>;
}

export interface PhoneDialogData {
  turns: Array<{
    speaker: 'npc';
    text: string;
    replies: Array<{
      text: string;
      isCorrect: boolean;
      feedback: string;
    }>;
  }>;
}

export interface CalculatorData {
  problem: string;
  context: string;
  correctAnswer: number;
  tolerancePercent: number; // default 2
  unit: string;
}

export interface MapRoutingData {
  origin: string;
  destination: string;
  routes: Array<{
    name: string;
    miles: number;
    rate: number;
    isOptimal: boolean;
  }>;
}

export interface CrisisData {
  scenario: string;
  timeLimitSeconds: number; // default 60
  options: Array<{
    text: string;
    isCorrect: boolean;
    explanation: string;
  }>;
}

export interface DocReviewData {
  documentType: 'rate-con' | 'bol';
  fields: Array<{
    id: string;
    label: string;
    value: string;
    hasError: boolean;
    errorExplanation?: string;
  }>;
}

export interface DragMatchData {
  pairs: Array<{
    term: string;
    definition: string;
  }>;
}

export interface FillBlankData {
  sentence: string; // blanks marked with ___
  blanks: Array<{
    correctAnswer: string;
    wordBank?: string[]; // if provided, show word bank
  }>;
}

export interface AudioTermData {
  audioUrl: string;
  correctTerm: string;
  options: [string, string, string, string];
}

export type TaskData =
  | QuizData
  | EmailSimData
  | PhoneDialogData
  | CalculatorData
  | MapRoutingData
  | CrisisData
  | DocReviewData
  | DragMatchData
  | FillBlankData
  | AudioTermData;

// === Day/Week Structure ===

export interface DayContent {
  dayId: number; // 1-20
  weekId: number; // 1-4
  title: string;
  estimatedMinutes: number;
  tasks: Task[];
}

export interface WeekContent {
  weekId: number;
  theme: string;
  days: DayContent[];
}

// === Flashcard ===

export interface Flashcard {
  id: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  term: string; // English
  definition: string; // Russian
  example: string; // English usage
}

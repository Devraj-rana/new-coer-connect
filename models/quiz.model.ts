import mongoose, { Schema, Document } from 'mongoose';

export interface IQuizQuestion {
  question: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  options?: string[]; // For multiple choice
  correctAnswer: string | number; // Index for multiple choice, text for others
  points: number;
  explanation?: string;
}

export interface IQuizSubmission {
  studentId: string;
  studentName: string;
  answers: {
    questionIndex: number;
    answer: string | number;
    isCorrect: boolean;
    pointsEarned: number;
  }[];
  score: number;
  totalPoints: number;
  percentage: number;
  timeSpent: number; // in seconds
  submittedAt: Date;
  ipAddress?: string;
}

export interface IQuiz extends Document {
  title: string;
  description: string;
  classId?: string; // Optional - can be linked to a class
  teacher: {
    userId: string;
    firstName: string;
    lastName: string;
    email?: string;
  };
  questions: IQuizQuestion[];
  settings: {
    timeLimit?: number; // in minutes
    attemptsAllowed: number;
    showCorrectAnswers: boolean;
    showScoreImmediately: boolean;
    randomizeQuestions: boolean;
    requireLogin: boolean;
    availableFrom?: Date;
    availableUntil?: Date;
    passingScore?: number; // percentage
  };
  submissions: IQuizSubmission[];
  shareableLink: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const QuizQuestionSchema = new Schema<IQuizQuestion>({
  question: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['multiple-choice', 'true-false', 'short-answer'], 
    required: true 
  },
  options: [String], // For multiple choice questions
  correctAnswer: { type: Schema.Types.Mixed, required: true },
  points: { type: Number, required: true, default: 1 },
  explanation: String
});

const QuizSubmissionSchema = new Schema<IQuizSubmission>({
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  answers: [{
    questionIndex: { type: Number, required: true },
    answer: { type: Schema.Types.Mixed, required: true },
    isCorrect: { type: Boolean, required: true },
    pointsEarned: { type: Number, required: true }
  }],
  score: { type: Number, required: true },
  totalPoints: { type: Number, required: true },
  percentage: { type: Number, required: true },
  timeSpent: { type: Number, required: true },
  submittedAt: { type: Date, default: Date.now },
  ipAddress: String
});

const QuizSchema = new Schema<IQuiz>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  classId: String,
  teacher: {
    userId: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: String
  },
  questions: [QuizQuestionSchema],
  settings: {
    timeLimit: Number,
    attemptsAllowed: { type: Number, default: 1 },
    showCorrectAnswers: { type: Boolean, default: true },
    showScoreImmediately: { type: Boolean, default: true },
    randomizeQuestions: { type: Boolean, default: false },
    requireLogin: { type: Boolean, default: true },
    availableFrom: Date,
    availableUntil: Date,
    passingScore: Number
  },
  submissions: [QuizSubmissionSchema],
  shareableLink: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update timestamp on save
QuizSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create indexes for better performance
QuizSchema.index({ 'teacher.userId': 1 });
QuizSchema.index({ shareableLink: 1 });
QuizSchema.index({ classId: 1 });
QuizSchema.index({ isActive: 1 });

export const Quiz = mongoose.models.Quiz || mongoose.model<IQuiz>('Quiz', QuizSchema);

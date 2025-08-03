import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from './config';
import { UserProfile } from './auth';

export interface FirebaseQuizQuestion {
  question: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  options?: string[];
  correctAnswer: string | number;
  points: number;
  explanation?: string;
}

export interface FirebaseQuizSubmission {
  studentId: string;
  studentName: string;
  studentEmail: string;
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
  submittedAt: Timestamp;
  ipAddress?: string;
}

export interface FirebaseQuiz {
  id?: string;
  title: string;
  description: string;
  classId?: string;
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  questions: FirebaseQuizQuestion[];
  settings: {
    timeLimit?: number;
    attemptsAllowed: number;
    showCorrectAnswers: boolean;
    showScoreImmediately: boolean;
    randomizeQuestions: boolean;
    requireLogin: boolean;
    availableFrom?: Timestamp;
    availableUntil?: Timestamp;
    passingScore?: number;
  };
  submissions: FirebaseQuizSubmission[];
  shareableLink: string;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Create a new quiz
export const createFirebaseQuiz = async (
  quizData: Omit<FirebaseQuiz, 'id' | 'submissions' | 'createdAt' | 'updatedAt'>,
  teacher: UserProfile
): Promise<{ success: boolean; quizId?: string; shareableLink?: string; error?: string }> => {
  try {
    // Generate unique shareable link
    const shareableLink = generateShareableLink();
    
    const quiz: Omit<FirebaseQuiz, 'id'> = {
      ...quizData,
      teacherId: teacher.uid,
      teacherName: teacher.displayName,
      teacherEmail: teacher.email,
      shareableLink,
      submissions: [],
      isActive: true,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp
    };

    const docRef = await addDoc(collection(db, 'quizzes'), quiz);
    
    return {
      success: true,
      quizId: docRef.id,
      shareableLink: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/quiz/${shareableLink}`
    };
  } catch (error: any) {
    console.error('Error creating quiz:', error);
    return {
      success: false,
      error: error.message || 'Failed to create quiz'
    };
  }
};

// Get quizzes by teacher
export const getTeacherFirebaseQuizzes = async (teacherId: string) => {
  try {
    const q = query(
      collection(db, 'quizzes'),
      where('teacherId', '==', teacherId),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const quizzes = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as FirebaseQuiz[];

    return quizzes.map(quiz => ({
      _id: quiz.id!,
      title: quiz.title,
      description: quiz.description,
      classId: quiz.classId,
      questionsCount: quiz.questions.length,
      submissionsCount: quiz.submissions.length,
      settings: quiz.settings,
      shareableLink: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/quiz/${quiz.shareableLink}`,
      createdAt: quiz.createdAt.toDate().toISOString(),
      averageScore: quiz.submissions.length > 0 
        ? Math.round(quiz.submissions.reduce((sum, sub) => sum + sub.percentage, 0) / quiz.submissions.length)
        : 0
    }));
  } catch (error: any) {
    console.error('Error fetching teacher quizzes:', error);
    throw new Error('Failed to fetch quizzes');
  }
};

// Get quiz by shareable link
export const getFirebaseQuizByLink = async (shareableLink: string) => {
  try {
    const q = query(
      collection(db, 'quizzes'),
      where('shareableLink', '==', shareableLink),
      where('isActive', '==', true),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      throw new Error('Quiz not found or no longer available');
    }

    const quizDoc = querySnapshot.docs[0];
    const quiz = { id: quizDoc.id, ...quizDoc.data() } as FirebaseQuiz;

    // Check if quiz is available (time-based)
    const now = new Date();
    if (quiz.settings.availableFrom && quiz.settings.availableFrom.toDate() > now) {
      throw new Error('Quiz is not yet available');
    }
    if (quiz.settings.availableUntil && quiz.settings.availableUntil.toDate() < now) {
      throw new Error('Quiz is no longer available');
    }

    // Return quiz without correct answers for security
    const questionsForStudent = quiz.questions.map(q => ({
      question: q.question,
      type: q.type,
      options: q.options,
      points: q.points
    }));

    return {
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      teacher: quiz.teacherName,
      questions: questionsForStudent,
      settings: {
        timeLimit: quiz.settings.timeLimit,
        attemptsAllowed: quiz.settings.attemptsAllowed,
        randomizeQuestions: quiz.settings.randomizeQuestions,
        requireLogin: quiz.settings.requireLogin
      }
    };
  } catch (error: any) {
    console.error('Error fetching quiz:', error);
    throw new Error(error.message || 'Failed to fetch quiz');
  }
};

// Submit quiz answers
export const submitFirebaseQuiz = async (
  shareableLink: string,
  answers: { questionIndex: number; answer: string | number }[],
  timeSpent: number,
  student: UserProfile | { id: string; name: string; email: string }
) => {
  try {
    const q = query(
      collection(db, 'quizzes'),
      where('shareableLink', '==', shareableLink),
      where('isActive', '==', true),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      throw new Error('Quiz not found');
    }

    const quizDoc = querySnapshot.docs[0];
    const quiz = { id: quizDoc.id, ...quizDoc.data() } as FirebaseQuiz;

    // Get student ID
    const studentId = 'uid' in student ? student.uid : student.id;
    const studentName = 'displayName' in student ? student.displayName : student.name;
    const studentEmail = student.email;

    // Check attempt limit
    const previousAttempts = quiz.submissions.filter(sub => sub.studentId === studentId).length;
    if (previousAttempts >= quiz.settings.attemptsAllowed) {
      throw new Error('Maximum attempts exceeded');
    }

    // Grade the submission
    const gradedAnswers = answers.map(answer => {
      const question = quiz.questions[answer.questionIndex];
      let isCorrect = false;
      
      if (question.type === 'multiple-choice') {
        isCorrect = answer.answer === question.correctAnswer;
      } else if (question.type === 'true-false') {
        isCorrect = answer.answer.toString().toLowerCase() === question.correctAnswer.toString().toLowerCase();
      } else {
        // Short answer - basic string comparison (case-insensitive)
        isCorrect = answer.answer.toString().toLowerCase().trim() === 
                   question.correctAnswer.toString().toLowerCase().trim();
      }

      return {
        questionIndex: answer.questionIndex,
        answer: answer.answer,
        isCorrect,
        pointsEarned: isCorrect ? question.points : 0
      };
    });

    const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);
    const score = gradedAnswers.reduce((sum, a) => sum + a.pointsEarned, 0);
    const percentage = Math.round((score / totalPoints) * 100);

    const submission: FirebaseQuizSubmission = {
      studentId,
      studentName,
      studentEmail,
      answers: gradedAnswers,
      score,
      totalPoints,
      percentage,
      timeSpent,
      submittedAt: serverTimestamp() as Timestamp
    };

    // Update quiz with new submission
    const updatedSubmissions = [...quiz.submissions, submission];
    await updateDoc(doc(db, 'quizzes', quiz.id!), {
      submissions: updatedSubmissions,
      updatedAt: serverTimestamp()
    });

    // Return results
    const result = {
      score,
      totalPoints,
      percentage,
      passed: quiz.settings.passingScore ? percentage >= quiz.settings.passingScore : null,
      answers: quiz.settings.showCorrectAnswers ? gradedAnswers.map((answer, index) => ({
        ...answer,
        correctAnswer: quiz.questions[answer.questionIndex].correctAnswer,
        explanation: quiz.questions[answer.questionIndex].explanation
      })) : undefined
    };

    return result;
  } catch (error: any) {
    console.error('Error submitting quiz:', error);
    throw new Error(error.message || 'Failed to submit quiz');
  }
};

// Get quiz results for teacher
export const getFirebaseQuizResults = async (quizId: string, teacherId: string) => {
  try {
    const quizDoc = await getDoc(doc(db, 'quizzes', quizId));
    if (!quizDoc.exists()) {
      throw new Error('Quiz not found');
    }

    const quiz = { id: quizDoc.id, ...quizDoc.data() } as FirebaseQuiz;
    
    // Verify teacher ownership
    if (quiz.teacherId !== teacherId) {
      throw new Error('Access denied');
    }

    const submissions = quiz.submissions.sort((a, b) => 
      b.submittedAt.toDate().getTime() - a.submittedAt.toDate().getTime()
    );

    const analytics = {
      totalSubmissions: submissions.length,
      averageScore: submissions.length > 0 
        ? Math.round(submissions.reduce((sum, sub) => sum + sub.percentage, 0) / submissions.length)
        : 0,
      highestScore: submissions.length > 0 
        ? Math.max(...submissions.map(sub => sub.percentage))
        : 0,
      lowestScore: submissions.length > 0 
        ? Math.min(...submissions.map(sub => sub.percentage))
        : 0,
      passRate: quiz.settings.passingScore && submissions.length > 0
        ? Math.round((submissions.filter(sub => sub.percentage >= quiz.settings.passingScore!).length / submissions.length) * 100)
        : null
    };

    return {
      quiz: {
        _id: quiz.id!,
        title: quiz.title,
        description: quiz.description,
        questions: quiz.questions,
        settings: quiz.settings
      },
      submissions: submissions.map(sub => ({
        ...sub,
        submittedAt: sub.submittedAt.toDate().toISOString()
      })),
      analytics
    };
  } catch (error: any) {
    console.error('Error fetching quiz results:', error);
    throw new Error('Failed to fetch quiz results');
  }
};

// Helper function to generate shareable link
function generateShareableLink(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Update quiz
export const updateFirebaseQuiz = async (
  quizId: string, 
  updateData: Partial<FirebaseQuiz>,
  teacherId: string
) => {
  try {
    const quizDoc = await getDoc(doc(db, 'quizzes', quizId));
    if (!quizDoc.exists()) {
      throw new Error('Quiz not found');
    }

    const quiz = quizDoc.data() as FirebaseQuiz;
    if (quiz.teacherId !== teacherId) {
      throw new Error('Access denied');
    }

    await updateDoc(doc(db, 'quizzes', quizId), {
      ...updateData,
      updatedAt: serverTimestamp()
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error updating quiz:', error);
    throw new Error('Failed to update quiz');
  }
};

// Delete quiz
export const deleteFirebaseQuiz = async (quizId: string, teacherId: string) => {
  try {
    const quizDoc = await getDoc(doc(db, 'quizzes', quizId));
    if (!quizDoc.exists()) {
      throw new Error('Quiz not found');
    }

    const quiz = quizDoc.data() as FirebaseQuiz;
    if (quiz.teacherId !== teacherId) {
      throw new Error('Access denied');
    }

    // Soft delete by setting isActive to false
    await updateDoc(doc(db, 'quizzes', quizId), {
      isActive: false,
      updatedAt: serverTimestamp()
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting quiz:', error);
    throw new Error('Failed to delete quiz');
  }
};

"use server"

import { Quiz, IQuiz, IQuizQuestion, IQuizSubmission } from "@/models/quiz.model";
import { currentUser } from "@clerk/nextjs/server";
import connectDB from "./db";
import { revalidatePath } from "next/cache";

// Generate a unique shareable link
function generateShareableLink(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// Create a new quiz
export const createQuiz = async (quizData: {
  title: string;
  description: string;
  classId?: string;
  questions: IQuizQuestion[];
  settings: {
    timeLimit?: number;
    attemptsAllowed: number;
    showCorrectAnswers: boolean;
    showScoreImmediately: boolean;
    randomizeQuestions: boolean;
    requireLogin: boolean;
    availableFrom?: Date;
    availableUntil?: Date;
    passingScore?: number;
  };
}) => {
  await connectDB();
  const user = await currentUser();
  if (!user) throw new Error('User not authenticated');

  try {
    // Generate unique shareable link
    let shareableLink = generateShareableLink();
    let existingQuiz = await Quiz.findOne({ shareableLink });
    
    // Ensure uniqueness
    while (existingQuiz) {
      shareableLink = generateShareableLink();
      existingQuiz = await Quiz.findOne({ shareableLink });
    }

    const teacherData = {
      userId: user.id,
      firstName: user.firstName || "Teacher",
      lastName: user.lastName || "User",
      email: user.emailAddresses[0]?.emailAddress
    };

    const newQuiz = await Quiz.create({
      ...quizData,
      teacher: teacherData,
      shareableLink,
      submissions: [],
      isActive: true
    });

    revalidatePath('/dashboard');
    revalidatePath('/classes');
    
    return {
      success: true,
      quiz: newQuiz,
      shareableLink: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/quiz/${shareableLink}`
    };
  } catch (error: any) {
    console.error('Error creating quiz:', error);
    throw new Error(error.message || 'Failed to create quiz');
  }
};

// Get quizzes for a teacher
export const getTeacherQuizzes = async (userId?: string) => {
  await connectDB();
  
  try {
    const user = userId ? { id: userId } : await currentUser();
    if (!user) throw new Error('User not authenticated');

    const quizzes = await Quiz.find({
      'teacher.userId': user.id,
      isActive: true
    })
    .select('title description classId questions settings submissions shareableLink createdAt')
    .sort({ createdAt: -1 });

    // Transform data for frontend
    return quizzes.map(quiz => ({
      _id: quiz._id.toString(),
      title: quiz.title,
      description: quiz.description,
      classId: quiz.classId,
      questionsCount: quiz.questions.length,
      submissionsCount: quiz.submissions.length,
      settings: quiz.settings,
      shareableLink: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/quiz/${quiz.shareableLink}`,
      createdAt: quiz.createdAt,
      averageScore: quiz.submissions.length > 0 
        ? Math.round(quiz.submissions.reduce((sum: number, sub: any) => sum + sub.percentage, 0) / quiz.submissions.length)
        : 0
    }));
  } catch (error: any) {
    console.error('Error fetching teacher quizzes:', error);
    throw new Error('Failed to fetch quizzes');
  }
};

// Get quiz by shareable link (for students)
export const getQuizByLink = async (shareableLink: string) => {
  await connectDB();
  
  try {
    const quiz = await Quiz.findOne({ 
      shareableLink, 
      isActive: true 
    }).select('title description teacher questions settings classId');

    if (!quiz) {
      throw new Error('Quiz not found or no longer available');
    }

    // Check if quiz is available (time-based)
    const now = new Date();
    if (quiz.settings.availableFrom && now < quiz.settings.availableFrom) {
      throw new Error('Quiz is not yet available');
    }
    if (quiz.settings.availableUntil && now > quiz.settings.availableUntil) {
      throw new Error('Quiz is no longer available');
    }

    // Don't send correct answers to frontend
    const questionsForStudent = quiz.questions.map((q: any) => ({
      question: q.question,
      type: q.type,
      options: q.options,
      points: q.points
    }));

    return {
      _id: quiz._id.toString(),
      title: quiz.title,
      description: quiz.description,
      teacher: `${quiz.teacher.firstName} ${quiz.teacher.lastName}`,
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
export const submitQuiz = async (
  shareableLink: string,
  answers: { questionIndex: number; answer: string | number }[],
  timeSpent: number,
  studentInfo?: { id: string; name: string }
) => {
  await connectDB();
  
  try {
    const quiz = await Quiz.findOne({ shareableLink, isActive: true });
    if (!quiz) throw new Error('Quiz not found');

    // Get student info
    let studentId = 'anonymous';
    let studentName = 'Anonymous Student';
    
    if (quiz.settings.requireLogin) {
      const user = await currentUser();
      if (!user) throw new Error('Login required for this quiz');
      studentId = user.id;
      studentName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    } else if (studentInfo) {
      studentId = studentInfo.id;
      studentName = studentInfo.name;
    }

    // Check attempt limit
    const previousAttempts = quiz.submissions.filter((sub: any) => sub.studentId === studentId).length;
    if (previousAttempts >= quiz.settings.attemptsAllowed) {
      throw new Error('Maximum attempts exceeded');
    }

    // Grade the submission
    const gradedAnswers = answers.map(answer => {
      const question = quiz.questions[answer.questionIndex];
      const isCorrect = question.correctAnswer.toString() === answer.answer.toString();
      const pointsEarned = isCorrect ? question.points : 0;

      return {
        questionIndex: answer.questionIndex,
        answer: answer.answer,
        isCorrect,
        pointsEarned
      };
    });

    const score = gradedAnswers.reduce((sum: number, answer: any) => sum + answer.pointsEarned, 0);
    const totalPoints = quiz.questions.reduce((sum: number, q: any) => sum + q.points, 0);
    const percentage = Math.round((score / totalPoints) * 100);

    const submission: IQuizSubmission = {
      studentId,
      studentName,
      answers: gradedAnswers,
      score,
      totalPoints,
      percentage,
      timeSpent,
      submittedAt: new Date()
    };

    // Add submission to quiz
    quiz.submissions.push(submission);
    await quiz.save();

    // Prepare response based on settings
    const response: any = {
      submitted: true,
      score,
      totalPoints,
      percentage,
      timeSpent
    };

    if (quiz.settings.showScoreImmediately) {
      response.showScore = true;
    }

    if (quiz.settings.showCorrectAnswers) {
      response.correctAnswers = quiz.questions.map((q: any, index: number) => ({
        questionIndex: index,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        userAnswer: answers.find((a: any) => a.questionIndex === index)?.answer
      }));
    }

    // Check if passed
    if (quiz.settings.passingScore) {
      response.passed = percentage >= quiz.settings.passingScore;
    }

    revalidatePath(`/quiz/${shareableLink}`);
    
    return response;
  } catch (error: any) {
    console.error('Error submitting quiz:', error);
    throw new Error(error.message || 'Failed to submit quiz');
  }
};

// Get quiz results for teacher
export const getQuizResults = async (quizId: string) => {
  await connectDB();
  const user = await currentUser();
  if (!user) throw new Error('User not authenticated');

  try {
    const quiz = await Quiz.findOne({
      _id: quizId,
      'teacher.userId': user.id
    });

    if (!quiz) throw new Error('Quiz not found or access denied');

    const submissions = quiz.submissions.sort((a: any, b: any) => 
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );

    const analytics = {
      totalSubmissions: submissions.length,
      averageScore: submissions.length > 0 
        ? Math.round(submissions.reduce((sum: number, sub: any) => sum + sub.percentage, 0) / submissions.length)
        : 0,
      highestScore: submissions.length > 0 
        ? Math.max(...submissions.map((sub: any) => sub.percentage))
        : 0,
      lowestScore: submissions.length > 0 
        ? Math.min(...submissions.map((sub: any) => sub.percentage))
        : 0,
      passRate: quiz.settings.passingScore 
        ? Math.round((submissions.filter((sub: any) => sub.percentage >= quiz.settings.passingScore!).length / submissions.length) * 100)
        : null
    };

    return {
      quiz: {
        _id: quiz._id.toString(),
        title: quiz.title,
        description: quiz.description,
        questions: quiz.questions,
        settings: quiz.settings
      },
      submissions: submissions.map((sub: any) => ({
        ...sub,
        submittedAt: sub.submittedAt.toISOString()
      })),
      analytics
    };
  } catch (error: any) {
    console.error('Error fetching quiz results:', error);
    throw new Error('Failed to fetch quiz results');
  }
};

// Update quiz
export const updateQuiz = async (quizId: string, updateData: Partial<IQuiz>) => {
  await connectDB();
  const user = await currentUser();
  if (!user) throw new Error('User not authenticated');

  try {
    const quiz = await Quiz.findOneAndUpdate(
      { 
        _id: quizId, 
        'teacher.userId': user.id 
      },
      { 
        ...updateData,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!quiz) throw new Error('Quiz not found or access denied');

    revalidatePath('/dashboard');
    return quiz;
  } catch (error: any) {
    console.error('Error updating quiz:', error);
    throw new Error('Failed to update quiz');
  }
};

// Delete quiz
export const deleteQuiz = async (quizId: string) => {
  await connectDB();
  const user = await currentUser();
  if (!user) throw new Error('User not authenticated');

  try {
    const quiz = await Quiz.findOneAndUpdate(
      { 
        _id: quizId, 
        'teacher.userId': user.id 
      },
      { isActive: false },
      { new: true }
    );

    if (!quiz) throw new Error('Quiz not found or access denied');

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting quiz:', error);
    throw new Error('Failed to delete quiz');
  }
};

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { getQuizResults } from '@/lib/quizActions';
import { IQuizQuestion } from '@/models/quiz.model';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Download, TrendingUp, Users, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface QuizSubmission {
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
  timeSpent: number;
  submittedAt: string;
  ipAddress?: string;
}

interface QuizResultsData {
  quiz: {
    _id: string;
    title: string;
    description: string;
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
  };
  submissions: QuizSubmission[];
  analytics: {
    totalSubmissions: number;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
    passRate: number | null;
  };
}

export default function QuizResultsPage() {
  const params = useParams();
  const [quizData, setQuizData] = useState<QuizResultsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSubmissions, setExpandedSubmissions] = useState<Set<string>>(new Set());

  const loadQuizResults = useCallback(async () => {
    if (!params.id) return;
    
    try {
      const result = await getQuizResults(params.id as string);
      setQuizData(result);
    } catch (error) {
      console.error('Error loading quiz results:', error);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    loadQuizResults();
  }, [loadQuizResults]);

  const toggleSubmissionExpansion = (submissionId: string) => {
    const newExpanded = new Set(expandedSubmissions);
    if (newExpanded.has(submissionId)) {
      newExpanded.delete(submissionId);
    } else {
      newExpanded.add(submissionId);
    }
    setExpandedSubmissions(newExpanded);
  };

  const exportResults = () => {
    if (!quizData) return;

    const csvContent = [
      ['Student Name', 'Score', 'Percentage', 'Status', 'Submitted At'],
      ...quizData.submissions.map(submission => [
        submission.studentName,
        submission.score.toString(),
        `${submission.percentage}%`,
        quizData.quiz.settings.passingScore 
          ? (submission.percentage >= quizData.quiz.settings.passingScore ? 'Passed' : 'Failed')
          : 'N/A',
        new Date(submission.submittedAt).toLocaleString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${quizData.quiz.title}-results.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!quizData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Quiz not found</h1>
          <Link href="/classes">
            <Button>Back to Classes</Button>
          </Link>
        </div>
      </div>
    );
  }

  const { quiz, submissions, analytics } = quizData;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{quiz.title}</h1>
            <p className="text-gray-600 mt-2">{quiz.description}</p>
            <div className="flex items-center gap-4 mt-4">
              <Badge variant="outline">
                {quiz.questions.length} Questions
              </Badge>
              {quiz.settings.timeLimit && (
                <Badge variant="outline">
                  {quiz.settings.timeLimit} Minutes
                </Badge>
              )}
              <Badge variant="default">Active</Badge>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={exportResults} disabled={!submissions.length}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Link href="/classes">
              <Button variant="outline">Back to Classes</Button>
            </Link>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.totalSubmissions}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Average Score</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.averageScore}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pass Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.passRate !== null ? `${analytics.passRate}%` : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Score Range</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.lowestScore}%-{analytics.highestScore}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submissions */}
        <Card>
          <CardHeader>
            <CardTitle>Student Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            {submissions.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions yet</h3>
                <p className="text-gray-600">Students haven't submitted any responses for this quiz yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {submissions.map((submission, index) => (
                  <div key={`${submission.studentId}-${index}`} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h4 className="font-medium text-gray-900">{submission.studentName}</h4>
                          <p className="text-sm text-gray-600">Score: {submission.score}/{submission.totalPoints}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={
                            quiz.settings.passingScore 
                              ? (submission.percentage >= quiz.settings.passingScore ? "default" : "destructive")
                              : "default"
                          }>
                            {submission.percentage}%
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                          {new Date(submission.submittedAt).toLocaleDateString()}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSubmissionExpansion(`${submission.studentId}-${index}`)}
                        >
                          {expandedSubmissions.has(`${submission.studentId}-${index}`) ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {expandedSubmissions.has(`${submission.studentId}-${index}`) && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h5 className="font-medium text-gray-900 mb-3">Detailed Answers</h5>
                        <div className="space-y-3">
                          {submission.answers.map((answer, answerIndex) => {
                            const question = quiz.questions[answer.questionIndex];
                            const isCorrect = answer.isCorrect;
                            return (
                              <div key={answerIndex} className="bg-gray-50 p-3 rounded">
                                <p className="font-medium text-gray-900 mb-2">
                                  {answer.questionIndex + 1}. {question.question}
                                </p>
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm text-gray-600">Answer:</span>
                                  <span className={`text-sm font-medium ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                    {String(answer.answer)}
                                  </span>
                                  <Badge variant={isCorrect ? "default" : "destructive"} className="text-xs">
                                    {isCorrect ? "Correct" : "Incorrect"}
                                  </Badge>
                                </div>
                                {!isCorrect && question.correctAnswer && (
                                  <p className="text-sm text-green-600 mt-1">
                                    Correct answer: {String(question.correctAnswer)}
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

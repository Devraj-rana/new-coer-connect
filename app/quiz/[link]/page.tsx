"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Clock, 
  User, 
  CheckCircle, 
  AlertCircle, 
  Trophy,
  FileText,
  Send,
  Timer,
  RotateCcw
} from "lucide-react";
import { getQuizByLink, submitQuiz } from "@/lib/quizActions";
import { useUser } from "@clerk/nextjs";
import { toast } from "@/hooks/use-toast";

interface QuizData {
  _id: string;
  title: string;
  description: string;
  teacher: string;
  questions: {
    question: string;
    type: 'multiple-choice' | 'true-false' | 'short-answer';
    options?: string[];
    points: number;
  }[];
  settings: {
    timeLimit?: number;
    attemptsAllowed: number;
    randomizeQuestions: boolean;
    requireLogin: boolean;
  };
}

interface QuizTakePageProps {
  params: {
    link: string;
  };
}

export default function QuizTakePage({ params }: QuizTakePageProps) {
  const { user } = useUser();
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Quiz state
  const [answers, setAnswers] = useState<{ [key: number]: string | number }>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  
  // Results
  const [results, setResults] = useState<any>(null);
  
  // Guest user info (for non-login quizzes)
  const [guestName, setGuestName] = useState("");

  useEffect(() => {
    async function loadQuiz() {
      try {
        setLoading(true);
        const quizData = await getQuizByLink(params.link);
        setQuiz(quizData);
        
        if (quizData.settings.timeLimit) {
          setTimeLeft(quizData.settings.timeLimit * 60); // Convert to seconds
        }
      } catch (err: any) {
        setError(err.message || "Failed to load quiz");
      } finally {
        setLoading(false);
      }
    }
    
    loadQuiz();
  }, [params.link]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    const autoSubmitQuiz = async () => {
      try {
        setSubmitting(true);
        
        const answersArray = Object.entries(answers).map(([questionIndex, answer]) => ({
          questionIndex: parseInt(questionIndex),
          answer
        }));

        const studentInfo = user 
          ? { id: user.id, name: `${user.firstName || ''} ${user.lastName || ''}`.trim() }
          : { id: `guest_${Date.now()}`, name: guestName.trim() };

        const result = await submitQuiz(
          params.link,
          answersArray,
          timeSpent,
          !quiz?.settings.requireLogin ? studentInfo : undefined
        );

        setResults(result);
        setSubmitted(true);
        
        toast({
          title: "Time's Up!",
          description: "Quiz auto-submitted due to time limit.",
        });
      } catch (error: any) {
        toast({
          title: "Submission Error",
          description: error.message || "Failed to submit quiz",
          variant: "destructive"
        });
      } finally {
        setSubmitting(false);
      }
    };
    
    if (started && !submitted && timeLeft !== null && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev === null || prev <= 1) {
            autoSubmitQuiz(); // Auto-submit when time runs out
            return 0;
          }
          return prev - 1;
        });
        setTimeSpent(prev => prev + 1);
      }, 1000);
    } else if (started && !submitted && timeLeft === null) {
      interval = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [started, submitted, timeLeft, answers, user, guestName, params.link, quiz?.settings.requireLogin, timeSpent]);

  const handleStartQuiz = () => {
    if (quiz?.settings.requireLogin && !user) {
      toast({
        title: "Login Required",
        description: "You must be logged in to take this quiz",
        variant: "destructive"
      });
      return;
    }
    
    if (!quiz?.settings.requireLogin && !user && !guestName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your name to continue",
        variant: "destructive"
      });
      return;
    }
    
    setStarted(true);
  };

  const handleAnswerChange = (questionIndex: number, answer: string | number) => {
    setAnswers({
      ...answers,
      [questionIndex]: answer
    });
  };

  const handleSubmitQuiz = async () => {
    try {
      setSubmitting(true);
      
      const answersArray = Object.entries(answers).map(([questionIndex, answer]) => ({
        questionIndex: parseInt(questionIndex),
        answer
      }));

      const studentInfo = user 
        ? { id: user.id, name: `${user.firstName || ''} ${user.lastName || ''}`.trim() }
        : { id: `guest_${Date.now()}`, name: guestName.trim() };

      const result = await submitQuiz(
        params.link,
        answersArray,
        timeSpent,
        !quiz?.settings.requireLogin ? studentInfo : undefined
      );

      setResults(result);
      setSubmitted(true);
      
      toast({
        title: "Quiz Submitted!",
        description: "Your answers have been recorded successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Submission Error",
        description: error.message || "Failed to submit quiz",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    const answeredQuestions = Object.keys(answers).length;
    return quiz ? (answeredQuestions / quiz.questions.length) * 100 : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Clock className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-medium">Loading Quiz...</h3>
              <p className="text-gray-600">Please wait while we fetch the quiz details</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-red-800">Quiz Not Available</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()} variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!quiz) return null;

  // Results page
  if (submitted && results) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4">
                {results.passed !== undefined ? (
                  results.passed ? (
                    <CheckCircle className="h-16 w-16 text-green-600" />
                  ) : (
                    <AlertCircle className="h-16 w-16 text-orange-600" />
                  )
                ) : (
                  <Trophy className="h-16 w-16 text-blue-600" />
                )}
              </div>
              <CardTitle className="text-2xl">Quiz Completed!</CardTitle>
              <p className="text-gray-600">Thank you for taking "{quiz.title}"</p>
            </CardHeader>
            <CardContent>
              {results.showScore && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center bg-blue-50 rounded-lg p-4">
                    <div className="text-3xl font-bold text-blue-600">{results.percentage}%</div>
                    <div className="text-blue-800">Score</div>
                  </div>
                  <div className="text-center bg-green-50 rounded-lg p-4">
                    <div className="text-3xl font-bold text-green-600">
                      {results.score}/{results.totalPoints}
                    </div>
                    <div className="text-green-800">Points</div>
                  </div>
                  <div className="text-center bg-purple-50 rounded-lg p-4">
                    <div className="text-3xl font-bold text-purple-600">{formatTime(results.timeSpent)}</div>
                    <div className="text-purple-800">Time Taken</div>
                  </div>
                </div>
              )}

              {results.passed !== undefined && (
                <div className={`text-center p-4 rounded-lg mb-6 ${
                  results.passed ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                }`}>
                  <Trophy className="h-8 w-8 mx-auto mb-2" />
                  <div className="font-medium">
                    {results.passed ? 'Congratulations! You passed!' : 'You did not meet the passing score'}
                  </div>
                </div>
              )}

              {results.correctAnswers && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Review Your Answers</h3>
                  {results.correctAnswers.map((answer: any, index: number) => {
                    const question = quiz.questions[answer.questionIndex];
                    const isCorrect = answer.userAnswer?.toString() === answer.correctAnswer?.toString();
                    
                    return (
                      <div key={index} className="border rounded-lg p-4 space-y-2">
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium">{question.question}</h4>
                          <Badge variant={isCorrect ? "default" : "destructive"}>
                            {isCorrect ? "Correct" : "Incorrect"}
                          </Badge>
                        </div>
                        
                        <div className="space-y-1 text-sm">
                          <div>
                            <span className="font-medium">Your answer: </span>
                            <span className={isCorrect ? "text-green-600" : "text-red-600"}>
                              {question.type === 'multiple-choice' && question.options
                                ? question.options[answer.userAnswer as number] || 'Not answered'
                                : answer.userAnswer || 'Not answered'}
                            </span>
                          </div>
                          
                          {!isCorrect && (
                            <div>
                              <span className="font-medium">Correct answer: </span>
                              <span className="text-green-600">
                                {question.type === 'multiple-choice' && question.options
                                  ? question.options[answer.correctAnswer as number]
                                  : answer.correctAnswer}
                              </span>
                            </div>
                          )}
                          
                          {answer.explanation && (
                            <div className="bg-blue-50 p-2 rounded text-blue-800">
                              <span className="font-medium">Explanation: </span>
                              {answer.explanation}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Pre-start page
  if (!started) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{quiz.title}</CardTitle>
              <p className="text-gray-600">{quiz.description}</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <User className="w-4 h-4" />
                <span className="text-sm">Created by {quiz.teacher}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Quiz Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="text-xl font-bold text-blue-600">{quiz.questions.length}</div>
                  <div className="text-xs text-blue-800">Questions</div>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="text-xl font-bold text-green-600">
                    {quiz.questions.reduce((sum, q) => sum + q.points, 0)}
                  </div>
                  <div className="text-xs text-green-800">Total Points</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-3">
                  <div className="text-xl font-bold text-purple-600">
                    {quiz.settings.timeLimit ? `${quiz.settings.timeLimit}m` : '∞'}
                  </div>
                  <div className="text-xs text-purple-800">Time Limit</div>
                </div>
                <div className="bg-orange-50 rounded-lg p-3">
                  <div className="text-xl font-bold text-orange-600">{quiz.settings.attemptsAllowed}</div>
                  <div className="text-xs text-orange-800">Attempts</div>
                </div>
              </div>

              {/* Guest name input */}
              {!quiz.settings.requireLogin && !user && (
                <div>
                  <Label htmlFor="guestName">Your Name *</Label>
                  <Input
                    id="guestName"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Enter your name to continue..."
                    className="mt-1"
                  />
                </div>
              )}

              {/* Instructions */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h3 className="font-medium text-amber-800 mb-2">Instructions:</h3>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>• Read each question carefully before answering</li>
                  {quiz.settings.timeLimit && (
                    <li>• You have {quiz.settings.timeLimit} minutes to complete the quiz</li>
                  )}
                  <li>• You can review and change answers before submitting</li>
                  <li>• You have {quiz.settings.attemptsAllowed} attempt{quiz.settings.attemptsAllowed > 1 ? 's' : ''} to take this quiz</li>
                  {quiz.settings.randomizeQuestions && (
                    <li>• Questions will be presented in random order</li>
                  )}
                </ul>
              </div>

              <Button onClick={handleStartQuiz} className="w-full" size="lg">
                <FileText className="w-4 h-4 mr-2" />
                Start Quiz
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Quiz taking interface
  const currentQ = quiz.questions[currentQuestion];
  const progress = getProgressPercentage();

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header with timer and progress */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-xl font-bold">{quiz.title}</h1>
                <p className="text-sm text-gray-600">
                  Question {currentQuestion + 1} of {quiz.questions.length}
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                {timeLeft !== null && (
                  <div className="flex items-center gap-2">
                    <Timer className={`w-5 h-5 ${timeLeft < 300 ? 'text-red-600' : 'text-blue-600'}`} />
                    <span className={`font-mono text-lg ${timeLeft < 300 ? 'text-red-600' : 'text-blue-600'}`}>
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                )}
                
                <div className="text-right">
                  <div className="text-sm text-gray-600">Progress</div>
                  <div className="text-lg font-semibold">{Math.round(progress)}%</div>
                </div>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Question */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">
              {currentQ.question}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Badge variant="outline">{currentQ.points} point{currentQ.points !== 1 ? 's' : ''}</Badge>
              <Badge variant="secondary">{currentQ.type}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {/* Multiple Choice */}
            {currentQ.type === 'multiple-choice' && currentQ.options && (
              <RadioGroup
                value={answers[currentQuestion]?.toString() || ''}
                onValueChange={(value: string) => handleAnswerChange(currentQuestion, parseInt(value))}
              >
                {currentQ.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50 border">
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                      <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {/* True/False */}
            {currentQ.type === 'true-false' && (
              <RadioGroup
                value={answers[currentQuestion]?.toString() || ''}
                onValueChange={(value: string) => handleAnswerChange(currentQuestion, value)}
              >
                <div className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50 border">
                  <RadioGroupItem value="true" id="true" />
                  <Label htmlFor="true" className="flex-1 cursor-pointer">True</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50 border">
                  <RadioGroupItem value="false" id="false" />
                  <Label htmlFor="false" className="flex-1 cursor-pointer">False</Label>
                </div>
              </RadioGroup>
            )}

            {/* Short Answer */}
            {currentQ.type === 'short-answer' && (
              <Textarea
                value={answers[currentQuestion]?.toString() || ''}
                onChange={(e) => handleAnswerChange(currentQuestion, e.target.value)}
                placeholder="Type your answer here..."
                rows={4}
              />
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>
          
          <div className="flex gap-2">
            {quiz.questions.map((_, index) => (
              <Button
                key={index}
                variant={answers[index] !== undefined ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentQuestion(index)}
                className={`w-10 h-10 p-0 ${currentQuestion === index ? 'ring-2 ring-blue-600' : ''}`}
              >
                {index + 1}
              </Button>
            ))}
          </div>
          
          <div className="flex gap-2">
            {currentQuestion < quiz.questions.length - 1 ? (
              <Button
                onClick={() => setCurrentQuestion(Math.min(quiz.questions.length - 1, currentQuestion + 1))}
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmitQuiz}
                disabled={submitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {submitting ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Quiz
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

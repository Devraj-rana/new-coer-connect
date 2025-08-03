"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Trash2, 
  Copy, 
  Save, 
  Clock, 
  Users, 
  BarChart3,
  Settings,
  Eye,
  Link as LinkIcon
} from "lucide-react";
import { createQuiz } from "@/lib/quizActions";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";

interface QuizQuestion {
  question: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  options?: string[];
  correctAnswer: string | number;
  points: number;
  explanation?: string;
}

interface QuizSettings {
  timeLimit?: number;
  attemptsAllowed: number;
  showCorrectAnswers: boolean;
  showScoreImmediately: boolean;
  randomizeQuestions: boolean;
  requireLogin: boolean;
  availableFrom?: Date;
  availableUntil?: Date;
  passingScore?: number;
}

export default function CreateQuizPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  
  // Quiz basic info
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [classId, setClassId] = useState("");
  
  // Questions
  const [questions, setQuestions] = useState<QuizQuestion[]>([
    {
      question: "",
      type: "multiple-choice",
      options: ["", "", "", ""],
      correctAnswer: 0,
      points: 1,
      explanation: ""
    }
  ]);
  
  // Settings
  const [settings, setSettings] = useState<QuizSettings>({
    attemptsAllowed: 1,
    showCorrectAnswers: true,
    showScoreImmediately: true,
    randomizeQuestions: false,
    requireLogin: true
  });

  const [createdQuiz, setCreatedQuiz] = useState<any>(null);

  const addQuestion = () => {
    setQuestions([...questions, {
      question: "",
      type: "multiple-choice",
      options: ["", "", "", ""],
      correctAnswer: 0,
      points: 1,
      explanation: ""
    }]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updatedQuestions = [...questions];
    if (field === 'type') {
      updatedQuestions[index] = {
        ...updatedQuestions[index],
        [field]: value,
        options: value === 'multiple-choice' ? ["", "", "", ""] : undefined,
        correctAnswer: value === 'true-false' ? 'true' : value === 'multiple-choice' ? 0 : ""
      };
    } else {
      updatedQuestions[index] = {
        ...updatedQuestions[index],
        [field]: value
      };
    }
    setQuestions(updatedQuestions);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updatedQuestions = [...questions];
    if (updatedQuestions[questionIndex].options) {
      updatedQuestions[questionIndex].options![optionIndex] = value;
      setQuestions(updatedQuestions);
    }
  };

  const handleCreateQuiz = async () => {
    try {
      setLoading(true);
      
      // Validate
      if (!title.trim() || !description.trim()) {
        toast({
          title: "Validation Error",
          description: "Please fill in title and description",
          variant: "destructive"
        });
        return;
      }

      const validQuestions = questions.filter(q => q.question.trim());
      if (validQuestions.length === 0) {
        toast({
          title: "Validation Error", 
          description: "Please add at least one question",
          variant: "destructive"
        });
        return;
      }

      const result = await createQuiz({
        title: title.trim(),
        description: description.trim(),
        classId: classId || undefined,
        questions: validQuestions,
        settings
      });

      setCreatedQuiz(result);
      setActiveStep(4);
      
      toast({
        title: "Quiz Created!",
        description: "Your quiz has been created successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create quiz",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyShareableLink = () => {
    if (createdQuiz?.shareableLink) {
      navigator.clipboard.writeText(createdQuiz.shareableLink);
      toast({
        title: "Link Copied!",
        description: "Shareable link copied to clipboard",
      });
    }
  };

  const renderBasicInfo = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Quiz Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="title">Quiz Title *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter quiz title..."
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what this quiz covers..."
            rows={3}
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="classId">Link to Class (Optional)</Label>
          <Input
            id="classId"
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            placeholder="Class ID (optional)"
            className="mt-1"
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderQuestions = () => (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Questions ({questions.length})
          </CardTitle>
          <Button onClick={addQuestion} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Question
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {questions.map((question, index) => (
          <div key={index} className="border rounded-lg p-4 space-y-4">
            <div className="flex justify-between items-start">
              <Badge variant="outline">Question {index + 1}</Badge>
              {questions.length > 1 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => removeQuestion(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Label>Question Text *</Label>
                <Textarea
                  value={question.question}
                  onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                  placeholder="Enter your question..."
                  rows={2}
                  className="mt-1"
                />
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label>Question Type</Label>
                  <Select 
                    value={question.type} 
                    onValueChange={(value) => updateQuestion(index, 'type', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                      <SelectItem value="true-false">True/False</SelectItem>
                      <SelectItem value="short-answer">Short Answer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Points</Label>
                  <Input
                    type="number"
                    min="1"
                    value={question.points}
                    onChange={(e) => updateQuestion(index, 'points', parseInt(e.target.value) || 1)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
            
            {/* Question Type Specific Fields */}
            {question.type === 'multiple-choice' && (
              <div>
                <Label>Answer Options</Label>
                <div className="space-y-2 mt-1">
                  {question.options?.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex gap-2">
                      <Button
                        type="button"
                        variant={question.correctAnswer === optionIndex ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateQuestion(index, 'correctAnswer', optionIndex)}
                        className="px-3"
                      >
                        {String.fromCharCode(65 + optionIndex)}
                      </Button>
                      <Input
                        value={option}
                        onChange={(e) => updateOption(index, optionIndex, e.target.value)}
                        placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">Click the letter to mark as correct answer</p>
              </div>
            )}
            
            {question.type === 'true-false' && (
              <div>
                <Label>Correct Answer</Label>
                <div className="flex gap-2 mt-1">
                  <Button
                    type="button"
                    variant={question.correctAnswer === 'true' ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateQuestion(index, 'correctAnswer', 'true')}
                  >
                    True
                  </Button>
                  <Button
                    type="button"
                    variant={question.correctAnswer === 'false' ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateQuestion(index, 'correctAnswer', 'false')}
                  >
                    False
                  </Button>
                </div>
              </div>
            )}
            
            {question.type === 'short-answer' && (
              <div>
                <Label>Correct Answer</Label>
                <Input
                  value={question.correctAnswer as string}
                  onChange={(e) => updateQuestion(index, 'correctAnswer', e.target.value)}
                  placeholder="Enter the correct answer..."
                  className="mt-1"
                />
              </div>
            )}
            
            <div>
              <Label>Explanation (Optional)</Label>
              <Textarea
                value={question.explanation || ''}
                onChange={(e) => updateQuestion(index, 'explanation', e.target.value)}
                placeholder="Explain why this is the correct answer..."
                rows={2}
                className="mt-1"
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  const renderSettings = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Quiz Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
              <Input
                id="timeLimit"
                type="number"
                min="1"
                value={settings.timeLimit || ''}
                onChange={(e) => setSettings({...settings, timeLimit: parseInt(e.target.value) || undefined})}
                placeholder="No time limit"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="attempts">Attempts Allowed</Label>
              <Input
                id="attempts"
                type="number"
                min="1"
                value={settings.attemptsAllowed}
                onChange={(e) => setSettings({...settings, attemptsAllowed: parseInt(e.target.value) || 1})}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="passingScore">Passing Score (%)</Label>
              <Input
                id="passingScore"
                type="number"
                min="0"
                max="100"
                value={settings.passingScore || ''}
                onChange={(e) => setSettings({...settings, passingScore: parseInt(e.target.value) || undefined})}
                placeholder="No passing score required"
                className="mt-1"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="showScore">Show Score Immediately</Label>
              <Switch
                id="showScore"
                checked={settings.showScoreImmediately}
                onCheckedChange={(checked) => setSettings({...settings, showScoreImmediately: checked})}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="showAnswers">Show Correct Answers</Label>
              <Switch
                id="showAnswers"
                checked={settings.showCorrectAnswers}
                onCheckedChange={(checked) => setSettings({...settings, showCorrectAnswers: checked})}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="randomize">Randomize Questions</Label>
              <Switch
                id="randomize"
                checked={settings.randomizeQuestions}
                onCheckedChange={(checked) => setSettings({...settings, randomizeQuestions: checked})}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="requireLogin">Require Login</Label>
              <Switch
                id="requireLogin"
                checked={settings.requireLogin}
                onCheckedChange={(checked) => setSettings({...settings, requireLogin: checked})}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderSuccess = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-600">
          <Eye className="w-5 h-5" />
          Quiz Created Successfully!
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 mb-2">{createdQuiz?.quiz?.title}</h3>
          <p className="text-green-700 text-sm mb-4">{createdQuiz?.quiz?.description}</p>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-white rounded p-3 border">
              <div>
                <Label className="text-sm font-medium">Shareable Link</Label>
                <p className="text-xs text-gray-600 mt-1">Students can access the quiz using this link</p>
              </div>
              <Button onClick={copyShareableLink} size="sm" variant="outline">
                <Copy className="w-4 h-4 mr-2" />
                Copy Link
              </Button>
            </div>
            
            <div className="bg-gray-50 rounded p-3 border font-mono text-sm break-all">
              {createdQuiz?.shareableLink}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">{questions.length}</div>
            <div className="text-sm text-blue-800">Questions</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-600">
              {questions.reduce((sum, q) => sum + q.points, 0)}
            </div>
            <div className="text-sm text-purple-800">Total Points</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-orange-600">
              {settings.timeLimit || '∞'}
            </div>
            <div className="text-sm text-orange-800">Time Limit (min)</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">{settings.attemptsAllowed}</div>
            <div className="text-sm text-green-800">Attempts</div>
          </div>
        </div>
        
        <div className="flex gap-4">
          <Button onClick={() => router.push('/dashboard')} className="flex-1">
            <BarChart3 className="w-4 h-4 mr-2" />
            View Dashboard
          </Button>
          <Button 
            onClick={() => router.push(`/quiz/${createdQuiz?.quiz?.shareableLink}`)} 
            variant="outline"
            className="flex-1"
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview Quiz
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Quiz</h1>
          <p className="text-gray-600">Create engaging quizzes with shareable links for your students</p>
        </div>

        {/* Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${activeStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}
                `}>
                  {step}
                </div>
                {step < 4 && (
                  <div className={`w-12 h-1 mx-2 ${activeStep > step ? 'bg-blue-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="space-y-6">
          {activeStep === 1 && renderBasicInfo()}
          {activeStep === 2 && renderQuestions()}
          {activeStep === 3 && renderSettings()}
          {activeStep === 4 && renderSuccess()}
        </div>

        {/* Navigation */}
        {activeStep < 4 && (
          <div className="flex justify-between mt-8">
            <Button 
              variant="outline" 
              onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
              disabled={activeStep === 1}
            >
              Previous
            </Button>
            
            {activeStep === 3 ? (
              <Button 
                onClick={handleCreateQuiz}
                disabled={loading}
                className="px-8"
              >
                {loading ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Creating Quiz...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Create Quiz
                  </>
                )}
              </Button>
            ) : (
              <Button 
                onClick={() => setActiveStep(Math.min(3, activeStep + 1))}
              >
                Next
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

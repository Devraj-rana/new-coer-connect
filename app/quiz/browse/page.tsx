"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  Clock, 
  Users, 
  BookOpen, 
  PlayCircle,
  Star,
  Calendar,
  User
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";

interface QuizPreview {
  _id: string;
  title: string;
  description: string;
  teacher: string;
  shareableLink: string;
  questionsCount: number;
  settings: {
    timeLimit?: number;
    attemptsAllowed: number;
    requireLogin: boolean;
  };
  subject?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  createdAt: Date;
  submissions?: number;
}

export default function QuizBrowsePage() {
  const [quizzes, setQuizzes] = useState<QuizPreview[]>([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState<QuizPreview[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Mock data for demo (replace with actual API call)
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        // For now, using mock data. Replace with actual API call
        const mockQuizzes: QuizPreview[] = [
          {
            _id: "1",
            title: "JavaScript Fundamentals",
            description: "Test your knowledge of JavaScript basics including variables, functions, and objects.",
            teacher: "Dr. Sarah Johnson",
            shareableLink: "js-fundamentals-2024",
            questionsCount: 15,
            settings: {
              timeLimit: 30,
              attemptsAllowed: 3,
              requireLogin: true
            },
            subject: "Computer Science",
            difficulty: "Medium",
            createdAt: new Date(),
            submissions: 42
          },
          {
            _id: "2",
            title: "Data Structures Quiz",
            description: "Arrays, linked lists, stacks, and queues - test your understanding of fundamental data structures.",
            teacher: "Prof. Mike Chen",
            shareableLink: "data-structures-101",
            questionsCount: 20,
            settings: {
              timeLimit: 45,
              attemptsAllowed: 2,
              requireLogin: true
            },
            subject: "Computer Science",
            difficulty: "Hard",
            createdAt: new Date(),
            submissions: 28
          },
          {
            _id: "3",
            title: "English Grammar Basics",
            description: "Review fundamental English grammar rules and common usage patterns.",
            teacher: "Dr. Emma Wilson",
            shareableLink: "english-grammar-basic",
            questionsCount: 12,
            settings: {
              timeLimit: 20,
              attemptsAllowed: 5,
              requireLogin: false
            },
            subject: "English",
            difficulty: "Easy",
            createdAt: new Date(),
            submissions: 67
          }
        ];

        setQuizzes(mockQuizzes);
        setFilteredQuizzes(mockQuizzes);
      } catch (error) {
        console.error("Error fetching quizzes:", error);
        toast({
          title: "Error",
          description: "Failed to load quizzes. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  // Filter quizzes based on search and filters
  useEffect(() => {
    let filtered = quizzes;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(quiz => 
        quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quiz.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quiz.teacher.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Subject filter
    if (subjectFilter !== "all") {
      filtered = filtered.filter(quiz => quiz.subject === subjectFilter);
    }

    // Difficulty filter
    if (difficultyFilter !== "all") {
      filtered = filtered.filter(quiz => quiz.difficulty === difficultyFilter);
    }

    setFilteredQuizzes(filtered);
  }, [searchTerm, subjectFilter, difficultyFilter, quizzes]);

  const handleTakeQuiz = (shareableLink: string) => {
    router.push(`/quiz/${shareableLink}`);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSubjects = () => {
    const subjectsSet = new Set(quizzes.map(quiz => quiz.subject).filter(Boolean));
    return Array.from(subjectsSet) as string[];
  };

  if (loading) {
    return (
      <div className="pt-20 min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading quizzes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Browse Quizzes</h1>
          <p className="text-gray-600">Discover and take quizzes created by fellow teachers</p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search quizzes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Subject Filter */}
              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {getSubjects().map(subject => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Difficulty Filter */}
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Difficulties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulties</SelectItem>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>

              {/* Results Count */}
              <div className="flex items-center text-gray-600">
                <Filter className="h-4 w-4 mr-2" />
                {filteredQuizzes.length} quiz{filteredQuizzes.length !== 1 ? 'es' : ''} found
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quiz Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz) => (
            <Card key={quiz._id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-lg line-clamp-2">{quiz.title}</CardTitle>
                  {quiz.difficulty && (
                    <Badge className={getDifficultyColor(quiz.difficulty)}>
                      {quiz.difficulty}
                    </Badge>
                  )}
                </div>
                <p className="text-gray-600 text-sm line-clamp-3">{quiz.description}</p>
              </CardHeader>
              <CardContent>
                {/* Quiz Info */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="h-4 w-4 mr-2" />
                    {quiz.teacher}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <BookOpen className="h-4 w-4 mr-2" />
                    {quiz.questionsCount} questions
                  </div>

                  {quiz.settings.timeLimit && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      {quiz.settings.timeLimit} minutes
                    </div>
                  )}

                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    {quiz.submissions || 0} attempts
                  </div>

                  {quiz.subject && (
                    <Badge variant="outline" className="text-xs">
                      {quiz.subject}
                    </Badge>
                  )}
                </div>

                {/* Action Button */}
                <Button 
                  onClick={() => handleTakeQuiz(quiz.shareableLink)}
                  className="w-full"
                >
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Take Quiz
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredQuizzes.length === 0 && !loading && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No quizzes found</h3>
            <p className="text-gray-500 mb-4">
              Try adjusting your search criteria or create a new quiz to get started.
            </p>
            <Button onClick={() => router.push('/quiz/create')}>
              Create New Quiz
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

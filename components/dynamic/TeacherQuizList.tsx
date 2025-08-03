"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { 
  FileText, 
  Users, 
  Clock, 
  Copy, 
  BarChart3, 
  Plus,
  ExternalLink,
  Trophy,
  Calendar
} from "lucide-react";
import { useEffect, useState } from "react";
import { getTeacherQuizzes } from "@/lib/quizActions";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";

interface TeacherQuizListProps {
  userId?: string;
}

interface QuizData {
  _id: string;
  title: string;
  description: string;
  classId?: string;
  questionsCount: number;
  submissionsCount: number;
  settings: {
    timeLimit?: number;
    attemptsAllowed: number;
    requireLogin: boolean;
  };
  shareableLink: string;
  createdAt: string;
  averageScore: number;
}

export default function TeacherQuizList({ userId }: TeacherQuizListProps) {
  const [quizzes, setQuizzes] = useState<QuizData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchQuizzes() {
      try {
        setLoading(true);
        const data = await getTeacherQuizzes(userId);
        setQuizzes(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load quizzes");
      } finally {
        setLoading(false);
      }
    }

    fetchQuizzes();
  }, [userId]);

  const copyShareableLink = (link: string, title: string) => {
    navigator.clipboard.writeText(link);
    toast({
      title: "Link Copied!",
      description: `Shareable link for "${title}" copied to clipboard`,
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-9 w-24" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="h-4 w-full mb-2" />
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            My Quizzes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Error loading quizzes: {error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            My Quizzes ({quizzes.length})
          </CardTitle>
          <Link href="/quiz/create">
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Create Quiz
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {quizzes.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">No Quizzes Created</h3>
            <p className="text-muted-foreground mb-4">
              Create your first quiz to engage students with interactive assessments.
            </p>
            <Link href="/quiz/create">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Quiz
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {quizzes.map((quiz) => (
              <div key={quiz._id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{quiz.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {quiz.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Badge variant={quiz.submissionsCount > 0 ? "default" : "secondary"}>
                          {quiz.submissionsCount} submission{quiz.submissionsCount !== 1 ? 's' : ''}
                        </Badge>
                        {quiz.averageScore > 0 && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Trophy className="w-3 h-3" />
                            {quiz.averageScore}% avg
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <FileText className="w-4 h-4" />
                    <span>{quiz.questionsCount} questions</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{quiz.submissionsCount} submissions</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>
                      {quiz.settings.timeLimit ? `${quiz.settings.timeLimit}m limit` : 'No time limit'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(quiz.createdAt)}</span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded p-3 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-xs font-medium text-gray-600">Shareable Link</Label>
                      <p className="text-xs text-gray-500 mt-1">Students can access the quiz using this link</p>
                    </div>
                    <Button 
                      onClick={() => copyShareableLink(quiz.shareableLink, quiz.title)}
                      size="sm" 
                      variant="outline"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                  <div className="bg-white rounded border p-2 mt-2 font-mono text-xs break-all">
                    {quiz.shareableLink}
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <Link href={quiz.shareableLink} target="_blank">
                      <Button variant="outline" size="sm">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                    </Link>
                    
                    <Link href={`/quiz/results/${quiz._id}`}>
                      <Button variant="outline" size="sm">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Results
                      </Button>
                    </Link>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {quiz.settings.requireLogin ? (
                      <Badge variant="outline" className="text-xs">Login Required</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">Public Access</Badge>
                    )}
                    <span>•</span>
                    <span>{quiz.settings.attemptsAllowed} attempt{quiz.settings.attemptsAllowed > 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="text-center pt-4">
              <Link href="/quiz/create">
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Another Quiz
                </Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
